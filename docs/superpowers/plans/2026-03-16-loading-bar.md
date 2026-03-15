# 页面 Loading 条实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页、市场、个人中心三个页面切换时添加顶部渐变进度条和骨架屏

**Architecture:** 使用 nprogress 实现顶部进度条，使用 Next.js loading.tsx 实现骨架屏

**Tech Stack:** nprogress, Next.js 14 App Router, Tailwind CSS

---

## 任务概览

需要创建/修改的文件：

| 操作 | 文件路径 |
|------|---------|
| 安装 | package.json (添加 nprogress) |
| 创建 | frontend/src/components/ProgressBar.tsx |
| 修改 | frontend/src/app/layout.tsx |
| 创建 | frontend/src/app/loading.tsx |
| 创建 | frontend/src/app/market/loading.tsx |
| 创建 | frontend/src/app/profile/loading.tsx |

---

## Task 1: 安装 nprogress 依赖

- [ ] **Step 1: 安装 nprogress 包**

```bash
cd frontend && pnpm add nprogress @types/nprogress
```

---

## Task 2: 创建顶部渐变进度条组件

- [ ] **Step 1: 创建 ProgressBar.tsx**

创建文件：`frontend/src/components/ProgressBar.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleRouteChange = () => {
      NProgress.done();
    };

    NProgress.start();

    return () => {
      handleRouteChange();
    };
  }, [pathname, searchParams]);

  return (
    <>
      <style jsx global>{`
        #nprogress .bar {
          background: linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4) !important;
          height: 3px !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 9999 !important;
        }
        #nprogress .peg {
          box-shadow: 0 0 10px #8b5cf6, 0 0 5px #8b5cf6 !important;
        }
      `}</style>
    </>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/src/components/ProgressBar.tsx
git commit -m "feat: add gradient progress bar component"
```

---

## Task 3: 在根布局中引入 ProgressBar

- [ ] **Step 1: 修改 layout.tsx**

修改文件：`frontend/src/app/layout.tsx`

在文件顶部添加导入：
```tsx
import ProgressBar from '@/components/ProgressBar';
```

在 `<body>` 标签内添加组件：
```tsx
<body>
  <ProgressBar />
  {/* 其他内容 */}
</body>
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat: integrate progress bar in root layout"
```

---

## Task 4: 创建首页骨架屏

- [ ] **Step 1: 创建首页 loading.tsx**

创建文件：`frontend/src/app/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Logo 占位 */}
      <div className="flex justify-center mb-12">
        <div className="w-48 h-16 bg-gray-800 rounded-lg animate-pulse" />
      </div>

      {/* Mint 区域占位 */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="h-8 w-32 bg-gray-800 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-gray-800 rounded-xl mt-6 animate-pulse" />
        </div>
      </div>

      {/* 统计卡片占位 */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="h-4 w-16 bg-gray-800 rounded mb-2 animate-pulse" />
            <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/src/app/loading.tsx
git commit -m "feat: add homepage loading skeleton"
```

---

## Task 5: 创建市场页面骨架屏

- [ ] **Step 1: 创建市场页面 loading.tsx**

创建文件：`frontend/src/app/market/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题占位 */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        {/* 筛选条件占位 */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-800 rounded-full animate-pulse" />
          ))}
        </div>

        {/* NFT 卡片网格占位 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
            >
              <div className="aspect-square bg-gray-800 animate-pulse" />
              <div className="p-4">
                <div className="h-6 w-3/4 bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/src/app/market/loading.tsx
git commit -m "feat: add market page loading skeleton"
```

---

## Task 6: 创建个人中心骨架屏

- [ ] **Step 1: 创建个人中心 loading.tsx**

创建文件：`frontend/src/app/profile/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部信息占位 */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-800 rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        {/* 统计数据占位 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="h-4 w-16 bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* NFT 列表占位 */}
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-800 rounded mb-4 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-800"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-10 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/src/app/profile/loading.tsx
git commit -m "feat: add profile page loading skeleton"
```

---

## 验证

完成后运行：

```bash
cd frontend && pnpm dev
```

访问 http://localhost:3000 ，在三个页面间切换，验证：
1. 顶部是否出现渐变色进度条
2. 页面切换时是否显示骨架屏

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-16-loading-bar.md`. Ready to execute?**
