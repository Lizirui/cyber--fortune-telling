// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/src/Test.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../src/CyberFortuneNFT.sol";

contract CyberFortuneNFTTest is Test {
    using MessageHashUtils for bytes32;

    CyberFortuneNFT public nft;
    address public owner;
    address public user1;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        nft = new CyberFortuneNFT();
        // 设置授权签名者为测试合约
        nft.setAuthorizedSigner(owner);
    }

    function test_DeployWithCorrectName() public {
        assertEq(nft.name(), "Cyber Fortune");
    }

    function test_DeployWithCorrectSymbol() public {
        assertEq(nft.symbol(), "CFORTUNE");
    }

    /**
     * @dev 测试 ERC-2981 版税接口
     */
    function test_SupportERC2981() public {
        // 检查是否支持 ERC-2981 接口
        bytes4 interfaceId = bytes4(0x2a55205a);
        assertTrue(nft.supportsInterface(interfaceId));

        // 检查版税信息
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(0, 1 ether);
        assertEq(receiver, owner);
        assertEq(royaltyAmount, 0.05 ether); // 5%
    }
}
