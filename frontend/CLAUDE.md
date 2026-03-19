# CLAUDE.md

本文档为 Claude Code 在该仓库中工作时提供指导。

## 项目概述

赛博算命（Cyber Fortune）NFT 项目的前端 DApp。基于 Next.js 14，使用 wagmi 和 RainbowKit 实现 Web3 集成。API 功能已集成到 Next.js API Routes 中。

## 开发命令

```bash
# 安装依赖（从根目录使用 pnpm）
pnpm install

# 开发
pnpm dev              # 启动开发服务器 http://localhost:3000
pnpm build            # 生产构建
pnpm start            # 启动生产服务器
pnpm lint             # 运行代码检查
```

## 项目架构

- **框架**: Next.js 14 (App Router)
- **Web3**: wagmi + RainbowKit + viem
- **样式**: Tailwind CSS
- **状态管理**: React Query + wagmi hooks
- **数据库**: Vercel KV (Redis)

## 关键目录

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页 (Mint)
│   ├── market/            # 市场页面
│   ├── profile/           # 个人中心
│   └── api/               # API 路由
│       ├── mint/          # Mint 相关 API
│       ├── market/        # 市场相关 API
│       └── nft/           # NFT 相关 API
├── components/            # React 组件
│   ├── MintBox.tsx       # Mint 组件
│   ├── NFTModal.tsx      # NFT 详情弹窗
│   ├── MarketCard.tsx    # 市场卡片
│   └── ...
├── lib/                   # 工具函数
│   ├── wagmi.ts          # wagmi 配置
│   ├── contract.ts       # 合约 ABI
│   ├── signer.ts         # 签名工具
│   ├── ai.ts             # AI 生成祝福语
│   └── db/               # 数据库操作
└── hooks/                 # 自定义 Hooks
```

## API 路由

| 路径 | 描述 |
|------|------|
| `/api/mint/generate` | 生成祝福语并签名 |
| `/api/mint/reveal/[tokenId]` | 揭示 NFT 祝福语 |
| `/api/market/listings` | 获取市场挂单列表 |
| `/api/market/listings/[tokenId]` | 获取特定挂单 |
| `/api/market/listings-onchain` | 获取链上挂单 |
| `/api/market/history` | 获取交易历史 |
| `/api/market/sync` | 同步链上数据 (Cron) |
| `/api/nft/user/[address]` | 获取用户 NFT |
| `/api/nft/listing/[tokenId]` | 上架 NFT |
| `/api/health` | 健康检查 |

## 环境变量

```
# 后端 API (Vercel 部署后填入实际域名)
NEXT_PUBLIC_BACKEND_URL=https://your-domain.vercel.app

# 合约地址
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# 签名者私钥 (仅后端使用，部署时设置)
PRIVATE_KEY=0x...

# Cron 密钥
CRON_SECRET=...
```

## 说明

- 这是一个 monorepo。详见根目录的 CLAUDE.md。
- API 路由部署到 Vercel 后与前端共用域名。
- 修改此项目时，如需要请更新本 CLAUDE.md。
