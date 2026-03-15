# 赛博算命前端 DApp 设计

> **For agentic workers:** Use superpowers:writing-plans skill to implement this design.

---

## 1. 项目概览

**项目名称**: 赛博算命 (Cyber Fortune) 前端 DApp
**目标用户**: Web3 新手和 NFT 爱好者
**设计风格**: 赛博朋克（霓虹色、黑暗背景、科技感）

---

## 2. 技术栈

- **框架**: Next.js 14 (App Router)
- **Web3**: wagmi v2 + RainbowKit v2 + viem
- **样式**: Tailwind CSS
- **状态管理**: React Query + wagmi hooks
- **HTTP Client**: fetch (内置)

---

## 3. 页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | Mint 盲盒 + 排行榜 |
| 市场 | `/market` | 浏览/购买/上架 NFT |
| 个人中心 | `/profile` | 用户 NFT 收藏 |

---

## 4. 视觉设计

### 4.1 配色方案

| 用途 | 颜色 |
|------|------|
| 背景 | `#0a0a0f` (深黑) |
| 主色 | `#00fff5` (霓虹青) |
| 辅色 | `#ff00ff` (霓虹粉) |
| 强调 | `#ffff00` (霓虹黄) |
| 文字 | `#ffffff` (白色) |
| 次要文字 | `#888888` (灰色) |

### 4.2 稀有度配色

| 稀有度 | 颜色 | 样式 | 概率 |
|--------|------|------|------|
| N (普通) | `#888888` | 灰色边框，深色背景 | 50% |
| R (稀有) | `#00aaff` | 蓝色边框，轻微发光 | 25% |
| SR (超稀有) | `#a855f7` | 紫色边框，星星装饰 | 15% |
| SSR (超超稀有) | `#ffd700` | 金色边框，金光闪烁效果 | 7% |
| SP (特殊) | `#ef4444` | 红色边框，强烈红光动画 | 2.5% |
| UR (传说) | `#ec4899` | 梦幻极光渐变（粉紫→天蓝→米白），极光流动效果，边缘发光 | 0.5% |

### 4.3 UI 元素

- 玻璃拟态卡片：`backdrop-blur` + 半透明背景
- 霓虹边框发光：`box-shadow` + `border`
- 扫描线动画：CSS keyframes
- 加载动画：旋转光圈

---

## 5. 首页设计

### 5.1 布局

```
+----------------------------------+
|          Header (导航)           |
+----------------------------------+
|                                  |
|         Hero Section             |
|    "赛博算命 - AI 祝福 NFT"      |
|      [开始算命] 按钮             |
|                                  |
+----------------------------------+
|                                  |
|       Mint Section               |
|    +------------------------+    |
|    |    盲盒卡片区域        |    |
|    |   (点击开始算命)      |    |
|    +------------------------+    |
|                                  |
+----------------------------------+
|                                  |
|       Leaderboard Section        |
|    排行榜 Top 10                |
|    地址 | 稀有度统计             |
|                                  |
+----------------------------------+
```

### 5.2 Mint 流程

```
1. 用户点击 [开始算命]
2. 后端 API 生成祝福语 + 签名 + 过期时间
3. 用户确认 Mint（显示费用 0.01 ETH）
4. 用户签名交易
5. 合约调用 mint()
6. 揭示 NFT（动画后显示结果）
7. 展示 NFT 卡片（祝福语 + 稀有度）
```

### 5.3 排行榜

- 显示 Top 10 用户
- 字段：排名、钱包地址(缩写)、总 Mint 数量、稀有度分布

---

## 6. 市场页面

### 6.1 布局

```
+----------------------------------+
|          Header (导航)           |
+----------------------------------+
|  [全部] [N] [R] [SR] [SSR] [SP] [UR]  (筛选) |
+----------------------------------+
|                                  |
|    NFT 网格 (3-4 列)             |
|    +-------+ +-------+ +-------+ |
|    | NFT  | | NFT  | | NFT  | |
|    |卡片  | |卡片  | |卡片  | |
|    +-------+ +-------+ +-------+ |
|                                  |
+----------------------------------+
```

### 6.2 功能

