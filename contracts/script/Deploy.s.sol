// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/src/Script.sol";
import "../src/CyberFortuneNFT.sol";

/**
 * @title DeployScript
 * @dev 部署 CyberFortuneNFT 合约的脚本
 */
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address authorizedSigner = vm.envAddress("AUTHORIZED_SIGNER");

        vm.startBroadcast(deployerPrivateKey);

        CyberFortuneNFT nft = new CyberFortuneNFT();
        nft.setAuthorizedSigner(authorizedSigner);

        vm.stopBroadcast();

        console.log("CyberFortuneNFT deployed to:", address(nft));
        console.log("Authorized signer set to:", authorizedSigner);
    }
}
