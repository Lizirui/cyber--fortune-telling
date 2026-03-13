// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CyberFortuneNFT.sol";

/**
 * @title DeployScript
 * @dev 部署 CyberFortuneNFT 合约的脚本
 */
contract DeployScript is Script {
    /**
     * @dev 运行部署脚本
     */
    function run() external {
        // 获取部署私钥
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // 获取授权签名者地址
        address authorizedSigner = vm.envAddress("AUTHORIZED_SIGNER");

        // 开始广播
        vm.startBroadcast(deployerPrivateKey);

        // 部署合约
        CyberFortuneNFT nft = new CyberFortuneNFT();
        // 设置授权签名者
        nft.setAuthorizedSigner(authorizedSigner);

        // 停止广播
        vm.stopBroadcast();

        // 输出部署地址
        console.log("CyberFortuneNFT deployed to:", address(nft));
    }
}
