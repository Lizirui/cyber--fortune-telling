'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { CHAIN } from '@/lib/wagmi';

export function NetworkButton() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isBaseSepolia = chainId === baseSepolia.id;
  const isBase = chainId === base.id;
  const isOnBaseNetwork = isBaseSepolia || isBase;

  // 根据当前连接的网络显示名称
  const networkName = isBaseSepolia ? 'Base Sepolia' : 'Base';

  // 未连接钱包时 chainId 为 0
  if (chainId === 0) {
    return null;
  }

  // 当前在 Base 或 Base Sepolia 网络，显示网络状态徽章
  if (isOnBaseNetwork) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-cyber-success bg-cyber-success/10 border border-cyber-success/30 rounded-xl">
        <span className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
        <span>{networkName}</span>
      </div>
    );
  }

  // 其他网络，显示切换按钮
  return (
    <button
      onClick={() => switchChain?.({ chainId: CHAIN.id })}
      className="cyber-btn w-full md:w-auto"
    >
      切换网络
    </button>
  );
}
