const THEGRAPH_URL = process.env.THEGRAPH_URL;

if (!THEGRAPH_URL) {
  console.warn('THEGRAPH_URL is not set. Subgraph queries will fail.');
}

// TheGraph 查询客户端
export async function querySubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!THEGRAPH_URL) {
    throw new Error('THEGRAPH_URL is not configured');
  }

  const response = await fetch(THEGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Subgraph query failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Subgraph query error: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return result.data;
}

// 查询所有活跃挂单
export const ACTIVE_LISTINGS_QUERY = `
  query GetActiveListings($first: Int!, $skip: Int!) {
    listings(
      where: { isActive: true }
      first: $first
      skip: $skip
      orderBy: listedAt
      orderDirection: desc
    ) {
      id
      seller
      price
      isActive
      listedAt
      nft {
        id
        tokenId
        owner
        blessing
        rarity
        mintedAt
      }
    }
  }
`;

// 查询单个 NFT
export const NFT_QUERY = `
  query GetNFT($id: ID!) {
    nft(id: $id) {
      id
      tokenId
      owner
      blessing
      rarity
      mintedAt
      listing {
        id
        seller
        price
        isActive
        listedAt
      }
    }
  }
`;

// 查询交易历史
export const TRANSACTIONS_QUERY = `
  query GetTransactions($first: Int!, $skip: Int!, $tokenId: BigInt) {
    transactions(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: { nft: $tokenId }
    ) {
      id
      eventType
      from
      to
      price
      timestamp
      blockNumber
    }
  }
`;

// 查询所有 NFT（用于全量同步）
export const ALL_NFTS_QUERY = `
  query GetAllNFTs($first: Int!, $skip: Int!) {
    nfts(
      first: $first
      skip: $skip
      orderBy: tokenId
      orderDirection: asc
    ) {
      id
      tokenId
      owner
      blessing
      rarity
      mintedAt
    }
  }
`;

// 查询所有 Listings（用于全量同步）
export const ALL_LISTINGS_QUERY = `
  query GetAllListings($first: Int!, $skip: Int!) {
    listings(
      first: $first
      skip: $skip
      orderBy: listedAt
      orderDirection: desc
    ) {
      id
      seller
      price
      isActive
      listedAt
    }
  }
`;

// 查询所有 Transactions（用于全量同步）
export const ALL_TRANSACTIONS_QUERY = `
  query GetAllTransactions($first: Int!, $skip: Int!) {
    transactions(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      eventType
      from
      to
      price
      timestamp
      blockNumber
    }
  }
`;

// Types
export interface SubgraphListing {
  id: string;
  seller: string;
  price: string;
  isActive: boolean;
  listedAt: string;
  nft: {
    id: string;
    tokenId: string;
    owner: string;
    blessing: string;
    rarity: number;
    mintedAt: string;
  };
}

export interface SubgraphNFT {
  id: string;
  tokenId: string;
  owner: string;
  blessing: string;
  rarity: number;
  mintedAt: string;
  listing: SubgraphListing | null;
}

export interface SubgraphTransaction {
  id: string;
  eventType: string;
  from: string | null;
  to: string | null;
  price: string | null;
  timestamp: string;
  blockNumber: string;
}

// 分页获取所有数据
export async function getAllItems<T>(
  query: string,
  variablesFn: (skip: number) => Record<string, unknown>,
  batchSize: number = 1000
): Promise<T[]> {
  const items: T[] = [];
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    const data = await querySubgraph<{ items: T[] }>(query, variablesFn(skip));
    const batch = data.items;

    if (batch.length < batchSize) {
      hasMore = false;
    } else {
      skip += batchSize;
    }

    items.push(...batch);
  }

  return items;
}
