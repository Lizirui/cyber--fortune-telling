import { NextRequest, NextResponse } from 'next/server';
import { getTransactionHistory } from '@/lib/db/marketplace';
import type { MarketTransaction } from '@/lib/types';

const WEI_PER_ETH = BigInt(1e18);

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
    const tokenId = searchParams.get('tokenId');

    const result = await getTransactionHistory({
      page,
      limit,
      tokenId: tokenId !== null ? parseInt(tokenId) : undefined,
    });

    // 转换数据格式
    const transactions: MarketTransaction[] = result.transactions.map((tx) => ({
      id: tx.id,
      tokenId: tx.token_id,
      eventType: tx.event_type,
      fromAddress: tx.from_address,
      toAddress: tx.to_address,
      priceWei: tx.price_wei,
      priceEth: tx.price_wei ? weiToEth(tx.price_wei) : null,
      txHash: tx.tx_hash,
      blockNumber: tx.block_number,
      blockTimestamp: tx.block_timestamp ? tx.block_timestamp.toISOString() : null,
      createdAt: tx.created_at.toISOString(),
    }));

    return NextResponse.json({
      transactions,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
