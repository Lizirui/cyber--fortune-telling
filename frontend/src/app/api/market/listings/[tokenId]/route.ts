import { NextRequest, NextResponse } from 'next/server';
import { getListingByTokenId, getTransactionHistory } from '@/lib/db/marketplace';
import type { ListingDetail, MarketTransaction } from '@/lib/types';

const WEI_PER_ETH = BigInt(1e18);

function weiToEth(wei: string): string {
  const weiBigInt = BigInt(wei);
  const eth = Number(weiBigInt) / 1e18;
  return eth.toFixed(4);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const tokenIdNum = parseInt(tokenId);

    if (isNaN(tokenIdNum)) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 });
    }

    // 获取挂单详情
    const listing = await getListingByTokenId(tokenIdNum);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 获取交易历史
    const txResult = await getTransactionHistory({
      page: 1,
      limit: 20,
      tokenId: tokenIdNum,
    });

    // 转换交易数据
    const transactions: MarketTransaction[] = txResult.transactions.map((tx) => ({
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

    const detail: ListingDetail = {
      tokenId: listing.token_id,
      blessing: listing.blessing,
      rarity: listing.rarity as ListingDetail['rarity'],
      seller: listing.seller_address,
      priceWei: listing.price_wei,
      priceEth: weiToEth(listing.price_wei),
      listedAt: listing.listed_at.toISOString(),
      owner: listing.owner_address,
      transactions,
    };

    return NextResponse.json(detail);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
