import { Router } from 'express';
import { getNFTInfo } from '../utils/contract.js';
import { generateSVG, getRarityName } from '../services/svg.js';

const router = Router();

// 获取 NFT 详情
router.get('/:tokenId', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);

    if (isNaN(tokenId)) {
      return res.status(400).json({ error: 'Invalid tokenId' });
    }

    const info = await getNFTInfo(tokenId);

    // 生成 SVG
    const svg = generateSVG(info.blessing, tokenId, info.rarity as 0 | 1 | 2 | 3 | 4 | 5);
    const svgBase64 = Buffer.from(svg).toString('base64');

    res.json({
      tokenId,
      blessing: info.blessing,
      rarity: info.rarity,
      rarityName: getRarityName(info.rarity as 0 | 1 | 2 | 3 | 4 | 5),
      owner: info.owner,
      svg: `data:image/svg+xml;base64,${svgBase64}`
    });
  } catch (error) {
    console.error('NFT info error:', error);
    res.status(500).json({ error: 'Failed to get NFT info' });
  }
});

export default router;
