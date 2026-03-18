import { NextRequest, NextResponse } from 'next/server';
import { getNFTInfo } from '@/lib/server-contract';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const parsedTokenId = parseInt(tokenId, 10);

    if (isNaN(parsedTokenId)) {
      return NextResponse.json({ error: 'Invalid tokenId' }, { status: 400 });
    }

    // 从链上获取祝福语数据
    const data = await getNFTInfo(parsedTokenId);

    // 检查 NFT 是否存在（owner 不为 0 地址）
    if (!data.owner || data.owner === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
    }

    return NextResponse.json({
      tokenId: parsedTokenId,
      blessing: data.blessing,
      rarity: data.rarity
    });
  } catch (error) {
    console.error('Reveal error:', error);
    return NextResponse.json({ error: 'Failed to reveal blessing' }, { status: 500 });
  }
}
