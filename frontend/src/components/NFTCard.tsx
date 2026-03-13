'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFTCardProps {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price?: string;
  seller?: string;
  isListed?: boolean;
  onBuy?: () => void;
  onList?: () => void;
}

export function NFTCard({
  tokenId,
  blessing,
  rarity,
  price,
  seller,
  isListed,
  onBuy,
  onList,
}: NFTCardProps) {
  return (
    <div className="glass rounded-lg overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
      {/* SVG 占位图 */}
      <div className="aspect-square bg-black/50 flex items-center justify-center">
        <div className="text-6xl">🎁</div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">#{tokenId}</span>
          <RarityBadge rarity={rarity} />
        </div>
        <p className="text-sm text-gray-300 truncate mb-2">{blessing}</p>
        {price && (
          <div className="flex items-center justify-between">
            <span className="text-cyber-primary font-bold">{price} ETH</span>
            {isListed ? (
              <button
                onClick={onBuy}
                className="px-3 py-1 bg-cyber-primary text-black text-sm rounded font-bold hover:bg-white transition-colors"
              >
                购买
              </button>
            ) : (
              <button
                onClick={onList}
                className="px-3 py-1 border border-cyber-secondary text-cyber-secondary text-sm rounded hover:bg-cyber-secondary hover:text-black transition-colors"
              >
                上架
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
