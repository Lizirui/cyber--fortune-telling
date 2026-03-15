import { Router } from 'express';
import { generateBlessing } from '../services/ai.js';
import { generateSignature, getSignerAddress } from '../services/signer.js';
import { getNextTokenId } from '../utils/contract.js';

const router = Router();

// 内存存储：tokenId -> { blessing, rarity }
// 注意：这是进程内存存储，重启服务后会丢失
// 生产环境应该使用 Redis 或数据库
const blessingStore = new Map<number, { blessing: string; rarity: number }>();

// 生成祝福语和签名（不返回 blessing）
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

    // 存储祝福语（用于后续 reveal）
    blessingStore.set(tokenId, { blessing, rarity });

    // 生成签名（立即使用，不过期）
    const signature = await generateSignature(
      blessing,
      rarity,
      tokenId,
      userAddress
    );

    // 不返回 blessing 和 rarity！
    res.json({
      expiresAt: 0, // 保留字段但不使用
      tokenId,
      signature,
      signerAddress: getSignerAddress()
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to generate blessing' });
  }
});

// 根据 tokenId 查询祝福语（用于 Mint 成功后揭示）
router.get('/reveal/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const parsedTokenId = parseInt(tokenId, 10);

    if (isNaN(parsedTokenId)) {
      return res.status(400).json({ error: 'Invalid tokenId' });
    }

    const data = blessingStore.get(parsedTokenId);

    if (!data) {
      return res.status(404).json({ error: 'Blessing not found' });
    }

    res.json({
      tokenId: parsedTokenId,
      blessing: data.blessing,
      rarity: data.rarity
    });
  } catch (error) {
    console.error('Reveal error:', error);
    res.status(500).json({ error: 'Failed to reveal blessing' });
  }
});

export default router;
