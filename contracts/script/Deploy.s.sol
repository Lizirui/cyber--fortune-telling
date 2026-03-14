// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/src/Script.sol";
import "../src/CyberFortuneNFT.sol";

/**
 * @title DeployScript
 * @dev 部署 CyberFortuneNFT 合约的脚本
 */
contract DeployScript is Script {
    // 项目根目录路径
    string constant ROOT_PATH = "./";
    string constant FRONTEND_ENV_PATH = "../frontend/.env";
    string constant BACKEND_ENV_PATH = "../backend/.env";

    /**
     * @dev 运行部署脚本
     */
    function run() external {
        // 获取部署私钥 (支持带或不带 0x 前缀)
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyStr);
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

        // 自动更新 env 文件
        _updateEnvFiles(address(nft));
    }

    /**
     * @dev 更新 frontend 和 backend 的 .env 文件
     */
    function _updateEnvFiles(address contractAddress) internal {
        string memory addr = vm.toString(contractAddress);

        // 更新 frontend/.env
        _updateEnvValue(FRONTEND_ENV_PATH, "NEXT_PUBLIC_CONTRACT_ADDRESS", addr);
        // 更新 backend/.env
        _updateEnvValue(BACKEND_ENV_PATH, "CONTRACT_ADDRESS", addr);

        console.log("Updated env files with contract address:", addr);
    }

    /**
     * @dev 更新单个 env 文件中的指定字段
     */
    function _updateEnvValue(string memory filePath, string memory key, string memory value) internal {
        string memory fullPath = string(abi.encodePacked(ROOT_PATH, filePath));
        vm.writeFile(fullPath, ""); // ensure file exists

        string memory fileContent = vm.readFile(fullPath);
        string memory searchKey = key;
        string memory newLine = string(abi.encodePacked(searchKey, "=", value));

        // 检查是否已存在该 key
        bool keyExists = _containsKey(fileContent, searchKey);

        if (keyExists) {
            // 替换现有值
            string memory newContent = _replaceEnvValue(fileContent, searchKey, value);
            vm.writeFile(fullPath, newContent);
        } else {
            // 追加新行
            string memory newContent = string(abi.encodePacked(fileContent, "\n", newLine, "\n"));
            vm.writeFile(fullPath, newContent);
        }
    }

    /**
     * @dev 检查文件内容是否包含指定 key
     */
    function _containsKey(string memory content, string memory key) internal pure returns (bool) {
        bytes memory contentBytes = bytes(content);
        bytes memory keyBytes = bytes(key);

        for (uint i = 0; i <= contentBytes.length - keyBytes.length; i++) {
            bool isMatch = true;
            for (uint j = 0; j < keyBytes.length; j++) {
                if (contentBytes[i + j] != keyBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev 替换 env 文件中的指定 key 的值
     */
    function _replaceEnvValue(string memory content, string memory key, string memory newValue) internal pure returns (string memory) {
        bytes memory contentBytes = bytes(content);
        bytes memory keyBytes = bytes(key);

        uint256 keyStart = 0;
        bool found = false;

        // 找到 key 的位置
        for (uint i = 0; i <= contentBytes.length - keyBytes.length; i++) {
            bool isMatch = true;
            for (uint j = 0; j < keyBytes.length; j++) {
                if (contentBytes[i + j] != keyBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                // 确保 key 后面是 =
                if (i + keyBytes.length < contentBytes.length && contentBytes[i + keyBytes.length] == bytes1("=")) {
                    keyStart = i;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            return content;
        }

        // 找到值的开始和结束位置
        uint256 valueStart = keyStart + keyBytes.length + 1; // 跳过 key 和 =
        uint256 valueEnd = valueStart;

        // 找到换行符或文件结尾
        while (valueEnd < contentBytes.length && contentBytes[valueEnd] != bytes1("\n") && contentBytes[valueEnd] != bytes1("\r")) {
            valueEnd++;
        }

        // 构建新的内容
        bytes memory result = new bytes(valueStart + bytes(newValue).length + (contentBytes.length - valueEnd));

        // 复制前半部分
        for (uint i = 0; i < valueStart; i++) {
            result[i] = contentBytes[i];
        }

        // 插入新值
        bytes memory newValueBytes = bytes(newValue);
        for (uint i = 0; i < newValueBytes.length; i++) {
            result[valueStart + i] = newValueBytes[i];
        }

        // 复制后半部分
        for (uint i = valueEnd; i < contentBytes.length; i++) {
            result[valueStart + newValueBytes.length + (i - valueEnd)] = contentBytes[i];
        }

        return string(result);
    }

    /**
     * @dev 解析私钥字符串 (支持带或不带 0x 前缀)
     */
    function _parsePrivateKey(string memory key) internal pure returns (uint256) {
        bytes memory b = bytes(key);
        require(b.length == 64 || b.length == 66, "Invalid private key length");

        uint256 result = 0;
        uint256 start = (b.length == 66 && b[0] == "0" && b[1] == "x") ? 2 : 0;

        for (uint256 i = start; i < b.length; i++) {
            result = result << 4;
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                c = c - 48; // '0' - '9'
            } else if (c >= 65 && c <= 70) {
                c = c - 55; // 'A' - 'F'
            } else if (c >= 97 && c <= 102) {
                c = c - 87; // 'a' - 'f'
            } else {
                revert("Invalid hex character");
            }
            result = result | c;
        }
        return result;
    }
}
