export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;
// Vercel 部署时使用相对路径，本地开发使用 localhost:3001
const isProduction = process.env.NEXT_PUBLIC_VERCEL_URL !== undefined;
export const BACKEND_URL = isProduction ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
export const MINT_FEE = '0.001'; // ETH
