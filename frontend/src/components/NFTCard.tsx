'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const RARITY_STYLES: Record<Rarity, {
  gradient: string;
  textColor: string;
  shadow: string;
  glow: string;
}> = {
  0: { gradient: 'from-gray-700/30 to-gray-800/30', textColor: 'text-gray-300', shadow: 'shadow-gray-500/20', glow: 'shadow-gray-500/10' },
  1: { gradient: 'from-green-900/30 to-green-800/30', textColor: 'text-green-400', shadow: 'shadow-green-500/20', glow: 'shadow-green-500/10' },
  2: { gradient: 'from-blue-900/30 to-blue-800/30', textColor: 'text-blue-400', shadow: 'shadow-blue-500/20', glow: 'shadow-blue-500/10' },
  3: { gradient: 'from-purple-900/30 to-pink-800/30', textColor: 'text-purple-400', shadow: 'shadow-purple-500/20', glow: 'shadow-purple-500/10' },
  4: { gradient: 'from-orange-900/30 to-red-800/30', textColor: 'text-orange-400', shadow: 'shadow-orange-500/20', glow: 'shadow-orange-500/10' },
  5: { gradient: 'from-yellow-900/30 to-amber-800/30', textColor: 'text-yellow-400', shadow: 'shadow-yellow-500/20', glow: 'shadow-yellow-500/10' },
};

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
  const rarityStyle = RARITY_STYLES[rarity];

  return (
    <div className="glass-cyber rounded-xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group">
      {/* 卡片封面 - 显示祝福语 */}
      <div className="aspect-square bg-gradient-to-br from-black/80 to-cyber-bg-light relative overflow-hidden">
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* 祝福语显示区域 */}
        <div className={`absolute inset-2 rounded-lg bg-gradient-to-br ${rarityStyle.gradient} flex items-center justify-center p-3 border border-white/5 ${rarityStyle.glow} shadow-lg`}>
          <p className={`text-sm md:text-base font-bold ${rarityStyle.textColor} text-center leading-relaxed break-words max-w-full`}>
            {blessing}
          </p>
        </div>

        {/* 角落装饰 */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-primary/30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-primary/30" />
      </div>

      <div className="p-3 md:p-5">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-gray-500 font-mono text-xs md:text-sm">#{tokenId}</span>
          <RarityBadge rarity={rarity} />
        </div>

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
