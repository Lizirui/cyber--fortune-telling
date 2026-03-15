import { ethers } from 'ethers';

// 简化的 ABI，只包含我们需要的方法
const NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function blessings(uint256 tokenId) view returns (string)',
  'function rarities(uint256 tokenId) view returns (uint8)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function nextTokenId() view returns (uint256)',
  'function tokensOfOwner(address owner) view returns (uint256[])'
];

function getContract() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
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

export interface UserNFT {
  tokenId: number;
  blessing: string;
  rarity: number;
}

export async function getUserNFTs(ownerAddress: string): Promise<UserNFT[]> {
  const nftContract = getContract();

  // 获取用户持有的所有 tokenId
  const tokenIds = await nftContract.tokensOfOwner(ownerAddress);

  // 获取每个 NFT 的信息
  const nfts = await Promise.all(
    tokenIds.map(async (tokenId: bigint) => {
      const info = await getNFTInfo(Number(tokenId));
      return {
        tokenId: Number(tokenId),
        blessing: info.blessing,
        rarity: info.rarity
      };
    })
  );

  return nfts;
}
