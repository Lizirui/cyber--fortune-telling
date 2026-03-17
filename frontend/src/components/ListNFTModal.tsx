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

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  onSuccess?: () => void;
}

export function ListNFTModal({
  isOpen,
  onClose,
  tokenId,
  onSuccess,
}: ListNFTModalProps) {
  const { isConnected } = useAccount();
  const [price, setPrice] = useState('');
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

  const handleList = async () => {
    if (!isConnected) return;

    const priceInEth = parseFloat(price);
    if (isNaN(priceInEth) || priceInEth <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'listItem',
        args: [BigInt(tokenId), parseEther(price)],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list');
    }
  };

  if (!isOpen) return null;

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
        <h2 className="text-xl font-bold text-white mb-4">List NFT #{tokenId}</h2>

        {/* 价格输入 */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.01"
            className="w-full px-4 py-3 bg-cyber-bg-light border border-gray-700 rounded-lg text-white focus:border-cyber-primary focus:outline-none"
            disabled={isLoading}
          />
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
            Please confirm in your wallet...
          </div>
        )}
        {isConfirming && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
            Confirming transaction on chain...
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleList}
            disabled={isLoading || !price}
            className="flex-1 px-4 py-3 bg-cyber-primary hover:bg-cyber-primary/80 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'List'}
          </button>
        </div>
      </div>
    </div>
  );
}
