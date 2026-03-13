# Phase 1: 项目初始化实现计划

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**目标:** 创建 pnpm monorepo 项目结构，包含 contracts、backend、frontend 三个包的基础配置。

**架构:** 使用 pnpm workspaces 管理多个包，共享依赖。

**技术栈:** pnpm, Foundry, Next.js, TypeScript

---

## 文件结构

```
cyber-fortune-nft/
├── pnpm-workspace.yaml
├── package.json
├── .npmrc
├── .env.example
│
├── contracts/
│   ├── package.json
│   ├── foundry.toml
│   ├── .env.example
│   ├── src/
│   ├── script/
│   └── test/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── .env.example
    └── src/
```

---

## 任务 1: 创建根目录配置文件

**文件：**

- [ ] **步骤 1: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'contracts'
  - 'backend'
  - 'frontend'
```

- [ ] **步骤 2: 创建根 package.json**

```json
{
  "name": "cyber-fortune-nft",
  "version": "1.0.0",
  "private": true,
  "description": "赛博算命 NFT - Cyber Fortune NFT",
  "scripts": {
    "dev": "pnpm --filter frontend dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

- [ ] **步骤 3: 创建 .npmrc**

```ini
strict-peer-dependencies=false
auto-install-peers=true
shamefully-hoist=true
```

- [ ] **步骤 4: 创建 .env.example**

```bash
# 根目录
NODE_ENV=development

# 区块链
BASE_RPC_URL=
BASE_SEPOLIA_RPC_URL=
PRIVATE_KEY=

# 后端
BACKEND_PORT=3001

# 前端
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

- [ ] **步骤 5: 提交**

```bash
git add pnpm-workspace.yaml package.json .npmrc .env.example
git commit -m "chore: add root monorepo config"
```

---

## 任务 2: 初始化 Contracts 包 (Foundry)

**文件：**

- 创建: `contracts/package.json`
- 创建: `contracts/foundry.toml`
- 创建: `contracts/.env`
- 创建: `contracts/src/CyberFortuneNFT.sol`
- 创建: `contracts/test/CyberFortuneNFT.t.sol`
- 创建: `contracts/script/Deploy.s.sol`

- [ ] **步骤 1: 创建 contracts/package.json**

```json
{
  "name": "@cyber-fortune/contracts",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "forge build",
    "test": "forge test",
    "deploy": "forge script script/Deploy.s.sol --broadcast --verify",
    "deploy:sepolia": "forge script script/Deploy.s.sol --broadcast --verify --network base-sepolia",
    "deploy:mainnet": "forge script script/Deploy.s.sol --broadcast --verify --network base",
    "clean": "forge clean"
  },
  "dependencies": {
    "forge-std": "github:foundry-rs/forge-std",
    "openzeppelin-contracts": "github:OpenZeppelin/openzeppelin-contracts"
  },
  "devDependencies": {
    "foundry-rs/foundry": "^0.3.0"
  }
}
```

- [ ] **步骤 2: 创建 foundry.toml**

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = false

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
base = "${BASE_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}" }
base = { key = "${BASESCAN_API_KEY}" }
```

- [ ] **步骤 3: 创建 .env**

```bash
BASE_SEPOLIA_RPC_URL=
BASE_RPC_URL=
PRIVATE_KEY=
BASESCAN_API_KEY=
AUTHORIZED_SIGNER=
```

- [ ] **步骤 4: 创建基础合约 stubs**

创建空合约占位，后续实现：
```solidity
// contracts/src/CyberFortuneNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CyberFortuneNFT {
    string public name = "Cyber Fortune";
    string public symbol = "CFORTUNE";
}
```

- [ ] **步骤 5: 提交**

```bash
git add contracts/
git commit -m "chore: add Foundry contracts package"
```

---

## 任务 3: 初始化 Backend 包

**文件：**

- 创建: `backend/package.json`
- 创建: `backend/tsconfig.json`
- 创建: `backend/.env`
- 创建: `backend/src/index.ts`

- [ ] **步骤 1: 创建 backend/package.json**

```json
{
  "name": "@cyber-fortune/backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ethers": "^6.10.0",
    "ai": "^2.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.1.0"
  }
}
```

- [ ] **步骤 2: 创建 backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **步骤 3: 创建 backend/.env**

```bash
PORT=3001
NODE_ENV=development

# DeepSeek API
DEEPSEEK_API_KEY=

# 合约地址 (部署后填写)
CONTRACT_ADDRESS=

# 签名私钥
SIGNER_PRIVATE_KEY=

# 前端 URL
FRONTEND_URL=http://localhost:3000
```

- [ ] **步骤 4: 创建 backend/src/index.ts (空实现)**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
```

- [ ] **步骤 5: 提交**

```bash
git add backend/
git commit -m "chore: add backend package"
```

---

## 任务 4: 初始化 Frontend 包

**文件：**

- 创建: `frontend/package.json`
- 创建: `frontend/next.config.js`
- 创建: `frontend/tsconfig.json`
- 创建: `frontend/.env`
- 创建: `frontend/src/app/page.tsx`

- [ ] **步骤 1: 创建 frontend/package.json**

```json
{
  "name": "@cyber-fortune/frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wagmi": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "viem": "^2.7.0",
    "@tanstack/react-query": "^5.17.0",
    "ethers": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "vitest": "^1.1.0"
  }
}
```

- [ ] **步骤 2: 创建 frontend/next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['viem'],
};

module.exports = nextConfig;
```

- [ ] **步骤 3: 创建 frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **步骤 4: 创建 frontend/.env**

```bash
# 后端 API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# 合约地址
NEXT_PUBLIC_CONTRACT_ADDRESS=

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

- [ ] **步骤 5: 创建 frontend/src/app/page.tsx**

```tsx
export default function Home() {
  return (
    <main>
      <h1>赛博算命 NFT</h1>
    </main>
  );
}
```

- [ ] **步骤 6: 创建 frontend/src/app/layout.tsx**

```tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **步骤 7: 创建 frontend/src/app/globals.css**

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **步骤 8: 提交**

```bash
git add frontend/
git commit -m "chore: add frontend package"
```

---

## 任务 5: 安装依赖并验证

- [ ] **步骤 1: 安装根依赖**

```bash
pnpm install
```

- [ ] **步骤 2: 验证各包可以构建**

```bash
cd contracts && pnpm install && pnpm build
cd backend && pnpm install
cd frontend && pnpm install
```

- [ ] **步骤 3: 提交**

```bash
git add .
git commit -m "chore: init monorepo with all packages"
```

---

## 总结

本阶段交付：
- ✅ pnpm monorepo 配置
- ✅ Foundry contracts 包（空壳）
- ✅ Backend 包（空壳）
- ✅ Frontend 包（空壳）
- ✅ 可工作的开发环境

**下一步:**
- 进入 Phase 2: 智能合约实现
