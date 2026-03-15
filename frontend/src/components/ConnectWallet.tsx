"use client";

import { useAccount, useDisconnect as useWagmiDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useWagmiDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-cyber-primary/10 border border-cyber-primary/30 rounded-xl">
          <span className="text-cyber-primary font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-3 border border-cyber-danger/50 text-cyber-danger rounded-xl hover:bg-cyber-danger hover:text-black transition-all text-sm font-bold cursor-pointer w-full sm:w-auto"
        >
          断开
        </button>
      </div>
    );
  }

  return (
    <button onClick={openConnectModal} className="cyber-btn text-sm w-full md:w-auto">
      连接钱包
    </button>
  );
}
