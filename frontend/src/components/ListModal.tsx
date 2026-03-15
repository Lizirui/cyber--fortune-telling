'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { RarityBadge } from './RarityBadge';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListed: () => void;
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  currentPrice?: string;
  isListed?: boolean;
}

export function ListModal({
  isOpen,
  onClose,
  onListed,
  tokenId,
  blessing,
  rarity,
  currentPrice,
  isListed
}: ListModalProps) {
  const [price, setPrice] = useState(currentPrice || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'listItem',
        args: [BigInt(tokenId), parseEther(price)],
      });
    } catch (error) {
      console.error('List error:', error);
      setIsSubmitting(false);
    }
  };

  // 监听交易确认
  if (hash && isConfirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />
        <div className="relative glass rounded-lg p-8 max-w-md w-full mx-4 neon-border text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg">交易确认中...</p>
          <p className="text-gray-400 text-sm mt-2">请稍候</p>
        </div>
      </div>
    );
  }

  // 交易发送成功
  if (hash && !isConfirming && isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />
        <div className="relative glass rounded-lg p-8 max-w-md w-full mx-4 neon-border text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-bold mb-2">上架成功！</p>
          <p className="text-gray-400 text-sm mb-4">您的 NFT 已成功上架</p>
          <button
            onClick={() => {
              setIsSubmitting(false);
              onListed();
            }}
            className="px-6 py-2 bg-cyber-primary text-black rounded-lg font-medium hover:bg-cyber-primary/90 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative glass rounded-lg p-6 max-w-md w-full mx-4 neon-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="aspect-square bg-black/50 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-8xl">🎁</div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gray-400">#{tokenId}</span>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-lg mb-2">{blessing}</p>
          {isListed && currentPrice && (
            <p className="text-sm text-gray-400">当前价格: {currentPrice} ETH</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">
              {isListed ? '修改价格' : '设置售价 (ETH)'}
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="请输入价格"
              className="w-full px-4 py-3 rounded-lg bg-cyber-card border border-cyber-border text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-cyber-border text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!price || parseFloat(price) <= 0 || isSubmitting}
              className="flex-1 px-4 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:bg-cyber-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isListed ? '修改价格' : '确认上架'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
