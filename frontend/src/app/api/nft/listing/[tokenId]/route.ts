import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const NFT_ABI = [
  'function getListing(uint256 tokenId) view returns (address, uint256, bool)',
  'function ownerOf(uint256 tokenId) view returns (address)',
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const tokenIdNum = parseInt(tokenId, 10);

    if (isNaN(tokenIdNum)) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 });
    }

    const contract = getContract();
    const [seller, price, isListed] = await contract.getListing(tokenIdNum);

    // 获取当前 owner
    let owner = '';
    try {
      owner = await contract.ownerOf(tokenIdNum);
    } catch {
      // token 可能不存在
    }

    if (!isListed || !seller || seller === ethers.ZeroAddress) {
      return NextResponse.json({
        isListed: false,
        seller: null,
        priceEth: null,
        owner,
      });
    }

    return NextResponse.json({
      isListed,
      seller,
      priceEth: ethers.formatEther(price),
      owner,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
