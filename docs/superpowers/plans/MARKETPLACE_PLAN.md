# 赛博算命 NFT 交易市场开发计划

## Context

当前市场页面是 "Coming Soon" 占位页。智能合约已内置完整的交易市场功能（listItem/buyItem/cancelListing），但前端和后端均未实现对应的 UI 和数据层。用户希望交易市场的 NFT 数据由后端数据库管理，而非每次从链上读取，以提升性能和查询灵活性。

## 技术选型

| 项目 | 选择 |
|------|------|
| 数据库 | PostgreSQL + raw `pg`（复用前端现有模式） |
| 数据同步 | TheGraph 子图索引链上事件 |
| 部署方式 | Vercel Serverless（Next.js API Routes） |
| 功能范围 | 基础版：浏览/筛选/购买/上架/下架 |

---

## Phase 1: 数据库表设计

**新建文件**: `frontend/src/lib/db/marketplace.ts`

复用 `frontend/src/lib/db/index.ts` 的模式（raw `pg.Pool`、`getPool()` 延迟创建、`try/finally` 释放连接）。

### 表结构

```sql
-- NFT 元数据缓存
CREATE TABLE IF NOT EXISTS nfts (
  token_id INTEGER PRIMARY KEY,
  blessing TEXT NOT NULL,
  rarity SMALLINT NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  minted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_rarity ON nfts(rarity);

-- 市场挂单
CREATE TABLE IF NOT EXISTS listings (
  token_id INTEGER PRIMARY KEY,
  seller_address VARCHAR(42) NOT NULL,
  price_wei VARCHAR(78) NOT NULL,       -- 字符串存储，避免精度丢失
  is_active BOOLEAN DEFAULT TRUE,
  listed_at TIMESTAMP DEFAULT NOW(),
  tx_hash VARCHAR(66)
);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_address);

-- 交易历史
CREATE TABLE IF NOT EXISTS market_transactions (
  id SERIAL PRIMARY KEY,
  token_id INTEGER NOT NULL,
  event_type VARCHAR(20) NOT NULL,      -- 'listed' | 'bought' | 'cancelled'
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  price_wei VARCHAR(78),
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,
  block_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_txns_token ON market_transactions(token_id);

-- 同步游标
CREATE TABLE IF NOT EXISTS sync_state (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 数据访问函数

```typescript
// marketplace.ts 导出函数
initializeMarketplaceTables()              // 建表
getActiveListings({ page, limit, rarity?, sort? }) // 分页查询在售列表
getListingByTokenId(tokenId)               // 单个挂单详情
getTransactionHistory({ page, limit, tokenId? })   // 交易记录
upsertNFT(nft)                             // 插入/更新 NFT 缓存
upsertListing(listing)                     // 插入/更新挂单
deactivateListing(tokenId)                 // 下架
insertTransaction(tx)                      // 插入交易记录
getSyncCursor(key) / setSyncCursor(key, value)     // 同步游标
```

---

## Phase 2: TheGraph 子图

**新建目录**: `subgraph/`

```
subgraph/
├── package.json
├── subgraph.yaml       # 子图清单 (network: base-sepolia)
├── schema.graphql      # 实体定义
├── src/
│   └── mapping.ts      # 事件处理逻辑
└── abis/
    └── CyberFortuneNFT.json
```

### 实体

```graphql
type NFT @entity {
  id: ID!                # tokenId
  tokenId: BigInt!
  owner: Bytes!
  blessing: String!
  rarity: Int!
  mintedAt: BigInt!
  listing: Listing
}

type Listing @entity {
  id: ID!
  nft: NFT!
  seller: Bytes!
  price: BigInt!
  isActive: Boolean!
  listedAt: BigInt!
}

