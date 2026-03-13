# CLAUDE.md

本文档为 Claude Code 在该仓库中工作时提供指导。

## 项目概述

赛博算命（Cyber Fortune）NFT 项目的智能合约。ERC-721 NFT，包含 Mint 功能、签名验证、市场功能和 ERC-2981 版税支持。

## 开发命令

```bash
# 安装依赖（从根目录使用 pnpm）
pnpm install

# 开发
forge build        # 编译合约
forge test         # 运行测试
forge clean        # 清理构建产物
```

## 项目架构

- **框架**: Foundry (Forge)
- **语言**: Solidity
- **标准**: ERC-721, ERC-2981
- **库**: OpenZeppelin Contracts

## 关键文件

```
src/               # 智能合约源码
src/CyberFortuneNFT.sol  # 主 NFT 合约
script/            # 部署脚本
test/              # 合约测试
```

## 网络

- `base-sepolia` - Base Sepolia 测试网
- `base` - Base 主网

## 环境变量

```
BASE_SEPOLIA_RPC_URL
BASE_RPC_URL
PRIVATE_KEY
BASESCAN_API_KEY
AUTHORIZED_SIGNER
```

## 说明

- 这是一个 monorepo。详见根目录的 CLAUDE.md。
- 修改此项目时，如需要请更新本 CLAUDE.md。
