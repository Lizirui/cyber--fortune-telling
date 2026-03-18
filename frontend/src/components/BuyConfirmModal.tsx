'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther } from 'viem';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import type { Listing } from '@/lib/types';

interface BuyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSuccess?: () => void;
}

export function BuyConfirmModal({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: BuyConfirmModalProps) {
  const { isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending: isWriting } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash });

  // 监听交易成功
  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      onClose();
    }
  }, [isSuccess, onSuccess, onClose]);

  // 监听交易失败
  useEffect(() => {
    if (isTxError) {
      setError('Transaction failed on chain');
    }
  }, [isTxError]);

  const handleBuy = async () => {
    if (!isConnected || !listing) return;

    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'buyItem',
        args: [BigInt(listing.tokenId)],
        value: parseEther(listing.priceEth),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy');
    }
  };

  if (!isOpen || !listing) return null;

  const isLoading = isWriting || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative glass-cyber rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">确认购买</h2>

        {/* NFT 信息 */}
        <div className="mb-4 p-4 bg-cyber-bg-light rounded-lg">
          <div className="text-gray-400 text-sm mb-1">NFT #{listing.tokenId}</div>
          <p className="text-white font-medium">{listing.blessing}</p>
        </div>

        {/* 价格详情 */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>价格</span>
            <span>{listing.priceEth} ETH</span>
          </div>
          <div className="flex justify-between text-gray-400 text-sm">
            <span>卖家</span>
            <span className="text-white">
              {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
            </span>
          </div>
        </div>

        {/* 警告信息 */}
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
          请确保你有足够的 ETH 来完成购买。
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 状态信息 */}
        {isWriting && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-400 text-sm">
            请在钱包中确认交易...
          </div>
        )}
        {isConfirming && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
            链上确认中...
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleBuy}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-cyber-primary hover:bg-cyber-primary/80 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? '处理中...' : '立即购买'}
          </button>
        </div>
      </div>
    </div>
  );
}
