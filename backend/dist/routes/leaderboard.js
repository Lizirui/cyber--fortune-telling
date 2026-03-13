import { Router } from 'express';
const router = Router();
const THEGRAPH_URL = process.env.THEGRAPH_URL;
// 排行榜数据（简化版，实际应从 The Graph 获取）
router.get('/', async (req, res) => {
    try {
        const { sort = 'rarity', limit = '20' } = req.query;
        if (!THEGRAPH_URL) {
            // 如果没有配置 The Graph，返回模拟数据
            return res.json({
                items: [
                    {
                        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                        totalMinted: 10,
                        rarityBreakdown: { N: 5, R: 3, SR: 2 }
                    }
                ]
            });
        }
        // 查询 The Graph
        const query = `
      query {
        tokens(first: ${limit}, orderBy: tokenId, orderDirection: desc) {
          owner {
            id
          }
          rarity
        }
      }
    `;
        const response = await fetch(THEGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        // 处理数据...
        res.json({ items: [] });
    }
    catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});
export default router;
