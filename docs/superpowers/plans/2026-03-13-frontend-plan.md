# 赛博算命前端 DApp 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现赛博算命 NFT DApp 前端，包含钱包连接、Mint 盲盒、市场交易、排行榜功能

**Architecture:** Next.js 14 App Router + wagmi + RainbowKit，赛博朋克视觉风格，所有页面组件化

**Tech Stack:** Next.js 14, wagmi v2, RainbowKit v2, viem, Tailwind CSS

---

## 文件结构

```
frontend/src/
├── app/
│   ├── layout.tsx          # 已存在，需修改
│   ├── page.tsx            # 已存在，需修改 (首页)
│   ├── globals.css         # 已存在，需修改
│   ├── providers.tsx       # 新建：Wagmi + Query Providers
│   ├── market/
│   │   └── page.tsx        # 新建：市场页面
│   └── profile/
│       └── page.tsx        # 新建：个人中心页面
├── components/
│   ├── ConnectWallet.tsx   # 新建：钱包连接
│   ├── Header.tsx          # 新建：导航栏
│   ├── NFTCard.tsx        # 新建：NFT 卡片
│   ├── MintBox.tsx         # 新建：盲盒组件
│   ├── RarityBadge.tsx     # 新建：稀有度标签
│   ├── Leaderboard.tsx     # 新建：排行榜
│   ├── MarketGrid.tsx      # 新建：市场网格
│   └── NFTModal.tsx        # 新建：NFT 详情弹窗
├── lib/
│   ├── wagmi.ts            # 新建：wagmi 配置
│   ├── contract.ts         # 新建：合约 ABI
│   └── constants.ts        # 新建：常量配置
├── hooks/
│   └── useNFT.ts           # 新建：NFT 相关 hooks
└── types/
    └── index.ts            # 新建：类型定义
```

---

## Chunk 1: 项目基础配置

### Task 1: 配置 Tailwind CSS 赛博朋克主题

**Files:**
- Modify: `frontend/src/app/globals.css`
- Create: `frontend/tailwind.config.js`

- [ ] **Step 1: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          primary: '#00fff5',
          secondary: '#ff00ff',
          accent: '#ffff00',
        },
        rarity: {
          n: '#888888',
          r: '#00ff00',
          sr: '#00aaff',
          ssr: '#ff00ff',
          sp: '#ff8800',
          ur: '#ffd700',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00fff5' },
          '100%': { boxShadow: '0 0 20px #00fff5, 0 0 30px #00fff5' },
        }
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: 更新 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --cyber-bg: #0a0a0f;
  --cyber-primary: #00fff5;
  --cyber-secondary: #ff00ff;
  --cyber-accent: #ffff00;
}

body {
  background-color: var(--cyber-bg);
  color: #ffffff;
  font-family: ui-monospace, monospace;
}

/* 霓虹边框 */
.neon-border {
  border: 1px solid var(--cyber-primary);
  box-shadow: 0 0 5px var(--cyber-primary), inset 0 0 5px var(--cyber-primary);
}

/* 玻璃拟态 */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js frontend/src/app/globals.css
git commit -m "feat(frontend): add Tailwind cyberpunk theme"
```

---

### Task 2: 创建 Wagmi 配置和 Providers

**Files:**
- Create: `frontend/src/lib/wagmi.ts`
- Create: `frontend/src/app/providers.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: 创建 wagmi.ts**

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Cyber Fortune',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [mainnet, base],
  ssr: true,
});

export const CHAIN = base;
```

- [ ] **Step 2: 创建 providers.tsx**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00fff5',
            accentColorForeground: '#0a0a0f',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 3: 更新 layout.tsx**

```typescript
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: '赛博算命 - AI 祝福 NFT',
  description: '基于 AI 的祝福 NFT 盲盒',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/wagmi.ts frontend/src/app/providers.tsx frontend/src/app/layout.tsx
git commit -m "feat(frontend): add Wagmi and RainbowKit providers"
```

---

### Task 3: 创建合约 ABI 和常量

**Files:**
- Create: `frontend/src/lib/contract.ts`
- Create: `frontend/src/lib/constants.ts`

- [ ] **Step 1: 创建 constants.ts**

```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export const MINT_FEE = '0.01'; // ETH
```

- [ ] **Step 2: 创建 contract.ts (ABI)**

```typescript
export const NFT_ABI = [
  // ERC721
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  // Mint
  "function mint(string blessing, uint8 rarity, uint256 expiresAt, uint256 nonce, bytes signature) payable",
  // Marketplace
  "function listItem(uint256 tokenId, uint256 price) payable",
  "function buyItem(uint256 tokenId) payable",
  "function cancelListing(uint256 tokenId)",
  "function getListing(uint256 tokenId) view returns (address seller, uint256 price, bool isListed)",
  // Views
  "function totalSupply() view returns (uint256)",
  "function getBlessing(uint256 tokenId) view returns (string)",
  "function getRarity(uint256 tokenId) view returns (uint8)",
] as const;

