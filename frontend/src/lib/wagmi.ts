import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, baseSepolia } from 'wagmi/chains';

// WalletConnect 演示项目 ID，生产环境请替换为真实的 projectId
// 获取方式: https://cloud.walletconnect.com/
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a4d4ab2e2e26c55f4ebc54e5d8a7e5c';

// 自定义 Base Sepolia RPC
const baseSepoliaWithRpc = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Cyber Fortune',
  projectId: PROJECT_ID,
  chains: [mainnet, base, baseSepoliaWithRpc],
  ssr: true,
});

export const CHAIN = baseSepoliaWithRpc;