type Transaction @entity {
  id: ID!                # txHash-logIndex
  nft: NFT!
  eventType: String!
  from: Bytes!
  to: Bytes
  price: BigInt
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

### 事件处理

| 合约事件 | 处理逻辑 |
|---------|---------|
| `Transfer(from, to, tokenId)` | 创建/更新 NFT owner；mint 时读取 blessing + rarity |
| `ItemListed(tokenId, seller, price)` | 创建 Listing + Transaction 记录 |
| `ItemBought(tokenId, buyer, price)` | 标记 Listing 为 inactive + 更新 NFT owner + Transaction |
| `ListingCancelled(tokenId)` | 标记 Listing 为 inactive + Transaction |

---

## Phase 3: API Routes

**所有 API 放在前端** `frontend/src/app/api/market/`（Vercel Serverless）。

### 新建文件

| 文件路径 | 方法 | 说明 |
|---------|------|------|
| `api/market/listings/route.ts` | GET | 分页查询在售列表，支持 rarity/sort 筛选 |
| `api/market/listings/[tokenId]/route.ts` | GET | 单个挂单详情 + 该 NFT 交易历史 |
| `api/market/history/route.ts` | GET | 全局交易历史 |
| `api/market/sync/route.ts` | POST | 从 TheGraph 同步数据到 DB（Vercel Cron 调用） |

### 新建辅助文件

| 文件路径 | 说明 |
|---------|------|
| `frontend/src/lib/subgraph.ts` | TheGraph 查询客户端 |

### Listings API 请求/响应

```
GET /api/market/listings?page=1&limit=20&rarity=3&sort=price_asc

Response: {
  listings: [{ tokenId, blessing, rarity, seller, priceWei, priceEth, listedAt }],
  total, page, totalPages
}
```

### Vercel Cron 配置

在 `frontend/vercel.json` 中添加：

```json
{ "crons": [{ "path": "/api/market/sync", "schedule": "*/2 * * * *" }] }
```

### 新增环境变量

```
THEGRAPH_URL=https://api.studio.thegraph.com/query/xxx/cyber-fortune/version/latest
CRON_SECRET=xxx
```

---

## Phase 4: 前端页面与组件

### 新建组件

| 组件 | 说明 |
|------|------|
| `ListingCard.tsx` | 市场列表卡片（扩展 NFTCard 风格 + 价格/卖家/购买按钮） |
| `MarketFilters.tsx` | 筛选栏（稀有度按钮 + 排序下拉） |
| `ListNFTModal.tsx` | 上架弹窗（价格输入 + 合约调用 listItem） |
| `BuyConfirmModal.tsx` | 购买确认弹窗（价格/卖家/版税 + 合约调用 buyItem） |
| `MarketPagination.tsx` | 翻页组件 |

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `src/app/market/page.tsx` | 替换 Coming Soon → 完整市场页面 |
| `src/app/profile/page.tsx` | NFT 卡片添加"出售"/"取消出售"按钮 |
| `src/lib/contract.ts` | 修复 `NFT_ABI_MARKETPLACE` 事件定义（参数顺序、事件名），并合并到主 ABI |
| `src/lib/types.ts` | 新增 Listing、MarketTransaction 等类型 |

### ABI 修复（已确认问题）

现有 `NFT_ABI_MARKETPLACE` 存在 bug：
- 事件参数顺序错误：合约是 `(tokenId indexed, seller indexed, price)`，ABI 写成了 `(seller indexed, tokenId indexed, price)`
- 事件名错误：合约是 `ListingCancelled`，ABI 写成了 `ItemCanceled`

### 市场页面布局

```
┌─────────────────────────────────────┐
│ Header (已有)                        │
├─────────────────────────────────────┤
│ MarketFilters                        │
│ [All] [N] [R] [SR] [SSR] [SP] [UR]  │
│ Sort: [Newest ▼]                     │
├─────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │Card│ │Card│ │Card│ │Card│        │
│ │    │ │    │ │    │ │    │        │
│ │Price│ │Price│ │Price│ │Price│      │
│ │[Buy]│ │[Buy]│ │[Buy]│ │[Buy]│     │
│ └────┘ └────┘ └────┘ └────┘        │
│                                      │
│ ← 1 2 3 ... →   MarketPagination    │
└─────────────────────────────────────┘
```

### 交互流程

| 操作 | 前端行为 | 合约方法 |
|------|---------|---------|
| 上架 | 打开 ListNFTModal → 输入价格 → 调用合约 | `listItem(tokenId, priceWei)` |
| 购买 | 打开 BuyConfirmModal → 确认 → 调用合约 | `buyItem(tokenId) { value: priceWei }` |
| 下架 | 确认弹窗 → 调用合约 | `cancelListing(tokenId)` |

合约交互使用 wagmi `useWriteContract` + `useWaitForTransactionReceipt`（复用 MintBox.tsx 的模式）。

---

## Phase 5: 集成与数据流

```
用户操作 → wagmi 调用合约 → 链上事件
                                  ↓
                          TheGraph 索引
                                  ↓
              Vercel Cron (每2分钟) → /api/market/sync
                                  ↓
                        PostgreSQL 更新
                                  ↓
              前端 /api/market/listings → 页面渲染
```

---

## 实施顺序

1. **数据库** — 建表 + 数据访问层 (`marketplace.ts`)
2. **ABI 修复** — 修正 `contract.ts` 中的事件定义
3. **类型定义** — 扩展 `types.ts`
4. **子图** — 编写、部署 TheGraph 子图
5. **同步 API** — `/api/market/sync` + subgraph 客户端
6. **读取 API** — listings / history 查询接口
7. **前端组件** — ListingCard、Filters、Modal 等
8. **市场页面** — 替换 Coming Soon
9. **Profile 页面** — 添加上架/下架按钮
10. **Vercel 配置** — Cron + 环境变量

---

## 关键文件清单

### 需要复用/参考的现有文件
- `frontend/src/lib/db/index.ts` — DB 连接模式
- `frontend/src/components/MintBox.tsx` — 合约写操作模式
- `frontend/src/components/NFTCard.tsx` — 卡片样式基础
- `frontend/src/components/NFTModal.tsx` — 弹窗样式基础
- `frontend/src/components/RarityBadge.tsx` — 稀有度展示

### 需要修改的文件
- `frontend/src/lib/contract.ts` — 修复 ABI
- `frontend/src/lib/types.ts` — 新增类型
- `frontend/src/app/market/page.tsx` — 重写
- `frontend/src/app/profile/page.tsx` — 添加操作按钮

### 需要新建的文件
- `frontend/src/lib/db/marketplace.ts`
- `frontend/src/lib/subgraph.ts`
- `frontend/src/app/api/market/listings/route.ts`
- `frontend/src/app/api/market/listings/[tokenId]/route.ts`
- `frontend/src/app/api/market/history/route.ts`
- `frontend/src/app/api/market/sync/route.ts`
- `frontend/src/components/ListingCard.tsx`
- `frontend/src/components/MarketFilters.tsx`
- `frontend/src/components/ListNFTModal.tsx`
- `frontend/src/components/BuyConfirmModal.tsx`
- `frontend/src/components/MarketPagination.tsx`
- `subgraph/` 整个目录

---

## 验证方式

1. **数据库** — 本地运行 initializeMarketplaceTables()，验证表创建成功
2. **子图** — 部署后在 Subgraph Studio Playground 查询确认数据索引
3. **同步** — 手动调用 /api/market/sync，检查 DB 数据与子图一致
4. **API** — curl 测试各接口返回正确分页数据
5. **前端** — 连接钱包后测试完整流程：上架 → 市场展示 → 购买 → 下架
6. **构建** — `pnpm build` 通过，无类型错误