export const NFT_ABI_MARKETPLACE = [
  "event ItemListed(address indexed seller, uint256 indexed tokenId, uint256 price)",
  "event ItemBought(address indexed buyer, uint256 indexed tokenId, uint256 price)",
  "event ItemCanceled(address indexed seller, uint256 indexed tokenId)",
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/contract.ts frontend/src/lib/constants.ts
git commit -m "feat(frontend): add contract ABI and constants"
```

---

## Chunk 2: 核心组件

### Task 4: 创建基础 UI 组件

**Files:**
- Create: `frontend/src/components/RarityBadge.tsx`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/ConnectWallet.tsx`

- [ ] **Step 1: 创建 RarityBadge.tsx**

```typescript
type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const RARITY_CONFIG: Record<Rarity, { name: string; color: string }> = {
  0: { name: 'N', color: '#888888' },
  1: { name: 'R', color: '#00ff00' },
  2: { name: 'SR', color: '#00aaff' },
  3: { name: 'SSR', color: '#ff00ff' },
  4: { name: 'SP', color: '#ff8800' },
  5: { name: 'UR', color: '#ffd700' },
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const config = RARITY_CONFIG[rarity];
  return (
    <span
      className="px-2 py-1 rounded text-xs font-bold"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}`,
      }}
    >
      {config.name}
    </span>
  );
}
```

- [ ] **Step 2: 创建 ConnectWallet.tsx**

```typescript
'use client';

import { useAccount, useConnectModal, useDisconnect } from '@rainbow-me/rainbowkit';
import { useDisconnect as useWagmiDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useWagmiDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-cyber-primary font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 border border-cyber-secondary text-cyber-secondary rounded hover:bg-cyber-secondary hover:text-black transition-all"
        >
          断开
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openConnectModal}
      className="px-6 py-2 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all"
    >
      连接钱包
    </button>
  );
}
```

- [ ] **Step 3: 创建 Header.tsx**

```typescript
'use client';

import Link from 'next/link';
import { ConnectWallet } from './ConnectWallet';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-cyber-primary">
          赛博算命
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-white hover:text-cyber-primary transition-colors">
            首页
          </Link>
          <Link href="/market" className="text-white hover:text-cyber-primary transition-colors">
            市场
          </Link>
          <Link href="/profile" className="text-white hover:text-cyber-primary transition-colors">
            我的
          </Link>
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/RarityBadge.tsx frontend/src/components/Header.tsx frontend/src/components/ConnectWallet.tsx
git commit -m "feat(frontend): add base UI components"
```

---

### Task 5: 创建 NFT 卡片和 Modal

**Files:**
- Create: `frontend/src/components/NFTCard.tsx`
- Create: `frontend/src/components/NFTModal.tsx`

- [ ] **Step 1: 创建 NFTCard.tsx**

```typescript
'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFTCardProps {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price?: string;
  seller?: string;
  isListed?: boolean;
  onBuy?: () => void;
  onList?: () => void;
}

