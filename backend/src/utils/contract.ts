import { ethers } from 'ethers';

// 简化的 ABI，只包含我们需要的方法
const NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function blessings(uint256 tokenId) view returns (string)',
  'function rarities(uint256 tokenId) view returns (uint8)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function nextTokenId() view returns (uint256)'
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
