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

  // 当前在 Base 或 Base Sepolia 网络，显示绿色圆点
  if (isOnBaseNetwork) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-sm text-green-400">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {networkName}
      </div>
    );
  }

  // 其他网络，显示切换按钮
  return (
    <button
      onClick={() => switchChain?.({ chainId: CHAIN.id })}
      className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500 hover:bg-yellow-500/30 transition-colors"
    >
      Switch Base Sepolia
    </button>
  );
}
