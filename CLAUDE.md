# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在该仓库中工作时提供指导。

## 项目概述

这是一个名为"赛博算命"（Cyber Fortune）的 Web3 NFT 项目。用户可以通过 Mint 获得由 AI 生成的不同稀有度的祝福语 NFT。

## 重要：先阅读子项目 CLAUDE.md

在该项目中工作时，必须先阅读对应子项目的 CLAUDE.md：

- **frontend/** → 先阅读 `frontend/CLAUDE.md`
- **backend/** → 先阅读 `backend/CLAUDE.md`
- **contracts/** → 先阅读 `contracts/CLAUDE.md`

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发（启动前端）
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 项目架构

这是一个包含三个包的 pnpm monorepo：

```
cyber-fortune-nft/
├── pnpm-workspace.yaml
├── package.json
│
├── contracts/          # 智能合约（Foundry）
│   └── CLAUDE.md
│
├── backend/           # API 服务（Express + TypeScript）
│   └── CLAUDE.md
│
└── frontend/          # Web3 DApp（Next.js + wagmi）
    └── CLAUDE.md
```

## 更新 CLAUDE.md

当修改任何子项目（frontend、backend、contracts）时，如果更改影响了项目的结构、命令或架构，请更新对应的 CLAUDE.md。
