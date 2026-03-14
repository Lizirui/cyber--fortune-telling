# 赛博算命 (Cyber Fortune) NFT

一个融合东方玄学与赛博朋克美学的 Web3 NFT 盲盒项目。用户通过 Mint 获得由 AI 生成的不同稀有度的祝福语 NFT。

## 项目简介

### 核心功能

- **盲盒 Mint**: 用户支付 0.01 ETH 铸造盲盒，获得随机稀有度的祝福 NFT
- **AI 祝福语生成**: 后端调用 DeepSeek API 生成独特的祝福语
- **稀有度系统**: 6 个稀有度等级（N、R、SR、SSR、UR、SP），概率逐级递减
- **市场交易**: 支持 NFT 挂单、购买、定价修改
- **个人中心**: 查看和管理已拥有的 NFT

### 技术栈

| 模块 | 技术 |
|------|------|
| 智能合约 | Solidity + Foundry |
| 后端 API | Express + TypeScript + DeepSeek |
| 前端 DApp | Next.js 14 + wagmi + RainbowKit |
| 存储 | IPFS (NFT 元数据) |
| 支付 | Base (L2) |

### 项目结构

```
cyber-fortune-nft/
├── contracts/          # 智能合约 (Foundry)
│   ├── src/           # Solidity 源码
│   ├── script/        # 部署脚本
│   └── test/          # 合约测试
│
├── backend/           # 后端 API (Express)
│   └── src/
│       ├── services/  # AI、签名、SVG 服务
│       └── routes/    # API 路由
│
└── frontend/          # 前端 DApp (Next.js)
    └── src/
        ├── app/       # App Router 页面
        ├── components/# React 组件
        └── lib/       # wagmi 配置、合约 ABI
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
git clone https://github.com/your-repo/cyber-fortune-nft.git
cd cyber-fortune-nft

# 安装依赖
pnpm install

# 安装 Foundry (如果没有)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 环境变量配置

#### 1. 智能合约 (.env)

项目已提供环境变量模板文件:

```bash
cd contracts

# Sepolia 测试网部署 (推荐开发测试使用)
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
PRIVATE_KEY=0x_your_private_key_without_0x_prefix

# 授权签名者地址 (用于验证后端签名)
AUTHORIZED_SIGNER=0x_your_wallet_address

# BaseScan API Key (验证合约用)
BASESCAN_API_KEY=your_basescan_api_key
```

#### 2. 后端 (.env)

创建 `backend/.env`:

```bash
PORT=3001
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
# 部署合约后填入
CONTRACT_ADDRESS=0x_your_contract_address
# 与 contracts/.env 相同
SIGNER_PRIVATE_KEY=0x_your_private_key_without_0x_prefix
FRONTEND_URL=http://localhost:3000
```

#### 3. 前端 (.env.local)

创建 `frontend/.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address
# WalletConnect 项目 ID (演示用)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a4d4ab2e2e26c55f4ebc54e5d8a7e5c
```

### 启动开发服务器

```bash
# 一键启动所有服务 (前端 + 后端)
pnpm dev

