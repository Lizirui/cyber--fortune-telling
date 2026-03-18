import { NextRequest, NextResponse } from 'next/server';
import { generateBlessing, generateBlessingsByRarity } from '@/lib/ai';
import { generateSignature, getSignerAddress } from '@/lib/signer';
import { popBlessingFromPool, refillBlessingToPool } from '@/lib/db';
import { getNextTokenId } from '@/lib/server-contract';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userAddress } = await req.json();

    if (!userAddress) {
      return NextResponse.json({ error: 'userAddress is required' }, { status: 400 });
    }

    // 根据概率确定稀有度
    const { rarity } = await generateBlessing();

    // 从池中获取祝福语
    let blessingData = await popBlessingFromPool(rarity);

    // 如果池为空，动态生成并补充
    if (!blessingData) {
      console.log(`Pool empty for rarity ${rarity}, generating new blessing...`);
      const newBlessings = await generateBlessingsByRarity(rarity, 1);

      if (newBlessings.length > 0) {
        blessingData = { id: 0, blessing: newBlessings[0] };
      } else {
        // 最后的 fallback
        blessingData = { id: 0, blessing: '愿你心想事成' };
      }
    }

    const blessing = blessingData.blessing;

    // 从合约获取下一个 tokenId
    const tokenId = await getNextTokenId();

    // 生成签名
    const { signature, blessingHash } = await generateSignature(
      blessing,
      rarity,
      tokenId,
      userAddress
    );

    // 异步补充祝福语到池中（不阻塞响应）
    refillBlessingToPool(rarity).catch(console.error);

    return NextResponse.json({
      expiresAt: 0,
      tokenId,
      blessing,
      rarity,
      blessingHash,
      signature,
      signerAddress: getSignerAddress()
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate blessing' }, { status: 500 });
  }
}
