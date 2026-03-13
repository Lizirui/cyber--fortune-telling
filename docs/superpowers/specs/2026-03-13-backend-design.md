# Phase 3: 后端服务设计

> **For agentic workers:** Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**目标**: 开发后端 API 服务，提供 AI 祝福语生成、签名验证、SVG 动态生成功能

**架构**: Express.js + TypeScript + DeepSeek API + ethers.js

**技术栈**: Express, TypeScript, DeepSeek API, ethers.js, SVG 模板

---

## 1. 核心功能

### 1.1 AI 祝福语生成

- 使用 DeepSeek API 生成 60-80 字祝福语
- 随机分配稀有度（6 档：N/R/SR/SSR/SP/UR）
- 稀有度概率分布：
  - N (0): 50%
  - R (1): 25%
  - SR (2): 15%
  - SSR (3): 7%
  - SP (4): 2.5%
  - UR (5): 0.5%

### 1.2 签名服务

- 后端使用私钥对 Mint 参数签名
- 签名数据包含：祝福语、稀有度、过期时间、nonce、用户地址
- 前端使用签名调用 `mintWithSignature` 免手续费

### 1.3 SVG 动态生成

- 6 种稀有度对应不同 SVG 模板
- 模板包含：背景、边框、稀有度标识、祝福语文本
- 返回 base64 编码的 SVG

### 1.4 排行榜数据

- 通过 The Graph 查询链上数据
- 支持按稀有度、持有量、交易量排序

---

## 2. API 端点

### 2.1 POST /api/mint/generate

生成祝福语和签名

**请求**:
```json
{
  "userAddress": "0x..."
}
```

**响应**:
```json
{
  "blessing": "愿你新的一年里...",
  "rarity": 2,
  "expiresAt": 1234567890,
  "nonce": 0,
  "signature": "0x..."
}
```

### 2.2 GET /api/nft/:tokenId

获取 NFT 详情和 SVG

**响应**:
```json
{
  "tokenId": 0,
  "blessing": "愿你新的一年里...",
  "rarity": 2,
  "rarityName": "SR",
  "owner": "0x...",
  "svg": "data:image/svg+xml;base64,..."
}
```

### 2.3 GET /api/leaderboard

排行榜数据

**查询参数**:
- `sort`: rarity | holdings | volume
- `limit`: 默认 20

**响应**:
```json
{
  "items": [
    {
      "address": "0x...",
      "totalMinted": 10,
      "rarityBreakdown": { "N": 5, "R": 3, "SR": 2 }
    }
  ]
}
```

### 2.4 GET /health

健康检查

---

## 3. 项目结构

```
backend/
├── src/
│   ├── index.ts              # 入口
│   ├── routes/
│   │   ├── mint.ts          # Mint 相关 API
│   │   ├── nft.ts           # NFT 详情 API
│   │   └── leaderboard.ts   # 排行榜 API
│   ├── services/
│   │   ├── ai.ts            # DeepSeek AI 服务
│   │   ├── signer.ts        # 签名服务
│   │   └── svg.ts           # SVG 生成服务
│   └── utils/
│       └── contract.ts       # 合约交互工具
├── templates/                # SVG 模板
│   ├── n.svg
│   ├── r.svg
│   ├── sr.svg
│   ├── ssr.svg
│   ├── sp.svg
│   └── ur.svg
└── package.json
```

---

## 4. 环境变量

```
PORT                    # 服务器端口（默认: 3001）
DEEPSEEK_API_KEY       # DeepSeek API 密钥
CONTRACT_ADDRESS       # NFT 合约地址
SIGNER_PRIVATE_KEY     # 签名私钥
FRONTEND_URL          # 前端 URL（用于 CORS）
THEGRAPH_URL          # The Graph 端点
BASE_RPC_URL          # Base RPC 端点
```

---

## 5. 依赖

- express: Web 框架
- ethers: 区块链交互
- ai: DeepSeek SDK
- cors: 跨域支持
- dotenv: 环境变量

---

## 6. 实现顺序

1. 环境配置和项目结构
2. SVG 模板设计（6 种稀有度）
3. AI 生成服务
4. 签名服务
5. Mint API
6. NFT 详情 API
7. 排行榜 API
8. 测试和验证
