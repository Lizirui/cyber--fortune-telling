# 部署指南

本文档详细介绍如何将赛博算命项目部署到 Vercel。

## 架构说明

项目已拆分为以下部署：

```
cyber-fortune-telling/
├── frontend/          # Next.js 14 全栈应用 → 部署到 Vercel
│   └── src/app/api/  # 所有 API Routes
├── contracts/         # Solidity 智能合约 (Foundry) → Base Sepolia
└── subgraph/         # The Graph 索引 → 部署到 The Graph Studio
```

**已包含的 API：**
- `/api/health` - 健康检查
- `/api/mint/generate` - AI 生成祝福语 + 签名
- `/api/mint/reveal/[tokenId]` - 揭示祝福语
- `/api/nft/user/[address]` - 获取用户 NFT
- `/api/nft/listing/[tokenId]` - NFT 上架信息
- `/api/market/listings` - 市场列表
- `/api/market/listings/[tokenId]` - 单个 NFT 上架信息
- `/api/market/listings-onchain` - 链上市场列表
- `/api/market/sync` - 同步市场数据
- `/api/market/history` - 市场历史

---

## 一、部署前端到 Vercel

### 方式一：Git 集成部署（推荐）

1. 访问 https://vercel.com/new/import
2. 选择 `frontend` 文件夹导入（或者整个项目，Vercel 会自动识别 Next.js）
3. 配置项目：
   - Framework Preset: `Next.js`
   - Build Command: `cd ../ && pnpm install && cd frontend && pnpm build`（如果是 monorepo）
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. 点击 Deploy

### 方式二：Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 进入前端目录
cd frontend

# 登录 Vercel
vercel login

# 部署（首次）
vercel

# 生产部署
vercel --prod
```

---

## 二、环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://你的项目.vercel.app` | Vercel 部署地址 |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xCeD9DDa10BdE74Be4D63d77eFF94C1786b9B2b5d` | NFT 合约地址 |
| `BASE_RPC_URL` | `https://sepolia.base.org` | Base Sepolia RPC |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | 你的 WalletConnect Project ID | WalletConnect ID |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vyuiuashjcquycxlfezq.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key | Supabase 配置 |
| `POSTGRES_URL` | Supabase Postgres URL | 数据库连接 |
| `POSTGRES_URL_NON_POOLING` | Supabase Postgres URL (非池化) | 数据库连接 |
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API 密钥 | AI 生成祝福语 |
| `SIGNER_PRIVATE_KEY` | 你的签名私钥 | Mint 签名用 |

**注意：**
- `DEEPSEEK_API_KEY` 和 `SIGNER_PRIVATE_KEY` 不需要 `NEXT_PUBLIC_` 前缀
- `NEXT_PUBLIC_` 前缀的变量会在客户端暴露
- 部署后需要更新 `NEXT_PUBLIC_API_BASE_URL` 为实际的 Vercel 域名

---

## 三、数据库初始化

首次部署后，需要在 Supabase 中创建祝福语池表：

```sql
CREATE TABLE blessing_pool (
  id SERIAL PRIMARY KEY,
  rarity INTEGER NOT NULL,
  blessing TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);

CREATE INDEX idx_blessing_pool_rarity ON blessing_pool(rarity);
CREATE INDEX idx_blessing_pool_is_used ON blessing_pool(is_used);
```

你可以在 Supabase 的 SQL Editor 中执行上述 SQL。

---

## 四、验证部署

1. 访问 `https://你的项目.vercel.app`
2. 检查页面是否正常加载
3. 尝试连接钱包
4. 尝试 Mint NFT

### 测试 API

```bash
# 健康检查
curl https://你的项目.vercel.app/api/health

# 生成祝福语
curl -X POST https://你的项目.vercel.app/api/mint/generate \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "0x..."}'
```

---

## 五、智能合约

合约已部署到 Base Sepolia，如需重新部署：

```bash
cd contracts

export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=你的私钥
export AUTHORIZED_SIGNER=0x50720a74b94c04db16b2F34e4a6380e8299B87e3
export BASESCAN_API_KEY=你的API Key

forge script script/Deploy.s.sol:Deploy --rpc-url base_sepolia --broadcast --verify
```

**当前合约信息：**
- 合约地址: `0xCeD9DDa10BdE74Be4D63d77eFF94C1786b9B2b5d`
- 授权签名者: `0x50720a74b94c04db16b2F34e4a6380e8299B87e3`
- 网络: Base Sepolia (84532)

---

## 六、常见问题

### Q: Mint 失败
A: 检查以下配置：
1. `DEEPSEEK_API_KEY` 和 `SIGNER_PRIVATE_KEY` 是否正确配置
2. 合约的 `authorizedSigner` 是否与私钥对应
3. 当前网络是否为 Base Sepolia

### Q: 数据库连接失败
A: 确认 Supabase 的 `POSTGRES_URL` 正确，检查表是否已创建

### Q: 购买 NFT 失败
A: 确保使用 Base Sepolia 网络，钱包有足够 ETH

### Q: 签名验证失败
A: 如果修改过签名私钥，需要更新合约的 authorizedSigner：
```bash
cd contracts
PRIVATE_KEY=你的部署私钥 CONTRACT_ADDRESS=0xCeD9DDa10BdE74Be4D63d77eFF94C1786b9B2b5d NEW_AUTHORIZED_SIGNER=你的新签名地址 forge script script/UpdateSigner.s.sol:UpdateSignerScript --rpc-url base_sepolia --broadcast --verify
```
