# 赛博算命 NFT 项目架构

> **For agentic workers:** Use superpowers:writing-plans skill to create implementation plans for each package.

---

## 项目概览

**项目名称**: 赛博算命 (Cyber Fortune)
**项目类型**: Web3 NFT DApp
**技术栈**: Foundry + Next.js + pnpm monorepo
**区块链**: Base (EVM L2)

---

## Monorepo 结构

```
cyber-fortune-nft/
├── pnpm-workspace.yaml
├── package.json
├── .npmrc
├── .env.example
│
├── contracts/                    # Solidity 智能合约
│   ├── package.json
│   ├── foundry.toml
│   ├── src/
│   │   └── CyberFortuneNFT.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── test/
│       └── CyberFortuneNFT.t.sol
│
├── backend/                      # 后端服务 (Node.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts             # 入口
│   │   ├── services/
│   │   │   ├── ai.ts           # AI 生成服务
│   │   │   ├── signer.ts        # 签名服务
│   │   │   └── svg.ts           # SVG 生成服务
│   │   └── routes/
│   │       └── mint.ts          # Mint API
│   └── .env.example
│
└── frontend/                    # 前端 DApp (Next.js)
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # 首页
    │   │   ├── mint/
    │   │   │   └── page.tsx     # Mint 页面
    │   │   ├── market/
    │   │   │   └── page.tsx     # 市场页面
    │   │   ├── leaderboard/
    │   │   │   └── page.tsx     # 排行榜页面
    │   │   └── profile/
    │   │       └── page.tsx     # 个人中心
    │   ├── components/
    │   │   ├── ConnectWallet.tsx
    │   │   ├── NFTCard.tsx
    │   │   └── ...
    │   ├── hooks/
    │   │   └── useNFT.ts
    │   └── lib/
    │       ├── wagmi.ts
    │       └── contract.ts
    └── .env.example
```

---

## 包说明

### contracts (智能合约)

- **技术**: Foundry (Solc)
- **功能**:
  - ERC-721 NFT 合约
  - 签名验证
  - Mint 限制
  - 链上市场
  - ERC-2981 版税
- **命令**:
  - `pnpm build` - 编译合约
  - `pnpm test` - 运行测试
  - `pnpm deploy` - 部署到网络

### backend (后端服务)

- **技术**: Express/Fastify + TypeScript
- **功能**:
  - AI 生成祝福语 (DeepSeek)
  - 签名服务
  - SVG 动态生成
  - 排行榜数据索引
- **命令**:
  - `pnpm dev` - 开发模式
  - `pnpm build` - 构建
  - `pnpm start` - 生产运行

### frontend (前端 DApp)

- **技术**: Next.js 14 + Wagmi + RainbowKit
- **功能**:
  - 钱包连接
  - Mint 盲盒
  - 交易市场
  - 排行榜
  - 个人中心
- **命令**:
  - `pnpm dev` - 开发模式
  - `pnpm build` - 构建
  - `pnpm start` - 生产运行

---

## 开发流程

```
1. contracts/      → 智能合约开发、测试、部署
       ↓
2. backend/        → 后端 API 开发
       ↓
3. frontend/       → 前端 DApp 开发
       ↓
4. 集成测试        → 端到端测试
```

---

## 依赖关系

```
frontend
  ├── 依赖 backend (API)
  └── 依赖 contracts (ABIs)

backend
  └── 依赖 contracts (ABIs)

contracts
  └── 无外部依赖
```

---

## 后续计划

按照以下顺序创建实现计划：

1. **Phase 1: 项目初始化** - 创建 monorepo 结构和基础配置
2. **Phase 2: 智能合约** - Foundry 合约开发
3. **Phase 3: 后端服务** - API + AI + SVG
4. **Phase 4: 前端 DApp** - Next.js 全栈开发
