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
        nft.mint{value: 0.01 ether}("Blessing", 1);

        assertEq(nft.ownerOf(0), user1);
    }

    // TODO: 签名验证测试需要修复
    // function test_MintWithSignature() public {
    //     // 设置授权签名者
    //     nft.setAuthorizedSigner(owner);
    //     // ...
    // }

    /**
     * @dev 测试挂单功能
     */
    function test_ListItem() public {
        // 先 mint 一个 NFT
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        nft.mint{value: 0.01 ether}("Blessing", 1);

        // 授权合约
        vm.prank(user1);
        nft.approve(address(nft), 0);

        // 挂单
        vm.prank(user1);
        nft.listItem(0, 0.1 ether);

        // 验证挂单信息
        (address seller, uint256 price, bool isListed) = nft.getListing(0);
        assertEq(seller, user1);
        assertEq(price, 0.1 ether);
        assertTrue(isListed);
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
