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
    <div className="glass-cyber rounded-xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group">
      {/* 卡片封面 */}
      <div className="aspect-square bg-gradient-to-br from-black/80 to-cyber-bg-light relative overflow-hidden flex items-center justify-center">
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="text-5xl md:text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">🎁</div>

        {/* 角落装饰 */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-primary/30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-primary/30" />
      </div>

      <div className="p-3 md:p-5">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-gray-500 font-mono text-xs md:text-sm">#{tokenId}</span>
          <RarityBadge rarity={rarity} />
        </div>
        <p className="text-xs md:text-sm text-gray-300 truncate mb-3 md:mb-4">{blessing}</p>

        {price ? (
          <div className="flex items-center justify-between">
            <span className="text-cyber-primary font-bold text-sm">{price} ETH</span>
            {isListed ? (
              <button
                onClick={onBuy}
                className="px-3 md:px-4 py-1.5 bg-cyber-primary text-black text-xs md:text-sm rounded-lg font-bold hover:bg-white transition-all"
              >
                购买
              </button>
            ) : (
              <button
                onClick={onList}
                className="px-3 md:px-4 py-1.5 border border-cyber-secondary text-cyber-secondary text-xs md:text-sm rounded-lg hover:bg-cyber-secondary hover:text-black transition-all"
              >
                上架
              </button>
            )}
          </div>
        ) : (
          <div className="text-center pt-1 md:pt-2">
            <button
              onClick={onList}
              className="px-3 md:px-4 py-2 border border-cyber-primary/50 text-cyber-primary text-xs md:text-sm rounded-lg hover:bg-cyber-primary hover:text-black transition-all w-full"
            >
              上架出售
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
