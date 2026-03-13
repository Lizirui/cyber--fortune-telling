import { ethers } from 'ethers';
const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error('SIGNER_PRIVATE_KEY not configured');
}
const signer = new ethers.Wallet(PRIVATE_KEY);
export async function generateSignature(blessing, rarity, expiresAt, nonce, userAddress) {
    const hash = ethers.keccak256(ethers.solidityPacked(['string', 'uint8', 'uint256', 'uint256', 'address'], [blessing, rarity, expiresAt, nonce, userAddress]));
    //以太坊签名格式：添加 "\x19Ethereum Signed Message:\n32" 前缀
    const ethMessage = '\x19Ethereum Signed Message:\n32' + hash.slice(2);
    const ethHash = ethers.keccak256(ethers.toUtf8Bytes(ethMessage));
    const signature = await signer.signMessage(ethers.getBytes(ethHash));
    return signature;
}
export function getSignerAddress() {
    return signer.address;
}
