/**
 * 稀有度等级
 * 0 = N (普通)
 * 1 = R (稀有)
 * 2 = SR (超级稀有)
 * 3 = SSR (超级超级稀有)
 * 4 = SP (特殊)
 * 5 = UR (终极稀有)
 */
export type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

export const RARITY_NAMES: Record<Rarity, string> = {
  0: 'N',
  1: 'R',
  2: 'SR',
  3: 'SSR',
  4: 'SP',
  5: 'UR',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  0: '#9ca3af', // gray-400
  1: '#22c55e', // green-500
  2: '#3b82f6', // blue-500
  3: '#a855f7', // purple-500
  4: '#f59e0b', // amber-500
  5: '#ef4444', // red-500
};

// 市场挂单
export interface Listing {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  seller: string;
  priceWei: string;
  priceEth: string;
  listedAt: string;
}

// 市场交易记录
export interface MarketTransaction {
  id: number;
  tokenId: number;
  eventType: 'listed' | 'bought' | 'cancelled';
  fromAddress: string | null;
  toAddress: string | null;
  priceWei: string | null;
  priceEth: string | null;
  txHash: string;
  blockNumber: bigint | null;
  blockTimestamp: string | null;
  createdAt: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// 挂单详情（含交易历史）
export interface ListingDetail extends Listing {
  owner: string;
  transactions: MarketTransaction[];
}
