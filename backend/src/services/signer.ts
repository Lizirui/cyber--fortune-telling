import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error('SIGNER_PRIVATE_KEY not configured');
}

const signer = new ethers.Wallet(PRIVATE_KEY);

export interface SignatureData {
  blessing: string;
  rarity: number;
  expiresAt: number;
  nonce: number;
  userAddress: string;
}

export async function generateSignature(
  blessing: string,
  rarity: number,
  expiresAt: number,
  nonce: number,
  userAddress: string
): Promise<string> {
  const hash = ethers.keccak256(
    ethers.solidityPacked(
      ['string', 'uint8', 'uint256', 'uint256', 'address'],
      [blessing, rarity, expiresAt, nonce, userAddress]
    )
  );

  const ethSignedHash = ethers.hashMessage(ethers.toBeHex(hash, 32));
  const signature = await signer.signMessage(ethers.arrayify(ethSignedHash));

  return signature;
}

export function getSignerAddress(): string {
  return signer.address;
}
