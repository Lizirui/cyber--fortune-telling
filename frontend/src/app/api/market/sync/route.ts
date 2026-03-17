import { NextRequest, NextResponse } from 'next/server';
import {
  initializeMarketplaceTables,
  upsertNFT,
  upsertListing,
  deactivateListing,
  insertTransaction,
  getSyncCursor,
  setSyncCursor,
} from '@/lib/db/marketplace';
import {
  querySubgraph,
  ALL_NFTS_QUERY,
  ALL_LISTINGS_QUERY,
  ALL_TRANSACTIONS_QUERY,
  SubgraphNFT,
  SubgraphListing,
  SubgraphTransaction,
} from '@/lib/subgraph';

const CRON_SECRET = process.env.CRON_SECRET;

interface NFTItem {
  nfts: SubgraphNFT[];
}

interface ListingItem {
  listings: (SubgraphListing & { nft: { tokenId: string } })[];
}

interface TransactionItem {
  transactions: SubgraphTransaction[];
}

// 验证 Cron 请求
function validateCronRequest(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.warn('CRON_SECRET is not set. Allowing all requests.');
    return true;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  // 验证请求
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 初始化数据库表
    console.log('Initializing marketplace tables...');
    await initializeMarketplaceTables();

    // 同步 NFTs
    console.log('Syncing NFTs from subgraph...');
    let nftSkip = 0;
    const batchSize = 1000;
    let nftsSynced = 0;

    while (true) {
      const data = await querySubgraph<NFTItem>(ALL_NFTS_QUERY, {
        first: batchSize,
        skip: nftSkip,
      });

      const nfts = data.nfts;
      if (nfts.length === 0) break;

      for (const nft of nfts) {
        await upsertNFT({
          token_id: parseInt(nft.tokenId),
          blessing: nft.blessing,
          rarity: nft.rarity,
          owner_address: nft.owner,
          minted_at: new Date(parseInt(nft.mintedAt) * 1000),
        });
        nftsSynced++;
      }

      if (nfts.length < batchSize) break;
      nftSkip += batchSize;
    }
    console.log(`Synced ${nftsSynced} NFTs`);

    // 同步 Listings
    console.log('Syncing Listings from subgraph...');
    let listingSkip = 0;
    let listingsSynced = 0;

    while (true) {
      const data = await querySubgraph<ListingItem>(ALL_LISTINGS_QUERY, {
        first: batchSize,
        skip: listingSkip,
      });

      const listings = data.listings;
      if (listings.length === 0) break;

      for (const listing of listings) {
        const tokenId = parseInt(listing.nft.tokenId);

        if (listing.isActive) {
          await upsertListing({
            token_id: tokenId,
            seller_address: listing.seller,
            price_wei: listing.price,
            is_active: true,
            tx_hash: listing.id,
          });
        } else {
          // 如果不活跃，检查是否存在，如果存在则标记为不活跃
          await upsertListing({
            token_id: tokenId,
            seller_address: listing.seller,
            price_wei: listing.price,
            is_active: false,
            tx_hash: listing.id,
          });
        }
        listingsSynced++;
      }

      if (listings.length < batchSize) break;
      listingSkip += batchSize;
    }
    console.log(`Synced ${listingsSynced} Listings`);

    // 同步 Transactions
    console.log('Syncing Transactions from subgraph...');
    let txSkip = 0;
    let txsSynced = 0;

    while (true) {
      const data = await querySubgraph<TransactionItem>(ALL_TRANSACTIONS_QUERY, {
        first: batchSize,
        skip: txSkip,
      });

      const transactions = data.transactions;
      if (transactions.length === 0) break;

      for (const tx of transactions) {
        // 从 tx id 中提取 tokenId (格式: txHash-logIndex)
        const parts = tx.id.split('-');
        const tokenId = parseInt(parts[0]);

        await insertTransaction({
          token_id: tokenId,
          event_type: tx.eventType as 'listed' | 'bought' | 'cancelled',
          from_address: tx.from,
          to_address: tx.to,
          price_wei: tx.price,
          tx_hash: tx.id.split('-')[0], // 取 tx hash 部分
          block_number: tx.blockNumber ? BigInt(tx.blockNumber) : null,
          block_timestamp: tx.timestamp ? new Date(parseInt(tx.timestamp) * 1000) : null,
        });
        txsSynced++;
      }

      if (transactions.length < batchSize) break;
      txSkip += batchSize;
    }
    console.log(`Synced ${txsSynced} Transactions`);

    // 更新同步游标
    await setSyncCursor('last_sync', new Date().toISOString());

    return NextResponse.json({
      success: true,
      stats: {
        nfts: nftsSynced,
        listings: listingsSynced,
        transactions: txsSynced,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET 请求用于手动触发同步（仅在开发环境）
export async function GET() {
  // 在生产环境禁用手动触发
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST to trigger sync' }, { status: 405 });
  }

  return NextResponse.json({ message: 'Use POST to trigger sync' });
}
