'use client';

import { useAccount, useDisconnect as useWagmiDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useWagmiDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-cyber-primary font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 border border-cyber-secondary text-cyber-secondary rounded hover:bg-cyber-secondary hover:text-black transition-all"
        >
          断开
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openConnectModal}
      className="px-6 py-2 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all"
    >
      连接钱包
    </button>
  );
}
