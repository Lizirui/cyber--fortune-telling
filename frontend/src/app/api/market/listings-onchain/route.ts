import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const NFT_ABI = [
  'function nextTokenId() view returns (uint256)',
  'function getListing(uint256 tokenId) view returns (address, uint256, bool)',
  'function blessings(uint256 tokenId) view returns (string)',
  'function rarities(uint256 tokenId) view returns (uint8)',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://sepolia.base.org';

export const dynamic = 'force-dynamic';

function getContract() {
  if (!CONTRACT_ADDRESS || !BASE_RPC_URL) {
    throw new Error('CONTRACT_ADDRESS or BASE_RPC_URL not configured');
  }
  const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, NFT_ABI, provider);
}

interface Listing {
  tokenId: number;
  blessing: string;
  rarity: number;
  seller: string;
  priceWei: string;
  priceEth: string;
  listedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const rarity = searchParams.get('rarity');
    const sort = searchParams.get('sort') || 'newest';

    const contract = getContract();
    const totalSupply = Number(await contract.nextTokenId());

    // 并发批量查询所有 token 的上架状态（每批 20 个）
    const BATCH_SIZE = 20;
    const listings: Listing[] = [];

    for (let start = 0; start < totalSupply; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, totalSupply);
      const tokenIds = Array.from({ length: end - start }, (_, i) => start + i);

      const listingResults = await Promise.all(
        tokenIds.map(id => contract.getListing(id).catch(() => null))
      );

      // 筛选出已上架的 token
      const listedTokenIds: number[] = [];
      const listedData: Map<number, { seller: string; price: bigint }> = new Map();

      for (let i = 0; i < listingResults.length; i++) {
        const result = listingResults[i];
        if (!result) continue;
        const [seller, price, isListed] = result;
        if (isListed && seller !== ethers.ZeroAddress) {
          const tokenId = tokenIds[i];
          listedTokenIds.push(tokenId);
          listedData.set(tokenId, { seller, price });
        }
      }

      if (listedTokenIds.length === 0) continue;

      // 并发获取已上架 token 的 blessing 和 rarity
      const [blessingsResults, raritiesResults] = await Promise.all([
        Promise.all(listedTokenIds.map(id => contract.blessings(id).catch(() => ''))),
        Promise.all(listedTokenIds.map(id => contract.rarities(id).catch(() => 0))),
      ]);

      for (let i = 0; i < listedTokenIds.length; i++) {
        const tokenId = listedTokenIds[i];
        const data = listedData.get(tokenId)!;
        const rarityValue = Number(raritiesResults[i]);

        if (rarity !== null && rarityValue !== parseInt(rarity)) {
          continue;
        }

        listings.push({
          tokenId,
          blessing: blessingsResults[i],
          rarity: rarityValue,
          seller: data.seller,
          priceWei: data.price.toString(),
          priceEth: ethers.formatEther(data.price),
          listedAt: new Date().toISOString(),
        });
      }
    }

    // 排序
    listings.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return BigInt(a.priceWei) < BigInt(b.priceWei) ? -1 : 1;
        case 'price_desc':
          return BigInt(a.priceWei) > BigInt(b.priceWei) ? -1 : 1;
        case 'oldest':
          return new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime();
        case 'newest':
        default:
          return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      }
    });

    // 分页
    const total = listings.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedListings = listings.slice(offset, offset + limit);

    return NextResponse.json({
      listings: paginatedListings,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching on-chain listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
