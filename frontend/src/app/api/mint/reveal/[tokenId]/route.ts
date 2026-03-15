import { NextRequest, NextResponse } from 'next/server';
import { getBlessing } from '@/lib/kv';

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

    const data = await getBlessing(parsedTokenId);

    if (!data) {
      return NextResponse.json({ error: 'Blessing not found' }, { status: 404 });
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
