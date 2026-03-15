import { Router } from 'express';
import { getListedNFTs, getNFTInfo, getUserNFTs } from '../utils/contract.js';

const router = Router();

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

// 获取上架 NFT 列表
router.get('/listings', async (req, res) => {
  try {
    const { rarity, sort, seller, search, page = '1', limit = '20' } = req.query;

    // 获取所有上架 NFT
    const listedNFTs = await getListedNFTs();

    // 获取每个 NFT 的详细信息
    const nftsWithInfo = await Promise.all(
      listedNFTs.map(async (listing) => {
        const info = await getNFTInfo(listing.tokenId);
        return {
          tokenId: listing.tokenId,
          blessing: info.blessing,
          rarity: info.rarity,
          price: listing.price,
          seller: listing.seller
        };
      })
    );

    let filteredNFTs = [...nftsWithInfo];

    // 按稀有度筛选
    if (rarity !== undefined) {
      const rarityNum = parseInt(rarity as string);
      if (!isNaN(rarityNum) && rarityNum >= 0 && rarityNum <= 5) {
        filteredNFTs = filteredNFTs.filter(n => n.rarity === rarityNum);
      }
    }

    // 按卖家地址筛选
    if (seller) {
      const sellerAddress = (seller as string).toLowerCase();
      filteredNFTs = filteredNFTs.filter(n => n.seller.toLowerCase() === sellerAddress);
    }

    // 按祝福语搜索
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredNFTs = filteredNFTs.filter(n =>
        n.blessing.toLowerCase().includes(searchLower)
      );
    }

    // 排序
    if (sort) {
      switch (sort) {
        case 'price_asc':
          filteredNFTs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price_desc':
          filteredNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'tokenId_desc':
          filteredNFTs.sort((a, b) => b.tokenId - a.tokenId);
          break;
        case 'tokenId_asc':
        default:
          filteredNFTs.sort((a, b) => a.tokenId - b.tokenId);
          break;
      }
    } else {
      // 默认按 tokenId 升序
      filteredNFTs.sort((a, b) => a.tokenId - b.tokenId);
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedNFTs = filteredNFTs.slice(startIndex, endIndex);

    res.json({
      nfts: paginatedNFTs,
      total: filteredNFTs.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredNFTs.length / limitNum)
    });
  } catch (error) {
    console.error('Market listings error:', error);
    res.status(500).json({ error: 'Failed to get market listings' });
  }
});

// 获取用户持有的 NFT 列表
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const nfts = await getUserNFTs(address);

    res.json({ nfts });
  } catch (error) {
    console.error('User NFTs error:', error);
    res.status(500).json({ error: 'Failed to get user NFTs' });
  }
});

export default router;
