# Phase 2: 智能合约实现计划

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**目标:** 在 contracts 包中使用 Foundry 开发并部署 ERC-721 NFT 合约。

**架构:** 单个智能合约 `CyberFortuneNFT.sol`，实现 ERC-721、ERC-2981 和市场功能。使用 OpenZeppelin 合约库。

**技术栈:** Foundry (Forge), Solidity, OpenZeppelin

---

## 任务 1: 编写基础 NFT 合约测试 (TDD)

**文件：**

- 修改: `contracts/test/CyberFortuneNFT.t.sol`

- [ ] **步骤 1: 编写失败的测试**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CyberFortuneNFT.sol";

contract CyberFortuneNFTTest is Test {
    CyberFortuneNFT public nft;
    address public owner;
    address public user1;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        nft = new CyberFortuneNFT();
    }

    function test_DeployWithCorrectName() public {
        assertEq(nft.name(), "Cyber Fortune");
    }

    function test_DeployWithCorrectSymbol() public {
        assertEq(nft.symbol(), "CFORTUNE");
    }

    function test_MintNFT() public {
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        nft.mint{value: 0.01 ether}("测试祝福语", 1);

        assertEq(nft.ownerOf(0), user1);
    }
}
```

- [ ] **步骤 2: 运行测试验证失败**

```bash
cd contracts && pnpm test
```

预期结果: FAIL - "Failed to compile" (因为合约还没实现)

- [ ] **步骤 3: 提交**

```bash
git add contracts/test/
git commit -m "test: add failing NFT tests"
```

---

## 任务 2: 实现基础 NFT 合约

**文件：**

- 修改: `contracts/src/CyberFortuneNFT.sol`

- [ ] **步骤 1: 编写基础 NFT 合约**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_FEE = 0.01 ether;

    mapping(uint256 => string) public blessings;
    mapping(uint256 => uint8) public rarities;

    constructor() ERC721("Cyber Fortune", "CFORTUNE") Ownable(msg.sender) {}

    function mint(string calldata blessing, uint8 rarity) external payable {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json,",
            '{"name":"Fortune #', Strings.toString(tokenId), '"}'
        ));
    }
}
```

- [ ] **步骤 2: 运行测试验证通过**

```bash
cd contracts && pnpm test
```

预期结果: PASS

- [ ] **步骤 3: 提交**

```bash
git add contracts/src/
git commit -m "feat: add basic NFT contract"
```

---

## 任务 3: 添加签名验证测试

**文件：**

- 修改: `contracts/test/CyberFortuneNFT.t.sol`

- [ ] **步骤 1: 添加签名测试**

```solidity
function test_MintWithSignature() public {
    // 签名验证测试
    vm.deal(user1, 1 ether);
    vm.prank(user1);

    bytes32 hash = keccak256(abi.encodePacked("祝福语", 3, block.timestamp + 3600, 0, user1));
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(uint160(owner)), hash);
    bytes memory signature = abi.encodePacked(r, s, v);

    nft.mintWithSignature{value: 0.01 ether}("祝福语", 3, block.timestamp + 3600, signature);
    assertEq(nft.ownerOf(0), user1);
}
```

- [ ] **步骤 2: 运行测试验证失败**

```bash
cd contracts && pnpm test
```

预期结果: FAIL

- [ ] **步骤 3: 提交**

```bash
git commit -m "test: add signature verification tests"
```

---

## 任务 4: 实现签名验证

**文件：**

- 修改: `contracts/src/CyberFortuneNFT.sol`

- [ ] **步骤 1: 添加签名验证和限制**

```solidity
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, Ownable, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    address public authorizedSigner;
    mapping(bytes => bool) public usedSignatures;

    mapping(address => uint256) public dailyMintedCount;
    mapping(address => uint256) public lastMintDay;
    mapping(address => uint256) public txMintCount;

    uint256 public constant MAX_DAILY_MINT = 10;
    uint256 public constant MAX_MINT_PER_TX = 5;

    constructor() EIP712("CyberFortuneNFT", "1") {}

    function setAuthorizedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        authorizedSigner = _signer;
    }

    function mintWithSignature(
        string calldata blessing,
        uint8 rarity,
        uint256 expiresAt,
        bytes calldata signature
    ) external payable nonReentrant {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(block.timestamp < expiresAt, "Signature expired");
        require(rarity <= 5, "Invalid rarity");
        require(txMintCount[msg.sender] < MAX_MINT_PER_TX, "Max mint per tx");

        txMintCount[msg.sender]++;

        bytes32 hash = keccak256(abi.encodePacked(blessing, rarity, expiresAt, _nextTokenId, msg.sender));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();

        require(ethSignedHash.recover(signature) == authorizedSigner, "Invalid signature");
        require(!usedSignatures[signature], "Signature already used");

        usedSignatures[signature] = true;
        _checkMintLimit();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
    }

    function _checkMintLimit() internal {
        uint256 today = block.timestamp / 86400;
        if (lastMintDay[msg.sender] != today) {
            dailyMintedCount[msg.sender] = 0;
            lastMintDay[msg.sender] = today;
        }
        require(dailyMintedCount[msg.sender] < MAX_DAILY_MINT, "Daily mint limit");
        dailyMintedCount[msg.sender]++;
    }

    function _afterTokenTransfer(address, address, uint256, uint256) internal override {
        txMintCount[tx.origin] = 0;
    }
}
```

- [ ] **步骤 2: 运行测试验证通过**

