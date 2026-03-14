import { Router } from 'express';
import { generateBlessing } from '../services/ai.js';
import { generateSignature, getSignerAddress } from '../services/signer.js';
import { getNextTokenId } from '../utils/contract.js';

const router = Router();

// 生成祝福语和签名
router.post('/generate', async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress is required' });
    }

    // 生成祝福语和稀有度
    const { blessing, rarity } = await generateBlessing();

    // 从合约获取下一个 tokenId
    const tokenId = await getNextTokenId();

    // 设置过期时间（10分钟）
    const expiresAt = Math.floor(Date.now() / 1000) + 600;

    // 生成签名
    const signature = await generateSignature(
      blessing,
      rarity,
      expiresAt,
      tokenId,
      userAddress
    );

    res.json({
      blessing,
      rarity,
      expiresAt,
      tokenId,
      signature,
      signerAddress: getSignerAddress()
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to generate blessing' });
  }
});

export default router;
