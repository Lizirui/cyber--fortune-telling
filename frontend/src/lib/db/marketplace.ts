import { Pool } from 'pg';

// 模块级单例 Pool，在 serverless 环境中跨请求复用
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (connectionString) {
      const url = new URL(connectionString);
      if (!url.searchParams.has('uselibpqcompat')) {
        url.searchParams.set('uselibpqcompat', 'true');
      }
      if (!url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'require');
      }
      connectionString = url.toString();
    }

    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// 初始化市场相关表
export async function initializeMarketplaceTables(): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS nfts (
        token_id INTEGER PRIMARY KEY,
        blessing TEXT NOT NULL,
        rarity SMALLINT NOT NULL,
        owner_address VARCHAR(42) NOT NULL,
        minted_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_nfts_rarity ON nfts(rarity)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        token_id INTEGER PRIMARY KEY,
        seller_address VARCHAR(42) NOT NULL,
        price_wei VARCHAR(78) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        listed_at TIMESTAMP DEFAULT NOW(),
        tx_hash VARCHAR(66)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active) WHERE is_active = TRUE');
    await client.query('CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_address)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS market_transactions (
        id SERIAL PRIMARY KEY,
        token_id INTEGER NOT NULL,
        event_type VARCHAR(20) NOT NULL,
        from_address VARCHAR(42),
        to_address VARCHAR(42),
        price_wei VARCHAR(78),
        tx_hash VARCHAR(66) NOT NULL,
        block_number BIGINT,
        block_timestamp TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_txns_token ON market_transactions(token_id)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_state (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 祝福语池表
    await client.query(`
      CREATE TABLE IF NOT EXISTS blessing_pool (
        id SERIAL PRIMARY KEY,
        rarity SMALLINT NOT NULL,
        blessing TEXT NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        used_at TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

// NFT 类型
export interface NFT {
  token_id: number;
  blessing: string;
  rarity: number;
  owner_address: string;
  minted_at: Date | null;
  updated_at: Date;
}

// Listing 类型
export interface Listing {
  token_id: number;
  seller_address: string;
  price_wei: string;
  is_active: boolean;
  listed_at: Date;
  tx_hash: string | null;
}

// MarketTransaction 类型
export interface MarketTransaction {
  id: number;
  token_id: number;
  event_type: 'listed' | 'bought' | 'cancelled';
  from_address: string | null;
  to_address: string | null;
  price_wei: string | null;
  tx_hash: string;
  block_number: bigint | null;
  block_timestamp: Date | null;
  created_at: Date;
}

// 查询参数
export interface GetListingsParams {
  page: number;
  limit: number;
  rarity?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

export interface GetListingsResult {
  listings: (Listing & {
    blessing: string;
    rarity: number;
    owner_address: string;
  })[];
  total: number;
  page: number;
  totalPages: number;
}

// 分页查询在售列表
export async function getActiveListings(params: GetListingsParams): Promise<GetListingsResult> {
  const { page, limit, rarity, sort = 'newest' } = params;
  const offset = (page - 1) * limit;

  const client = await getPool().connect();

  try {
    const conditions: string[] = ['l.is_active = TRUE'];
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (rarity !== undefined) {
      conditions.push(`n.rarity = $${paramIndex}`);
      queryParams.push(rarity);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    let orderBy = 'l.listed_at DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'l.price_wei ASC';
        break;
      case 'price_desc':
        orderBy = 'l.price_wei DESC';
        break;
      case 'oldest':
        orderBy = 'l.listed_at ASC';
        break;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      JOIN nfts n ON l.token_id = n.token_id
      WHERE ${whereClause}
    `;
    const countResult = await client.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const query = `
      SELECT
        l.token_id,
        l.seller_address,
        l.price_wei,
        l.is_active,
        l.listed_at,
        l.tx_hash,
        n.blessing,
        n.rarity,
        n.owner_address
      FROM listings l
      JOIN nfts n ON l.token_id = n.token_id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await client.query(query, queryParams);

    return {
      listings: result.rows,
      total,
      page,
      totalPages,
    };
  } finally {
    client.release();
  }
}

// 根据 tokenId 获取挂单详情
export async function getListingByTokenId(tokenId: number): Promise<(Listing & { blessing: string; rarity: number; owner_address: string }) | null> {
  const client = await getPool().connect();

  try {
    const query = `
      SELECT
        l.token_id,
        l.seller_address,
        l.price_wei,
        l.is_active,
        l.listed_at,
        l.tx_hash,
        n.blessing,
        n.rarity,
        n.owner_address
      FROM listings l
      JOIN nfts n ON l.token_id = n.token_id
      WHERE l.token_id = $1
    `;
    const result = await client.query(query, [tokenId]);
    return result.rows.length === 0 ? null : result.rows[0];
  } finally {
    client.release();
  }
}

// 获取单个 NFT 信息
export async function getNFTByTokenId(tokenId: number): Promise<NFT | null> {
  const client = await getPool().connect();

  try {
    const result = await client.query('SELECT * FROM nfts WHERE token_id = $1', [tokenId]);
    return result.rows.length === 0 ? null : result.rows[0];
  } finally {
    client.release();
  }
}

// 交易历史参数
export interface GetTransactionHistoryParams {
  page: number;
  limit: number;
  tokenId?: number;
}

export interface GetTransactionHistoryResult {
  transactions: MarketTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

// 分页查询交易历史
export async function getTransactionHistory(params: GetTransactionHistoryParams): Promise<GetTransactionHistoryResult> {
  const { page, limit, tokenId } = params;
  const offset = (page - 1) * limit;

  const client = await getPool().connect();

  try {
    const conditions: string[] = [];
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (tokenId !== undefined) {
      conditions.push(`token_id = $${paramIndex}`);
      queryParams.push(tokenId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM market_transactions ${whereClause}`;
    const countResult = await client.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const query = `
      SELECT * FROM market_transactions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await client.query(query, queryParams);

    return {
      transactions: result.rows,
      total,
      page,
      totalPages,
    };
  } finally {
    client.release();
  }
}

// 插入/更新 NFT
export async function upsertNFT(nft: Omit<NFT, 'updated_at'>): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      INSERT INTO nfts (token_id, blessing, rarity, owner_address, minted_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (token_id) DO UPDATE SET
        blessing = EXCLUDED.blessing,
        rarity = EXCLUDED.rarity,
        owner_address = EXCLUDED.owner_address,
        minted_at = EXCLUDED.minted_at,
        updated_at = NOW()
    `, [nft.token_id, nft.blessing, nft.rarity, nft.owner_address, nft.minted_at]);
  } finally {
    client.release();
  }
}

