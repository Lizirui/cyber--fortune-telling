# Cyber Fortune NFT - The Graph 子图部署指南

本文档详细介绍如何部署 The Graph 子图以索引 Cyber Fortune NFT 合约数据。

---

## 目录

1. [概述](#1-概述)
2. [前置条件](#2-前置条件)
3. [项目结构](#3-项目结构)
4. [部署步骤](#4-部署步骤)
5. [验证部署](#5-验证部署)
6. [查询示例](#6-查询示例)
7. [更新子图](#7-更新子图)
8. [常见问题](#8-常见问题)

---

## 1. 概述

### 1.1 什么是 The Graph？

The Graph 是一个去中心化协议，用于索引和查询区块链数据。它允许你定义子图（subgraph），指定要索引哪些智能合约事件，并提供 GraphQL API 来查询数据。

### 1.2 本项目子图功能

本子图索引以下数据：

| 实体 | 描述 |
|------|------|
| NFT | NFT 元数据（tokenId, owner, blessing, rarity, mintedAt） |
| Listing | 挂单信息（seller, price, isActive, listedAt） |
| Transaction | 交易历史（eventType, from, to, price, timestamp） |

### 1.3 索引的事件

| 事件 | 处理函数 | 功能 |
|------|----------|------|
| `Transfer` | handleTransfer | 创建/更新 NFT，记录所有者变更 |
| `ItemListed` | handleItemListed | 创建挂单记录 |
| `ItemBought` | handleItemBought | 更新 NFT 所有权，标记挂单为非活跃 |
| `ListingCancelled` | handleListingCancelled | 标记挂单为非活跃 |

---

## 2. 前置条件

### 2.1 必需工具

```bash
# 安装 Node.js (>= 18)
node --version

# 安装 graph-cli
npm install -g @graphprotocol/graph-cli

# 或使用 pnpm
pnpm install -g @graphprotocol/graph-cli
```

### 2.2 The Graph 账户

1. 打开 https://thegraph.com/studio/
2. 使用邮箱注册账户
3. 创建子图项目

### 2.3 合约要求

合约必须实现以下函数（子图需要调用）：

```solidity
function getBlessing(uint256 tokenId) external view returns (string memory);
function getRarity(uint256 tokenId) external view returns (uint8);
function ownerOf(uint256 tokenId) external view returns (address);
```

**注意**: 合约已更新，包含这些函数。

---

## 3. 项目结构

```
subgraph/
├── subgraph.yaml          # 子图配置文件
├── schema.graphql        # 数据模型定义
├── package.json          # 依赖和脚本
├── abis/
│   └── CyberFortuneNFT.json  # 合约 ABI
└── src/
    └── mapping.ts        # 事件处理映射
```

### 3.1 schema.graphql

```graphql
type NFT @entity {
  id: ID!
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
  id: ID!
  nft: NFT!
  eventType: String!
  from: Bytes
  to: Bytes
  price: BigInt
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

---

## 4. 部署步骤

### 4.1 安装依赖

```bash
cd /Users/lizirui/Desktop/lizirui/web3/cyber--fortune-telling/subgraph
pnpm install
```

### 4.2 生成代码

```bash
pnpm codegen
```

这会根据 `schema.graphql` 和 ABI 生成 TypeScript 类型。

### 4.3 构建子图

```bash
pnpm build
```

### 4.4 部署到 The Graph Studio

#### 方式一：使用 CLI

```bash
# 部署到 Studio
pnpm deploy

# 或指定版本
pnpm deploy --version 0.0.1
```

这会提示你：
1. 选择部署网络 (base-sepolia)
2. 输入子图名称 (例如: cyber-fortune)
3. 输入部署密钥 (从 The Graph Studio 获取)

#### 方式二：手动部署

```bash
# 1. 登录 Studio
graph auth https://api.studio.thegraph.com <your-access-token>

# 2. 创建子图 (首次)
graph create cyber-fortune --node https://api.studio.thegraph.com/deploy

# 3. 部署子图
graph deploy cyber-fortune --ipfs https://api.studio.thegraph.com/ipfs --node https://api.studio.thegraph.com/deploy
```

### 4.5 部署参数

| 参数 | 值 |
|------|-----|
| 网络 | base-sepolia |
| 合约地址 | 0x257752169fdf275d91De20e281f0e11538Fd7007 |
| 开始区块 | 1780000 |

---

## 5. 验证部署

### 5.1 The Graph Studio

1. 打开 https://thegraph.com/studio/
2. 找到你的子图
3. 查看 "Status" - 应该显示 "Synced"

### 5.2 GraphQL Playground

在 Studio 中点击 "Playground" 打开 GraphQL IDE。

### 5.3 检查同步状态

```graphql
{
  _meta {
    block {
      number
    }
    hasIndexingErrors
  }
}
```

---

## 6. 查询示例

### 6.1 查询所有 NFT

```graphql
{
  nfts(first: 10, orderBy: mintedAt, orderDirection: desc) {
    id
    tokenId
    owner
    blessing
    rarity
    mintedAt
  }
}
```

### 6.2 查询活跃挂单

```graphql
{
  listings(where: { isActive: true }, first: 10) {
    id
    seller
    price
    isActive
    listedAt
    nft {
      tokenId
      blessing
      rarity
      owner
    }
  }
}
```

### 6.3 查询交易历史

```graphql
{
  transactions(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    eventType
    from
    to
    price
    timestamp
    blockNumber
    nft {
      tokenId
      blessing
    }
  }
}
```

### 6.4 查询用户的 NFT

```graphql
{
  nfts(where: { owner: "0x..." }, first: 10) {
    id
    tokenId
    blessing
    rarity
    listing {
      price
      isActive
    }
  }
}
```

### 6.5 获取单个 NFT 详情

```graphql
{
  nft(id: "0") {
    id
    tokenId
    owner
    blessing
    rarity
    mintedAt
    listing {
      seller
      price
      isActive
    }
  }
}
```

---

## 7. 更新子图

如果合约有重大更新需要重新部署：

### 7.1 修改代码

1. 更新 `schema.graphql` (如果数据模型有变化)
2. 更新 `mapping.ts` (如果事件处理逻辑有变化)
3. 更新 `subgraph.yaml` (如果合约地址或事件有变化)

### 7.2 重新部署

```bash
pnpm codegen
pnpm build
pnpm deploy --version <new-version>
```

---

## 8. 常见问题

### 8.1 同步太慢

**问题**: 子图同步需要很长时间

**解决**:
- 减少 `startBlock` 到更接近当前区块
- 或者使用 The Graph 的快速同步功能

### 8.2 索引错误

**问题**: 子图显示索引错误

**解决**:
```bash
# 查看错误详情
graph logs <subgraph-name> --node https://api.studio.thegraph.com/deploy
```

常见错误：
- ABI 不匹配 - 重新生成或手动更新 ABI
- 事件签名错误 - 检查 `subgraph.yaml` 中的事件定义

### 8.3 查询超时

**问题**: GraphQL 查询超时

**解决**:
- 添加索引到常用查询字段
- 使用分页 (`first`, `skip`)
- 限制返回数量

### 8.4 合约函数调用失败

**问题**: `call to contract failed`

**解决**:
- 检查合约是否实现了所需函数
- 检查 ABI 是否正确
- 确认合约地址正确

---

## 附录：完整 subgraph.yaml

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  CyberFortuneNFT:
    kind: ethereum
    name: CyberFortuneNFT
    network: base-sepolia
    source:
      address: "0x257752169fdf275d91De20e281f0e11538Fd7007"
      abi: CyberFortuneNFT
      startBlock: 1780000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - NFT
        - Listing
        - Transaction
      abis:
        - name: CyberFortuneNFT
          file: ./abis/CyberFortuneNFT.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,indexed uint256)
          handler: handleTransfer
        - event: ItemListed(indexed uint256,indexed address,uint256)
          handler: handleItemListed
        - event: ItemBought(indexed uint256,indexed address,uint256)
          handler: handleItemBought
        - event: ListingCancelled(indexed uint256)
          handler: handleListingCancelled
      file: ./src/mapping.ts
```

---

## 附录：环境变量配置

部署后，在前端配置 THEGRAPH_URL：

```bash
# The Graph Studio 端点
THEGRAPH_URL=https://api.studio.thegraph.com/query/<your-subgraph-name>/<version>
```

示例：
```
THEGRAPH_URL=https://api.studio.thegraph.com/query/cyber-fortune/0.0.1
```

---

*文档更新时间: 2026-03-18*
