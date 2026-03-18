import { Pool } from 'pg';
import { generateBlessingsByRarity } from '../ai';
import type { Rarity } from '../types';

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

// 从池中获取祝福语（按稀有度）
export async function popBlessingFromPool(rarity: number): Promise<{ id: number; blessing: string } | null> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    const selectResult = await client.query(
      'SELECT id, blessing FROM blessing_pool WHERE rarity = $1 AND is_used = FALSE ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED',
      [rarity]
    );

    if (selectResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const record = selectResult.rows[0];

    await client.query(
      'UPDATE blessing_pool SET is_used = TRUE, used_at = NOW() WHERE id = $1',
      [record.id]
    );

    await client.query('COMMIT');
    return { id: record.id, blessing: record.blessing };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 补充祝福语到池中
export async function refillBlessingToPool(rarity: number): Promise<void> {
  const client = await getPool().connect();

  try {
    const newBlessings = await generateBlessingsByRarity(rarity as Rarity, 5);

    for (const blessing of newBlessings) {
      await client.query(
        'INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES ($1, $2, $3)',
        [rarity, blessing, false]
      );
    }
  } finally {
    client.release();
  }
}
