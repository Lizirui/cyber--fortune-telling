# 赛博算命 (Cyber Fortune) NFT

一个融合东方玄学与赛博朋克美学的 Web3 NFT 项目。用户通过 Mint 获得由 AI 生成的不同稀有度的祝福语 NFT。

## 项目简介

### 核心功能

- **盲盒 Mint**: 用户支付 0.01 ETH 铸造盲盒，获得随机稀有度的祝福 NFT
- **AI 祝福语生成**: 后端调用 AI API 生成独特的祝福语
- **稀有度系统**: 6 个稀有度等级（N、R、SR、SSR、UR、SP），概率逐级递减
- **市场交易**: 支持 NFT 挂单、购买、取消
- **个人中心**: 查看和管理已拥有的 NFT

### 技术栈

| 模块 | 技术 |
|------|------|
| 智能合约 | Solidity + Foundry |
| 前端 + API | Next.js 14 (App Router) + API Routes |
| Web3 | wagmi + RainbowKit + viem |
| 存储 | Vercel KV (Redis) + IPFS |
| 索引 | The Graph (Subgraph) |
| 部署 | Vercel |
| 支付 | Base (L2) |

### 项目结构

```
cyber-fortune-nft/
├── pnpm-workspace.yaml
├── package.json
│
├── contracts/          # 智能合约 (Foundry)
│   ├── src/           # Solidity 源码
│   ├── script/        # 部署脚本
│   └── test/          # 合约测试
│
├── frontend/          # 前端 DApp + API (Next.js)
│   └── src/
│       ├── app/       # App Router 页面 + API 路由
│       ├── components/# React 组件
│       └── lib/       # wagmi 配置、合约 ABI、数据库
│
└── subgraph/          # The Graph 索引
    ├── src/           # 映射逻辑
    └── subgraph.yaml  # 子图配置
```

---

## 本地开发

### 前置条件

- Node.js 18+
- pnpm 8+
- Foundry (用于智能合约)
- Ethereum 钱包 (MetaMask)

### 安装

```bash
# 克隆仓库
git clone https://github.com/Lizirui/cyber--fortune-telling.git
cd cyber-fortune-telling

# 安装依赖
pnpm install

# 安装 Foundry (如果没有)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 环境变量配置

#### 1. 智能合约 (.env)

```bash
cd contracts

# Sepolia 测试网部署
cp .env.sepolia .env

# 主网部署
cp .env.mainnet .env
```

编辑 `.env` 填入以下内容:

```bash
# Base Sepolia 测试网 RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base 主网 RPC
BASE_RPC_URL=https://mainnet.base.org

# 部署钱包私钥 (不要提交到 Git!)
PRIVATE_KEY=0x_your_private_key

# 授权签名者地址 (用于验证后端签名)
AUTHORIZED_SIGNER=0x_your_wallet_address

# BaseScan API Key
BASESCAN_API_KEY=your_basescan_api_key
```

#### 2. 前端 (.env.local)

创建 `frontend/.env.local`:

```bash
# 后端 API (本地开发时使用 Next.js API 代理)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# 合约地址 (部署合约后填入)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address

# WalletConnect 项目 ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 启动开发服务器

```bash
# 启动前端开发服务器
pnpm dev

# 访问 http://localhost:3000
```

---

## Sepolia 测试网开发流程

### 步骤 1: 获取测试代币

1. 添加 Base Sepolia 网络到 MetaMask:
   - 网络名称: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - 链 ID: `84532`
   - 符号: `ETH`
   - 区块浏览器: `https://sepolia.basescan.org`

2. 获取测试 ETH:
   - [Base Sepolia Faucet](https://bridge.base.org/deposit)
   - [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

### 步骤 2: 部署合约到 Sepolia

```bash
cd contracts

# 1. 复制 Sepolia 配置
cp .env.sepolia .env

# 2. 编辑 .env 填入 PRIVATE_KEY 和 BASESCAN_API_KEY

# 3. 编译合约
forge build

# 4. 部署到 Base Sepolia
forge script script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast --private-key $PRIVATE_KEY
```

### 步骤 3: 配置前端

```bash
cd frontend

# 更新 .env.local 中的 CONTRACT_ADDRESS

# 启动前端
pnpm dev
```

### 步骤 4: 测试完整流程

1. 打开 http://localhost:3000
2. 连接 MetaMask (确保切换到 Base Sepolia 网络)
3. 确认钱包有足够的测试 ETH
4. 点击"开始算命"按钮 Mint 盲盒
5. 等待交易确认
6. 在个人中心查看 NFT
7. 在市场查看和交易 NFT

---

## 部署到 Vercel

### 方式一: Git 集成部署 (推荐)

1. 访问 https://vercel.com/new/import
2. 选择 `frontend` 文件夹导入
3. 配置项目:
   - Framework Preset: `Next.js`
   - Build Command: `cd ../ && pnpm install && cd frontend && pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. 添加环境变量
5. 点击 Deploy

### 环境变量 (Vercel)

```
NEXT_PUBLIC_BACKEND_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
CRON_SECRET=your-cron-secret
```

### Cron Job

部署后会自动配置每天凌晨同步链上市场数据。

---

## API 端点

前端 API 路由位于 `frontend/src/app/api/`:

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/mint/generate` | 生成祝福语并签名 |
| GET | `/api/mint/reveal/[tokenId]` | 揭示 NFT 祝福语 |
| GET | `/api/market/listings` | 获取市场挂单列表 |
| GET | `/api/market/listings/[tokenId]` | 获取特定挂单 |
| GET | `/api/market/listings-onchain` | 获取链上挂单 |
| GET | `/api/market/history` | 获取交易历史 |
| POST | `/api/market/sync` | 同步链上数据 (Cron) |
| GET | `/api/nft/user/[address]` | 获取用户 NFT |
| POST | `/api/nft/listing/[tokenId]` | 上架 NFT |
| GET | `/api/health` | 健康检查 |

---

## 常见问题

### Q: Mint 失败显示 "Invalid signature"
A: 检查前端 `PRIVATE_KEY` 与合约 `AUTHORIZED_SIGNER` 是否匹配

### Q: 交易卡住
A: 在 MetaMask 中加速或取消交易

### Q: 市场数据不更新
A: 等待 Cron 任务执行 (每天凌晨)，或手动触发 sync

### Q: 前端无法连接钱包
A: 确保已安装 MetaMask 并切换到正确的网络

---

## 相关链接

- [Base 文档](https://docs.base.org)
- [Foundry 文档](https://book.getfoundry.sh)
- [wagmi](https://wagmi.sh)
- [RainbowKit](https://www.rainbowkit.com)
- [Vercel](https://vercel.com)
- [The Graph](https://thegraph.com)
