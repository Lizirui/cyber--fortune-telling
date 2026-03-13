'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price?: string;
}

export function NFTModal({ isOpen, onClose, tokenId, blessing, rarity, price }: NFTModalProps) {
  if (!isOpen) return null;

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
        <div className="text-center">
          <div className="aspect-square bg-black/50 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-8xl">🎁</div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-400">#{tokenId}</span>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-lg mb-4">{blessing}</p>
          {price && (
            <p className="text-2xl text-cyber-primary font-bold mb-4">{price} ETH</p>
          )}
        </div>
      </div>
    </div>
  );
}
