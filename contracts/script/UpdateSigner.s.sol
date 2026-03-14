// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/src/Script.sol";
import "../src/CyberFortuneNFT.sol";

/**
 * @title UpdateSignerScript
 * @dev 更新 CyberFortuneNFT 合约的授权签名者
 */
contract UpdateSignerScript is Script {
    function run() external {
        // 获取部署私钥
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyStr);

        // 获取合约地址
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");

        // 获取新的授权签名者地址
        address newSigner = vm.envAddress("NEW_AUTHORIZED_SIGNER");

        // 开始广播
        vm.startBroadcast(deployerPrivateKey);

        // 连接到已部署的合约
        CyberFortuneNFT nft = CyberFortuneNFT(contractAddress);

        // 更新授权签名者
        nft.setAuthorizedSigner(newSigner);

        // 停止广播
        vm.stopBroadcast();

        // 输出结果
        console.log("Updated authorized signer to:", newSigner);
    }

    function _parsePrivateKey(string memory key) internal pure returns (uint256) {
        bytes memory b = bytes(key);
        require(b.length == 64 || b.length == 66, "Invalid private key length");

        uint256 result = 0;
        uint256 start = (b.length == 66 && b[0] == "0" && b[1] == "x") ? 2 : 0;

        for (uint256 i = start; i < b.length; i++) {
            result = result << 4;
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                c = c - 48;
            } else if (c >= 65 && c <= 70) {
                c = c - 55;
            } else if (c >= 97 && c <= 102) {
                c = c - 87;
            } else {
                revert("Invalid hex character");
            }
            result = result | c;
        }
        return result;
    }
}
