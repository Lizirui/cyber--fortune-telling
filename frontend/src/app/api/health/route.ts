import { NextResponse } from 'next/server';
import { initializeMarketplaceTables } from '@/lib/db/marketplace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // 初始化数据库表（幂等操作）
  try {
    await initializeMarketplaceTables();
  } catch (error) {
    console.error('Failed to initialize tables:', error);
  }

  return NextResponse.json({ status: 'ok' });
}
