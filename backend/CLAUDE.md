# CLAUDE.md

本文档为 Claude Code 在该仓库中工作时提供指导。

## 项目概述

赛博算命（Cyber Fortune）NFT 项目的后端 API 服务。提供 AI 祝福语生成、签名验证和 SVG 动态生成功能。

## 开发命令

```bash
# 安装依赖（从根目录使用 pnpm）
pnpm install

# 开发
pnpm dev              # 启动开发服务器（热重载）
pnpm build            # 编译 TypeScript
pnpm start            # 启动生产服务器
pnpm test             # 运行测试
```

## 项目架构

- **框架**: Express.js
- **语言**: TypeScript
- **AI**: DeepSeek API（通过 `ai` 包）
- **区块链**: ethers.js 用于与合约交互

## 关键目录

```
src/               # 源代码
src/index.ts      # 入口文件
src/services/     # 业务逻辑（AI、签名器、SVG）
src/routes/       # API 路由
```

## 环境变量

```
PORT                    # 服务器端口（默认: 3001）
DEEPSEEK_API_KEY       # DeepSeek API 密钥
CONTRACT_ADDRESS       # NFT 合约地址
SIGNER_PRIVATE_KEY     # 签名私钥
FRONTEND_URL          # 前端 URL（用于 CORS）
```

## 说明

- 这是一个 monorepo。详见根目录的 CLAUDE.md。
- 修改此项目时，如需要请更新本 CLAUDE.md。
