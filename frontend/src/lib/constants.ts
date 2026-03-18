export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;
// Vercel 部署时使用相对路径，本地开发使用 localhost:3000
const isProduction = process.env.NEXT_PUBLIC_VERCEL_URL !== undefined;
export const API_BASE_URL = isProduction ? '' : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
export const MINT_FEE = '0.001'; // ETH
