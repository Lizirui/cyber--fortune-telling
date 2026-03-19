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
contracts/
├── src/                    # 智能合约源码
│   └── CyberFortuneNFT.sol # 主 NFT 合约
├── script/                 # 部署脚本
│   ├── Deploy.s.sol       # 部署脚本
│   └── UpdateSigner.s.sol # 更新签名者脚本
├── test/                   # 合约测试
├── lib/                    # 第三方库 (OpenZeppelin)
└── out/                    # 编译输出
```

## 网络

- `base-sepolia` - Base Sepolia 测试网
- `base` - Base 主网

## 部署

```bash
cd contracts

# Sepolia 测试网
cp .env.sepolia .env
# 编辑 .env 填入 PRIVATE_KEY 等

forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast --private-key $PRIVATE_KEY
```

## 环境变量

```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0x...
AUTHORIZED_SIGNER=0x...  # 必须与前端 PRIVATE_KEY 对应的地址一致
BASESCAN_API_KEY=...
```

## 说明

- 这是一个 monorepo。详见根目录的 CLAUDE.md。
- 修改此项目时，如需要请更新本 CLAUDE.md。
