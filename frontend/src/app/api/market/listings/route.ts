import { NextRequest, NextResponse } from 'next/server';
import { getActiveListings } from '@/lib/db/marketplace';
import type { Listing } from '@/lib/types';

export const dynamic = 'force-dynamic';

function weiToEth(wei: string): string {
  const weiBigInt = BigInt(wei);
  const eth = Number(weiBigInt) / 1e18;
  return eth.toFixed(4);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const rarity = searchParams.get('rarity');
    const sort = searchParams.get('sort') as 'price_asc' | 'price_desc' | 'newest' | 'oldest' | null;

    const result = await getActiveListings({
      page,
      limit,
      rarity: rarity !== null ? parseInt(rarity) : undefined,
      sort: sort || 'newest',
    });

    // 转换数据格式
    const listings: Listing[] = result.listings.map((item) => ({
      tokenId: item.token_id,
      blessing: item.blessing,
      rarity: item.rarity as Listing['rarity'],
      seller: item.seller_address,
      priceWei: item.price_wei,
      priceEth: weiToEth(item.price_wei),
      listedAt: item.listed_at.toISOString(),
    }));

    return NextResponse.json({
      listings,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
