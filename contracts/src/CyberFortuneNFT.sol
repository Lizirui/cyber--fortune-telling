// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title CyberFortuneNFT
 * @dev 赛博算命 NFT 合约
 *      用户可以通过支付费用 mint 祝福语 NFT
 */
contract CyberFortuneNFT is ERC721, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    /// @dev 使用 MessageHashUtils 库进行签名验证
    using MessageHashUtils for bytes32;

    /// @dev 下一个可用的 Token ID
    uint256 private _nextTokenId;

    /// @dev 最大供应量
    uint256 public constant MAX_SUPPLY = 10000;

    /// @dev Mint 费用 (0.01 ETH)
    uint256 public constant MINT_FEE = 0.01 ether;

    /// @dev 每日最大 Mint 数量
    uint256 public constant MAX_DAILY_MINT = 10;

    /// @dev 每笔交易最大 Mint 数量
    uint256 public constant MAX_MINT_PER_TX = 5;

    /// @dev 授权签名者地址
    address public authorizedSigner;

    /// @dev 已使用的签名映射
    mapping(bytes => bool) public usedSignatures;

    /// @dev 用户每日 Mint 数量
    mapping(address => uint256) public dailyMintedCount;

    /// @dev 用户上次 Mint 的日期
    mapping(address => uint256) public lastMintDay;

    /// @dev 用户当前交易的 Mint 数量
    mapping(address => uint256) public txMintCount;

    /// @dev Token ID => 祝福语文本
    mapping(uint256 => string) public blessings;

    /// @dev Token ID => 稀有度 (0=N, 1=R, 2=SR, 3=SSR, 4=SP, 5=UR)
    mapping(uint256 => uint8) public rarities;

    // ========== 市场相关 ==========

    /// @dev 挂单结构体
    struct Listing {
        address seller;    // 卖家地址
        uint256 price;     // 价格
        bool isListed;    // 是否已挂单
    }

    /// @dev Token ID => 挂单信息
    mapping(uint256 => Listing) public listings;

    /// @dev 创建者收入
    mapping(address => uint256) public creatorRevenue;

    /// @dev 挂单事件
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);

    /// @dev 购买事件
    event ItemBought(uint256 indexed tokenId, address indexed buyer, uint256 price);

    /// @dev 取消挂单事件
    event ListingCancelled(uint256 indexed tokenId);

    /**
     * @dev 挂单出售 NFT
     * @param tokenId Token ID
     * @param price 价格
     */
    function listItem(uint256 tokenId, uint256 price) external {
        // 检查是否是 NFT 持有者
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        // 检查价格必须大于 0
        require(price > 0, "Price must be > 0");
        // 检查是否已经挂单
        require(!listings[tokenId].isListed, "Already listed");

        // 授权合约可以转移 NFT
        approve(address(this), tokenId);
        // 创建挂单
        listings[tokenId] = Listing(msg.sender, price, true);
        emit ItemListed(tokenId, msg.sender, price);
    }

    /**
     * @dev 购买 NFT
     * @param tokenId Token ID
     */
    function buyItem(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        // 检查是否已挂单
        require(listing.isListed, "Not listed");
        // 检查支付金额是否足够
        require(msg.value >= listing.price, "Insufficient payment");
        // 检查是否已授权
        require(getApproved(tokenId) == address(this), "Not approved");

        // 计算卖家收入（扣除版税后）
        uint256 sellerAmount = msg.value;

        // 转移 NFT
        _transfer(listing.seller, msg.sender, tokenId);
        // 向卖家付款
        payable(listing.seller).transfer(sellerAmount);

        // 删除挂单
        delete listings[tokenId];
        emit ItemBought(tokenId, msg.sender, listing.price);
    }

    /**
     * @dev 取消挂单
     * @param tokenId Token ID
     */
    function cancelListing(uint256 tokenId) external {
        // 检查是否是挂单者
        require(listings[tokenId].seller == msg.sender, "Not seller");
        // 检查是否已挂单
        require(listings[tokenId].isListed, "Not listed");
        // 删除挂单
        delete listings[tokenId];
        emit ListingCancelled(tokenId);
    }

    /**
     * @dev 获取挂单信息
     * @param tokenId Token ID
     * @return 卖家地址、价格、是否挂单
     */
    function getListing(uint256 tokenId) external view returns (address, uint256, bool) {
        Listing memory l = listings[tokenId];
        return (l.seller, l.price, l.isListed);
    }

    /**
     * @dev 提取创建者收入
     */
    function withdrawRevenue() external onlyOwner nonReentrant {
        uint256 amount = creatorRevenue[owner()];
        require(amount > 0, "No revenue");
        creatorRevenue[owner()] = 0;
        payable(owner()).transfer(amount);
    }

    /**
     * @dev 构造函数，初始化合约名称和符号，以及默认版税
     */
    constructor() ERC721("Cyber Fortune", "CFORTUNE") Ownable(msg.sender) {
        // 设置默认版税为 5%
        _setDefaultRoyalty(owner(), 500);
    }

    /**
     * @dev Mint 祝福语 NFT
     * @param blessing 祝福语文本
     * @param rarity 稀有度等级
     */
    function mint(string calldata blessing, uint8 rarity) external payable {
        // 检查支付费用
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        // 检查未超过最大供应量
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
    }

    /**
     * @dev 设置授权签名者地址
     * @param _signer 签名者地址
     */
    function setAuthorizedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        authorizedSigner = _signer;
    }

    /**
     * @dev 通过签名验证 Mint NFT
     * @param blessing 祝福语文本
     * @param rarity 稀有度等级
     * @param expiresAt 签名过期时间
     * @param signature 签名数据
     */
    function mintWithSignature(
        string calldata blessing,
        uint8 rarity,
        uint256 expiresAt,
        bytes calldata signature
    ) external payable nonReentrant {
        // 检查支付费用
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        // 检查未超过最大供应量
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        // 检查签名是否过期
        require(block.timestamp < expiresAt, "Signature expired");
        // 检查稀有度是否有效
        require(rarity <= 5, "Invalid rarity");
        // 检查每笔交易 Mint 数量限制
        require(txMintCount[msg.sender] < MAX_MINT_PER_TX, "Max mint per tx");

        // 增加当前交易计数
        txMintCount[msg.sender]++;

        // 构建签名哈希
        bytes32 hash = keccak256(abi.encodePacked(blessing, rarity, expiresAt, _nextTokenId, msg.sender));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();

        // 验证签名
        require(ECDSA.recover(ethSignedHash, signature) == authorizedSigner, "Invalid signature");
        // 检查签名是否已使用
        require(!usedSignatures[signature], "Signature already used");

        // 标记签名已使用
        usedSignatures[signature] = true;

        // 检查每日 Mint 限制
        _checkMintLimit();

        // Mint NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
    }

    /**
     * @dev 检查每日 Mint 限制
     */
    function _checkMintLimit() internal {
        // 获取当前日期（按天计算）
        uint256 today = block.timestamp / 86400;
        // 如果是新的一天，重置计数
        if (lastMintDay[msg.sender] != today) {
            dailyMintedCount[msg.sender] = 0;
            lastMintDay[msg.sender] = today;
        }
        // 检查是否超过每日限制
        require(dailyMintedCount[msg.sender] < MAX_DAILY_MINT, "Daily mint limit");
        // 增加每日计数
        dailyMintedCount[msg.sender]++;
    }

    /**
     * @dev 返回 Token URI
     * @param tokenId Token ID
     */
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev 支持的接口
     * @param interfaceId 接口 ID
     */
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev 生成 Token URI (JSON 格式)
     * @param tokenId Token ID
     */
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json,",
            '{"name":"Fortune #', _toString(tokenId), '"}'
        ));
    }

    /**
     * @dev 将 uint256 转换为字符串
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