```bash
cd contracts && pnpm test
```

- [ ] **步骤 3: 提交**

```bash
git add contracts/src/
git commit -m "feat: add signature verification and mint limits"
```

---

## 任务 5: 实现市场功能

**文件：**

- 修改: `contracts/src/CyberFortuneNFT.sol`

- [ ] **步骤 1: 添加市场功能**

```solidity
struct Listing {
    address seller;
    uint256 price;
    bool isListed;
}

mapping(uint256 => Listing) public listings;
mapping(address => uint256) public creatorRevenue;

event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
event ItemBought(uint256 indexed tokenId, address indexed buyer, uint256 price);
event ListingCancelled(uint256 indexed tokenId);

function listItem(uint256 tokenId, uint256 price) external {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    require(price > 0, "Price must be > 0");
    require(!listings[tokenId].isListed, "Already listed");

    approve(address(this), tokenId);
    listings[tokenId] = Listing(msg.sender, price, true);
    emit ItemListed(tokenId, msg.sender, price);
}

function buyItem(uint256 tokenId) external payable nonReentrant {
    Listing memory listing = listings[tokenId];
    require(listing.isListed, "Not listed");
    require(msg.value >= listing.price, "Insufficient payment");
    require(getApproved(tokenId) == address(this), "Not approved");

    (uint256 royaltyAmount, ) = royaltyInfo(tokenId, listing.price);
    uint256 sellerAmount = listing.price - royaltyAmount;

    _transfer(listing.seller, msg.sender, tokenId);
    payable(listing.seller).transfer(sellerAmount);
    creatorRevenue[owner()] += royaltyAmount;

    delete listings[tokenId];
    emit ItemBought(tokenId, msg.sender, listing.price);
}

function cancelListing(uint256 tokenId) external {
    require(listings[tokenId].seller == msg.sender, "Not seller");
    require(listings[tokenId].isListed, "Not listed");
    delete listings[tokenId];
    emit ListingCancelled(tokenId);
}

function getListing(uint256 tokenId) external view returns (address, uint256, bool) {
    Listing memory l = listings[tokenId];
    return (l.seller, l.price, l.isListed);
}

function withdrawRevenue() external onlyOwner nonReentrant {
    uint256 amount = creatorRevenue[owner()];
    require(amount > 0, "No revenue");
    creatorRevenue[owner()] = 0;
    payable(owner()).transfer(amount);
}
```

- [ ] **步骤 2: 添加市场测试**

```solidity
function test_ListItem() public {
    vm.deal(user1, 1 ether);
    vm.prank(user1);
    nft.mint{value: 0.01 ether}("祝福语", 1);

    vm.prank(user1);
    nft.approve(address(nft), 0);
    nft.listItem(0, 0.1 ether);

    (address seller, uint256 price, bool isListed) = nft.getListing(0);
    assertEq(seller, user1);
    assertTrue(isListed);
}
```

- [ ] **步骤 3: 运行测试**

```bash
cd contracts && pnpm test
```

- [ ] **步骤 4: 提交**

```bash
git add contracts/
git commit -m "feat: add marketplace functionality"
```

---

## 任务 6: 实现 ERC-2981 版税

**文件：**

- 修改: `contracts/src/CyberFortuneNFT.sol`

- [ ] **步骤 1: 添加 ERC-2981**

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, ERC2981, Ownable, EIP712, ReentrancyGuard {
    constructor() ERC721("Cyber Fortune", "CFORTUNE") Ownable(msg.sender) {
        _setDefaultRoyalty(owner(), 500); // 5%
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

- [ ] **步骤 2: 添加 ERC-2981 测试**

```solidity
function test_SupportERC2981() public {
    bytes4 interfaceId = bytes4(0x2a55205a);
    assertTrue(nft.supportsInterface(interfaceId));

    (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(0, 1 ether);
    assertEq(receiver, owner);
    assertEq(royaltyAmount, 0.05 ether);
}
```

- [ ] **步骤 3: 运行测试**

```bash
cd contracts && pnpm test
```

- [ ] **步骤 4: 提交**

```bash
git add contracts/
git commit -m "feat: add ERC-2981 royalty support"
```

---

## 任务 7: 创建部署脚本

**文件：**

- 修改: `contracts/script/Deploy.s.sol`

- [ ] **步骤 1: 编写部署脚本**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CyberFortuneNFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address authorizedSigner = vm.envAddress("AUTHORIZED_SIGNER");

        vm.startBroadcast(deployerPrivateKey);

        CyberFortuneNFT nft = new CyberFortuneNFT();
        nft.setAuthorizedSigner(authorizedSigner);

        vm.stopBroadcast();

        console.log("CyberFortuneNFT deployed to:", address(nft));
    }
}
```

- [ ] **步骤 2: 提交**

```bash
git add contracts/script/
git commit -m "chore: add deployment script"
```

---

## 任务 8: 最终验证

- [ ] **步骤 1: 运行完整测试**

```bash
cd contracts && pnpm test
```

- [ ] **步骤 2: 提交**

```bash
git add .
git commit -m "feat: complete CyberFortuneNFT contract"
```

---

## 总结

本计划交付：
- ✅ ERC-721 NFT 合约
- ✅ 签名验证 (防篡改)
- ✅ Mint 限制 (10/天, 5/笔交易)
- ✅ 链上市场
- ✅ ERC-2981 版税 (5%)
- ✅ Foundry 部署脚本