// 插入/更新挂单
export async function upsertListing(listing: Omit<Listing, 'listed_at'> & { listed_at?: Date }): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      INSERT INTO listings (token_id, seller_address, price_wei, is_active, tx_hash)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (token_id) DO UPDATE SET
        seller_address = EXCLUDED.seller_address,
        price_wei = EXCLUDED.price_wei,
        is_active = EXCLUDED.is_active,
        tx_hash = EXCLUDED.tx_hash,
        listed_at = COALESCE(listings.listed_at, NOW())
    `, [listing.token_id, listing.seller_address, listing.price_wei, listing.is_active, listing.tx_hash]);
  } finally {
    client.release();
  }
}

// 下架挂单
export async function deactivateListing(tokenId: number): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query('UPDATE listings SET is_active = FALSE WHERE token_id = $1', [tokenId]);
  } finally {
    client.release();
  }
}

// 插入交易记录
export async function insertTransaction(tx: Omit<MarketTransaction, 'id' | 'created_at'>): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      INSERT INTO market_transactions (token_id, event_type, from_address, to_address, price_wei, tx_hash, block_number, block_timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [tx.token_id, tx.event_type, tx.from_address, tx.to_address, tx.price_wei, tx.tx_hash, tx.block_number, tx.block_timestamp]);
  } finally {
    client.release();
  }
}

// 获取同步游标
export async function getSyncCursor(key: string): Promise<string | null> {
  const client = await getPool().connect();

  try {
    const result = await client.query('SELECT value FROM sync_state WHERE key = $1', [key]);
    return result.rows.length === 0 ? null : result.rows[0].value;
  } finally {
    client.release();
  }
}

// 设置同步游标
export async function setSyncCursor(key: string, value: string): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      INSERT INTO sync_state (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [key, value]);
  } finally {
    client.release();
  }
}