- **上架**: 拥有者输入价格 → 签名 → 合约 `listItem()`
- **购买**: 购买者支付 ETH → 合约 `buyItem()`
- **取消**: 上架者可取消 `cancelListing()`

### 6.3 NFT 卡片信息

- NFT 图片 (SVG)
- 祝福语 (截断)
- 稀有度标签
- 价格 (ETH)
- 上架者地址

---

## 7. 个人中心

### 7.1 布局

```
+----------------------------------+
|          Header (导航)           |
+----------------------------------+
|                                  |
|    用户信息                      |
|    地址 | 余额                   |
|                                  |
+----------------------------------+
|                                  |
|    我的 NFT (网格)               |
|    +-------+ +-------+          |
|    | NFT  | | NFT  |          |
|    +-------+ +-------+          |
|    [上架] [查看] 按钮           |
|                                  |
+----------------------------------+
```

### 7.2 功能

- 查看用户所有 NFT
- 上架 NFT 到市场
- 查看 NFT 详情

---

## 8. 核心组件

| 组件 | 路径 | 功能 |
|------|------|------|
| `ConnectWallet` | `components/ConnectWallet.tsx` | 钱包连接按钮 |
| `Header` | `components/Header.tsx` | 导航栏 |
| `NFTCard` | `components/NFTCard.tsx` | NFT 展示卡片 |
| `MintBox` | `components/MintBox.tsx` | 盲盒抽取组件 |
| `RarityBadge` | `components/RarityBadge.tsx` | 稀有度标签 |
| `Leaderboard` | `components/Leaderboard.tsx` | 排行榜组件 |
| `MarketGrid` | `components/MarketGrid.tsx` | 市场 NFT 网格 |
| `NFTModal` | `components/NFTModal.tsx` | NFT 详情弹窗 |

---

## 9. API 接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/mint/generate` | POST | 生成祝福语 + 签名 |
| `/api/nft/:tokenId` | GET | 获取 NFT 详情 |
| `/api/leaderboard` | GET | 获取排行榜数据 |

---

## 10. 合约交互

使用 wagmi 的 `useWriteContract` 和 `useReadContract`。

### 10.1 主要函数

| 函数 | 类型 | 功能 |
|------|------|------|
| `mint` | write | Mint 新 NFT |
| `listItem` | write | 上架 NFT |
| `buyItem` | write | 购买 NFT |
| `cancelListing` | write | 取消上架 |
| `getListedItems` | read | 获取上架列表 |
| `balanceOf` | read | 查询用户 NFT 数量 |
| `tokenOfOwnerByIndex` | read | 获取用户 NFT ID |

---

## 11. 环境变量

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=<部署后填写>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<WalletConnect ID>
```

---

## 12. 路由配置

```
src/app/
├── layout.tsx          # 全局布局 + Providers
├── page.tsx            # 首页 (Mint + 排行榜)
├── market/
│   └── page.tsx        # 市场页面
├── profile/
│   └── page.tsx        # 个人中心
└── providers.tsx       # Wagmi + Query Providers
```

---

## 13. 动画效果

### 13.1 Mint 开盒动画

1. 盲盒旋转 (1秒)
2. 光效爆发 (0.5秒)
3. 揭示 NFT (0.5秒)

### 13.2 页面过渡

- 路由切换使用 Next.js 默认过渡

### 13.3 悬停效果

- 卡片放大: `scale(1.02)`
- 边框发光增强

---

## 14. 错误处理

| 场景 | 处理 |
|------|------|
| 钱包未连接 | 显示连接按钮 |
| Mint 失败 | Toast 提示错误信息 |
| 交易被拒绝 | 提示用户确认 |
| API 请求失败 | 显示重试按钮 |
| 合约错误 | 显示错误码 |

---

## 15. 响应式设计

| 断点 | 列数 |
|------|------|
| < 640px | 1 列 |
| 640-1024px | 2 列 |
| > 1024px | 3-4 列 |

---

## 16. 待定事项

- [ ] 部署合约后填写 CONTRACT_ADDRESS
- [ ] 申请 WalletConnect Project ID
- [ ] 生产环境后端 URL
