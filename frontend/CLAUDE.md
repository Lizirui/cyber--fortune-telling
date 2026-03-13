# CLAUDE.md

本文档为 Claude Code 在该仓库中工作时提供指导。

## 项目概述

赛博算命（Cyber Fortune）NFT 项目的前端 DApp。基于 Next.js 14，使用 wagmi 和 RainbowKit 实现 Web3 集成。

## 开发命令

```bash
# 安装依赖（从根目录使用 pnpm）
pnpm install

# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm start            # 启动生产服务器
pnpm lint             # 运行代码检查
pnpm test             # 运行测试
```

## 项目架构

- **框架**: Next.js 14 (App Router)
- **Web3**: wagmi + RainbowKit + viem
- **样式**: CSS Modules / Tailwind（如有）
- **状态管理**: React Query + wagmi hooks

## 关键目录

```
src/app/          # Next.js App Router 页面
src/components/   # React 组件
src/hooks/        # 自定义 React Hooks
src/lib/          # 工具函数（wagmi 配置、合约 ABI）
```

## 环境变量

```
NEXT_PUBLIC_BACKEND_URL      # 后端 API 地址
NEXT_PUBLIC_CONTRACT_ADDRESS # NFT 合约地址
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

## 说明

- 这是一个 monorepo。详见根目录的 CLAUDE.md。
- 修改此项目时，如需要请更新本 CLAUDE.md。
