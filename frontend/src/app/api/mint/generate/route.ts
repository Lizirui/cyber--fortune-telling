import { NextRequest, NextResponse } from 'next/server';
import { generateBlessing } from '@/lib/ai';
import { generateSignature, getSignerAddress } from '@/lib/signer';
import { saveBlessing } from '@/lib/kv';
import { getNextTokenId } from '@/lib/server-contract';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userAddress } = await req.json();

    if (!userAddress) {
      return NextResponse.json({ error: 'userAddress is required' }, { status: 400 });
    }

    // 生成祝福语和稀有度
    const { blessing, rarity } = await generateBlessing();

    // 从合约获取下一个 tokenId
    const tokenId = await getNextTokenId();

    // 使用 Vercel KV 存储祝福语
    await saveBlessing(tokenId, { blessing, rarity });

    // 生成签名
    const signature = await generateSignature(
      blessing,
      rarity,
      tokenId,
      userAddress
    );

    return NextResponse.json({
      expiresAt: 0,
      tokenId,
      blessing,
      rarity,
      signature,
      signerAddress: getSignerAddress()
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate blessing' }, { status: 500 });
  }
}
