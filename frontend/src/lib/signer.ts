import { ethers } from 'ethers';

function getSigner() {
  const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error('SIGNER_PRIVATE_KEY not configured');
  }
  return new ethers.Wallet(PRIVATE_KEY);
}

export async function generateSignature(
  blessing: string,
  rarity: number,
  tokenId: number,
  userAddress: string
): Promise<string> {
  const signer = getSigner();

  // 构建签名哈希（只包含 tokenId 和 userAddress，与合约匹配）
  const hash = ethers.keccak256(
    ethers.solidityPacked(
      ['uint256', 'address'],
      [tokenId, userAddress]
    )
  );

  // 使用 ethers.js 的 signMessage 会自动添加 Ethereum Signed Message 前缀
  // 这与合约中的 toEthSignedMessageHash() 和 ECDSA.recover() 匹配
  const signature = await signer.signMessage(ethers.getBytes(hash));

  return signature;
}

export function getSignerAddress(): string {
  return getSigner().address;
}
