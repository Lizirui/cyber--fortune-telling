import { NextRequest, NextResponse } from 'next/server';
import { getUserNFTs } from '@/lib/server-contract';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const nfts = await getUserNFTs(address);

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('User NFTs error:', error);
    return NextResponse.json({ error: 'Failed to get user NFTs' }, { status: 500 });
  }
}
