import { ethers } from 'ethers';

// 简化的 ABI，只包含我们需要的方法
const NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function blessings(uint256 tokenId) view returns (string)',
  'function rarities(uint256 tokenId) view returns (uint8)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function nextTokenId() view returns (uint256)',
  'function getListing(uint256 tokenId) view returns (address, uint256, bool)',
  'function tokensOfOwner(address owner) view returns (uint256[])'
];

function getContract() {
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const RPC_URL = process.env.BASE_RPC_URL;

  if (!CONTRACT_ADDRESS || !RPC_URL) {
    throw new Error('CONTRACT_ADDRESS or BASE_RPC_URL not configured');
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, NFT_ABI, provider);
}

export async function getNFTInfo(tokenId: number) {
  const nftContract = getContract();
  const [owner, blessing, rarity] = await Promise.all([
    nftContract.ownerOf(tokenId),
    nftContract.blessings(tokenId),
    nftContract.rarities(tokenId)
  ]);

  return {
    owner,
    blessing,
    rarity: Number(rarity)
  };
}

export async function getNextTokenId(): Promise<number> {
  const nftContract = getContract();
  const nextTokenId = await nftContract.nextTokenId();
  return Number(nextTokenId);
}

export interface ListingInfo {
  tokenId: number;
  seller: string;
  price: string;
  isListed: boolean;
}

export async function getListing(tokenId: number): Promise<{ seller: string; price: string; isListed: boolean }> {
  const nftContract = getContract();
  const [seller, price, isListed] = await nftContract.getListing(tokenId);
  return {
    seller,
    price: ethers.formatEther(price),
    isListed
  };
}

export async function getListedNFTs(): Promise<ListingInfo[]> {
  const nftContract = getContract();
  const nextTokenId = await nftContract.nextTokenId();
  const listings: ListingInfo[] = [];

  // 遍历所有 tokenId，查找已上架的 NFT
  for (let i = 0; i < nextTokenId; i++) {
    try {
      const [seller, price, isListed] = await nftContract.getListing(i);
      if (isListed) {
        listings.push({
          tokenId: i,
          seller,
          price: ethers.formatEther(price),
          isListed
        });
      }
    } catch {
      // 忽略错误，继续下一个
    }
  }

  return listings;
}

export interface UserNFT {
  tokenId: number;
  blessing: string;
  rarity: number;
  listing?: {
    price: string;
    isListed: boolean;
  };
}

export async function getUserNFTs(ownerAddress: string): Promise<UserNFT[]> {
  const nftContract = getContract();

  // 获取用户持有的所有 tokenId
  const tokenIds = await nftContract.tokensOfOwner(ownerAddress);

  // 获取每个 NFT 的信息
  const nfts = await Promise.all(
    tokenIds.map(async (tokenId: bigint) => {
      const info = await getNFTInfo(Number(tokenId));
      const listing = await getListing(Number(tokenId));

      return {
        tokenId: Number(tokenId),
        blessing: info.blessing,
        rarity: info.rarity,
        listing: listing.isListed ? {
          price: listing.price,
          isListed: listing.isListed
        } : undefined
      };
    })
  );

  return nfts;
}