# 或分别启动
cd frontend && pnpm dev    # 前端: http://localhost:3000
cd backend && pnpm dev     # 后端: http://localhost:3001
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
   - [Base Sepolia Faucet](https://bridge.base.org/deposit) - 需要 ETH Sepolia
   - [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
   - 或在 Discord #base-sepolia 频道请求

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

# 5. 验证合约 (可选)
forge verify-contract <CONTRACT_ADDRESS> src/CyberFortuneNFT.sol:CyberFortuneNFT --chain base-sepolia --etherscan-api-key $BASESCAN_API_KEY
```

部署成功后会输出合约地址，保存下来用于后续配置。

> **提示**: 如果想使用 forge 加载私钥，也可以直接使用 `source .env && forge script ...`

### 步骤 3: 配置后端

```bash
cd backend

# 更新 .env
# CONTRACT_ADDRESS 填入上一步部署的合约地址
# SIGNER_PRIVATE_KEY 填入部署钱包的私钥

# 启动后端
pnpm dev
```

### 步骤 4: 配置前端

```bash
cd frontend

# 更新 .env.local 中的 CONTRACT_ADDRESS

# 启动前端
pnpm dev
```

### 步骤 5: 测试完整流程

1. 打开 http://localhost:3000
2. 连接 MetaMask (确保切换到 Base Sepolia 网络)
3. 确认钱包有足够的测试 ETH
4. 点击"开悟"按钮 Mint 盲盒
5. 等待交易确认
6. 在个人中心查看 NFT
7. 在市场查看和交易 NFT

### 调试技巧

```bash
# 查看合约交互日志
forge test -vvv

# 前端调试 - 打开浏览器开发者工具
# Network 标签查看 API 请求
# Console 标签查看 wagmi 日志

# 后端调试
# 查看终端输出的日志
# 使用 curl 测试 API:
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"rarity": 2}'
```

---

## 主网部署流程

### 重要提醒

部署主网前请确保:
- ✅ 已在测试网完成完整测试
- ✅ 已审计智能合约 (可选但推荐)
- ✅ 准备好主网 ETH 和 BASE

### 步骤 1: 准备主网配置

项目已提供环境变量模板:

```bash
cd contracts

# 复制主网配置模板
cp .env.mainnet .env
```

编辑 `.env` 填入以下内容:

```bash
# Base Sepolia RPC (备用)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base 主网 RPC
BASE_RPC_URL=https://mainnet.base.org

# 主网部署私钥 (建议使用硬件钱包或多重签名)
PRIVATE_KEY=0x_xxx

# 授权签名者
AUTHORIZED_SIGNER=0x_xxx

# BaseScan API Key
BASESCAN_API_KEY=your_basescan_api_key
```

创建 `backend/.env.production`:

```bash
PORT=3001
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
CONTRACT_ADDRESS=0x_contract_address_on_mainnet
SIGNER_PRIVATE_KEY=0x_xxx
FRONTEND_URL=https://your-domain.com
```

创建 `frontend/.env.production`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_contract_address_on_mainnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 步骤 2: 部署智能合约

```bash
cd contracts

# 1. 复制主网配置
cp .env.mainnet .env

# 2. 编辑 .env 填入 PRIVATE_KEY 和 BASESCAN_API_KEY

# 3. 部署到 Base 主网
forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --private-key $PRIVATE_KEY --verify

# 验证通过后输出合约地址
```

### 步骤 3: 部署后端

推荐使用 Docker 或托管服务 (Railway, Render, Fly.io):

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
```

```bash
# 构建并推送 Docker 镜像
docker build -t cyber-fortune-backend:latest ./backend
docker push your-registry/cyber-fortune-backend:latest
```

### 步骤 4: 部署前端

推荐使用 Vercel:

```bash
cd frontend

# 构建生产版本
pnpm build

# 使用 Vercel 部署
vercel --prod
# 或手动部署到任意静态托管
```

### 步骤 5: 验证部署

1. 访问前端 URL
2. 连接钱包 (切换到 Base 主网)
3. 执行一次完整的 Mint 流程
4. 确认:
   - NFT 可以正常 Mint
   - 祝福语正常生成
   - NFT 显示正确
   - 市场功能正常

---

## API 文档

### 后端 API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/generate` | 生成祝福语 (需签名) |
| POST | `/api/mint` | 验证签名并返回 mint 参数 |
| GET | `/api/token/:tokenId` | 获取 NFT 元数据 |
| POST | `/api/list` | 挂售 NFT |
| POST | `/api/buy` | 购买 NFT |
| POST | `/api/cancel-listing` | 取消挂售 |

### 签名验证

后端使用 ECDSA (secp256k1) 对祝福语进行签名，前端在 Mint 时需验证签名。

---

## 常见问题

### Q: Mint 失败显示 "invalid signature"
A: 检查后端 `SIGNER_PRIVATE_KEY` 与合约 `AUTHORIZED_SIGNER` 是否匹配

### Q: 交易卡住
A: 在 MetaMask 中加速或取消交易，或设置更高的 gas price

### Q: AI 祝福语生成失败
A: 检查后端 `DEEPSEEK_API_KEY` 是否有效

### Q: 前端无法连接钱包
A: 确保已安装 MetaMask 并切换到正确的网络

---

## 相关链接

- [Base 文档](https://docs.base.org)
- [Foundry 文档](https://book.getfoundry.sh)
- [wagmi](https://wagmi.sh)
- [RainbowKit](https://www.rainbowkit.com)
- [DeepSeek API](https://platform.deepseek.com)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