export function NFTCard({
  tokenId,
  blessing,
  rarity,
  price,
  seller,
  isListed,
  onBuy,
  onList,
}: NFTCardProps) {
  return (
    <div className="glass rounded-lg overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
      {/* SVG 占位图 */}
      <div className="aspect-square bg-black/50 flex items-center justify-center">
        <div className="text-6xl">🎁</div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">#{tokenId}</span>
          <RarityBadge rarity={rarity} />
        </div>
        <p className="text-sm text-gray-300 truncate mb-2">{blessing}</p>
        {price && (
          <div className="flex items-center justify-between">
            <span className="text-cyber-primary font-bold">{price} ETH</span>
            {isListed ? (
              <button
                onClick={onBuy}
                className="px-3 py-1 bg-cyber-primary text-black text-sm rounded font-bold hover:bg-white transition-colors"
              >
                购买
              </button>
            ) : (
              <button
                onClick={onList}
                className="px-3 py-1 border border-cyber-secondary text-cyber-secondary text-sm rounded hover:bg-cyber-secondary hover:text-black transition-colors"
              >
                上架
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 NFTModal.tsx**

```typescript
'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price?: string;
}

export function NFTModal({ isOpen, onClose, tokenId, blessing, rarity, price }: NFTModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative glass rounded-lg p-6 max-w-md w-full mx-4 neon-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <div className="text-center">
          <div className="aspect-square bg-black/50 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-8xl">🎁</div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-400">#{tokenId}</span>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-lg mb-4">{blessing}</p>
          {price && (
            <p className="text-2xl text-cyber-primary font-bold mb-4">{price} ETH</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NFTCard.tsx frontend/src/components/NFTModal.tsx
git commit -m "feat(frontend): add NFT card and modal components"
```

---

## Chunk 3: 首页 - Mint + 排行榜

### Task 6: 创建 MintBox 组件

**Files:**
- Create: `frontend/src/components/MintBox.tsx`

- [ ] **Step 1: 创建 MintBox.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS, MINT_FEE } from '@/lib/constants';
import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface MintResult {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
}

export function MintBox() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<'idle' | 'generating' | 'ready' | 'minting' | 'revealed'>('idle');
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleStart = async () => {
    if (!isConnected) return;
    setStep('generating');
    setError(null);

    try {
      // 调用后端生成祝福语
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mint/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      setResult({
        tokenId: 0, // 等 mint 后获取
        blessing: data.blessing,
        rarity: data.rarity,
      });
      setStep('ready');
    } catch (err) {
      setError('生成祝福语失败');
      setStep('idle');
    }
  };

  const handleMint = async () => {
    if (!result) return;
    setStep('minting');

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [
          result.blessing,
          result.rarity,
          Math.floor(Date.now() / 1000) + 300, // 5分钟过期
          Math.floor(Math.random() * 1000000),
          // 签名需要从后端获取
        ],
        value: parseEther(MINT_FEE),
      });
    } catch (err) {
      setError('Mint 失败');
      setStep('idle');
    }
  };

  // 交易确认后揭示
  if (isSuccess && step === 'minting') {
    setStep('revealed');
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">请先连接钱包</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-8 text-center">
      {step === 'idle' && (
        <>
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2">开始你的算命之旅</h2>
          <p className="text-gray-400 mb-4">费用: {MINT_FEE} ETH</p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all"
          >
            开始算命
          </button>
        </>
      )}

      {step === 'generating' && (
        <div className="py-8">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>正在生成你的命运...</p>
        </div>
      )}

      {step === 'ready' && result && (
        <>
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-4">命运已注定</h2>
          <p className="text-gray-400 mb-4">确认后将揭示你的祝福</p>
          <button
            onClick={handleMint}
            disabled={isPending}
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all disabled:opacity-50"
          >
            {isPending ? '处理中...' : `确认 Mint (${MINT_FEE} ETH)`}
          </button>
        </>
      )}

      {(step === 'minting' || (isConfirming && step === 'minting')) && (
        <div className="py-8">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-secondary border-t-transparent rounded-full mx-auto mb-4" />
          <p>链上确认中...</p>
        </div>
      )}

      {step === 'revealed' && result && (
        <div className="animate-[glow_2s_ease-in-out_infinite_alternate]">
          <div className="text-8xl mb-4">🎊</div>
          <RarityBadge rarity={result.rarity} />
          <p className="text-xl mt-4">{result.blessing}</p>
          <button
            onClick={() => setStep('idle')}
            className="mt-4 px-6 py-2 border border-cyber-primary text-cyber-primary rounded hover:bg-cyber-primary hover:text-black transition-all"
          >
            再算一次
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/MintBox.tsx
git commit -m "feat(frontend): add MintBox component"
```

---

### Task 7: 创建排行榜组件

**Files:**
- Create: `frontend/src/components/Leaderboard.tsx`

- [ ] **Step 1: 创建 Leaderboard.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface LeaderboardItem {
  address: string;
  totalMinted: number;
  rarityBreakdown: {
    N: number;
    R: number;
    SR: number;
    SSR: number;
    SP: number;
    UR: number;
  };
}

export function Leaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-cyber-primary">排行榜</h2>
      </div>
      <div className="divide-y divide-gray-800">
        {items.length === 0 ? (
          <p className="p-4 text-gray-400 text-center">暂无数据</p>
        ) : (
          items.map((item, index) => (
            <div key={item.address} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-600">
                  {index + 1}
                </span>
                <span className="font-mono text-sm">
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">共 {item.totalMinted}</span>
                {item.rarityBreakdown.UR > 0 && (
                  <span className="px-2 py-0.5 bg-rarity-ur/20 text-rarity-ur text-xs rounded">
                    UR x{item.rarityBreakdown.UR}
                  </span>
                )}
                {item.rarityBreakdown.SP > 0 && (
                  <span className="px-2 py-0.5 bg-rarity-sp/20 text-rarity-sp text-xs rounded">
                    SP x{item.rarityBreakdown.SP}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Leaderboard.tsx
git commit -m "feat(frontend): add Leaderboard component"
```

---

### Task 8: 更新首页

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: 更新 page.tsx**

```typescript
import { Header } from '@/components/Header';
import { MintBox } from '@/components/MintBox';
import { Leaderboard } from '@/components/Leaderboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-cyber-primary mb-4">
            赛博算命
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            AI 生成的祝福 NFT，稀有度由天注定
          </p>
        </section>

        {/* Mint Section */}
        <section className="max-w-2xl mx-auto px-4 mb-16">
          <MintBox />
        </section>

        {/* Leaderboard Section */}
        <section className="max-w-4xl mx-auto px-4">
          <Leaderboard />
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(frontend): update home page with Mint and Leaderboard"
```

---

## Chunk 4: 市场页面

### Task 9: 创建市场页面

**Files:**
- Create: `frontend/src/app/market/page.tsx`
- Create: `frontend/src/components/MarketGrid.tsx`

- [ ] **Step 1: 创建 MarketGrid.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFTCard } from './NFTCard';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface ListedNFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price: string;
  seller: string;
}

export function MarketGrid() {
  const { isConnected } = useAccount();
  const [nfts, setNfts] = useState<ListedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Rarity | 'all'>('all');

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // TODO: 从后端或合约获取上架列表
    setLoading(false);
  }, []);

  const handleBuy = (nft: ListedNFT) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'buyItem',
      args: [BigInt(nft.tokenId)],
      value: parseEther(nft.price),
    });
  };

  const filteredNFTs = filter === 'all' ? nfts : nfts.filter(n => n.rarity === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded transition-all ${
            filter === 'all' ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
          }`}
        >
          全部
        </button>
        {([0, 1, 2, 3, 4, 5] as Rarity[]).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded transition-all ${
              filter === r ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
            }`}
          >
            {['N', 'R', 'SR', 'SSR', 'SP', 'UR'][r]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredNFTs.length === 0 ? (
        <p className="text-center text-gray-400 py-16">暂无上架 NFT</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map(nft => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              blessing={nft.blessing}
              rarity={nft.rarity}
              price={nft.price}
              isListed
              onBuy={() => handleBuy(nft)}
            />
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: 创建 market/page.tsx**

```typescript
import { Header } from '@/components/Header';
import { MarketGrid } from '@/components/MarketGrid';

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-cyber-primary mb-8">市场</h1>
        <MarketGrid />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/MarketGrid.tsx frontend/src/app/market/page.tsx
git commit -m "feat(frontend): add market page"
```

---

## Chunk 5: 个人中心

### Task 10: 创建个人中心页面

**Files:**
- Create: `frontend/src/app/profile/page.tsx`

- [ ] **Step 1: 创建 profile/page.tsx**

```typescript
'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { NFTCard } from '@/components/NFTCard';
import { NFTModal } from '@/components/NFTModal';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (!address || !balance) {
      setLoading(false);
      return;
    }

    // TODO: 获取用户所有 NFT
    setNfts([]);
    setLoading(false);
  }, [address, balance]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-cyber-bg">
        <Header />
        <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">请先连接钱包</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4">
        {/* User Info */}
        <div className="glass rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">我的收藏</h1>
          <p className="text-gray-400 font-mono">{address}</p>
          <p className="text-cyber-primary mt-2">拥有 {balance?.toString() || 0} 个 NFT</p>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full" />
          </div>
        ) : nfts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">暂无 NFT</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map(nft => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                blessing={nft.blessing}
                rarity={nft.rarity}
                onList={() => setSelectedNFT(nft)}
              />
            ))}
          </div>
        )}

        {/* NFT Modal */}
        {selectedNFT && (
          <NFTModal
            isOpen={!!selectedNFT}
            onClose={() => setSelectedNFT(null)}
            tokenId={selectedNFT.tokenId}
            blessing={selectedNFT.blessing}
            rarity={selectedNFT.rarity}
          />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/profile/page.tsx
git commit -m "feat(frontend): add profile page"
```

---

## Chunk 6: 构建验证

### Task 11: 构建测试

**Files:**
- N/A

- [ ] **Step 1: 安装依赖并构建**

```bash
cd frontend
pnpm install
pnpm build
```

- [ ] **Step 2: 验证构建成功**

Expected: 构建无错误

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(frontend): complete Phase 4 frontend DApp"
```

---

## 总结

此计划包含 11 个 Task，分为 6 个 Chunk：

1. **Chunk 1**: 项目基础配置 (Tailwind, Wagmi, ABI)
2. **Chunk 2**: 核心 UI 组件 (Header, ConnectWallet, RarityBadge, NFTCard, Modal)
3. **Chunk 3**: 首页 (MintBox, Leaderboard)
4. **Chunk 4**: 市场页面 (MarketGrid)
5. **Chunk 5**: 个人中心 (Profile)
6. **Chunk 6**: 构建验证
