import { ethers } from 'ethers';

// 测试签名生成和验证
async function testSignature() {
  // 使用测试私钥
  const privateKey = process.env.SIGNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const signer = new ethers.Wallet(privateKey);

  console.log('Signer address:', signer.address);

  // 测试数据
  const blessing = 'Test blessing';
  const rarity = 3;
  const expiresAt = Math.floor(Date.now() / 1000) + 600;
  const tokenId = 0;
  const userAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  // 计算哈希（与合约相同）
  const hash = ethers.keccak256(
    ethers.solidityPacked(
      ['string', 'uint8', 'uint256', 'uint256', 'address'],
      [blessing, rarity, expiresAt, tokenId, userAddress]
    )
  );

  console.log('Hash:', hash);

  // 签名（signMessage 会自动添加 Ethereum Signed Message 前缀）
  const signature = await signer.signMessage(ethers.getBytes(hash));

  console.log('Signature:', signature);

  // 验证签名（模拟合约验证）
  const ethSignedHash = ethers.hashMessage(ethers.getBytes(hash));
  const recoveredAddress = ethers.recoverAddress(ethSignedHash, signature);

  console.log('Recovered address:', recoveredAddress);
  console.log('Match:', recoveredAddress.toLowerCase() === signer.address.toLowerCase());
}

testSignature().catch(console.error);
