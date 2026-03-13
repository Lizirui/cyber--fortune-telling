// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/src/Test.sol";
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
        nft.mint{value: 0.01 ether}("Blessing", 1);

        assertEq(nft.ownerOf(0), user1);
    }

    function test_MintWithSignature() public {
        // 签名验证测试
        vm.deal(user1, 1 ether);
        vm.prank(user1);

        string memory blessing = "Blessing";
        uint8 rarity = 3;
        uint256 expiresAt = block.timestamp + 3600;
        uint256 nonce = 0;

        bytes32 hash = keccak256(abi.encodePacked(blessing, rarity, expiresAt, nonce, user1));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(uint160(owner)), hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        nft.mintWithSignature{value: 0.01 ether}(blessing, rarity, expiresAt, signature);
        assertEq(nft.ownerOf(0), user1);
    }
}
