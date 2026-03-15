'use client';

import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const RARITY_CONFIG: Record<Rarity, {
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  borderColor: string;
  bgOpacity: string;
  glowColor: string;
  hasGlow: boolean;
  hasAnimation: boolean;
}> = {
  // N (普通) - 灰色边框，深色背景
  0: { gradientFrom: 'from-gray-700/40', gradientTo: 'to-gray-800/40', textColor: '#888888', borderColor: '#888888', bgOpacity: '20', glowColor: '#888888', hasGlow: false, hasAnimation: false },
  // R (稀有) - 蓝色边框，轻微发光
  1: { gradientFrom: 'from-blue-900/40', gradientTo: 'to-blue-800/40', textColor: '#00aaff', borderColor: '#00aaff', bgOpacity: '20', glowColor: '#00aaff', hasGlow: true, hasAnimation: false },
  // SR (超稀有) - 紫色边框，星星装饰
  2: { gradientFrom: 'from-purple-900/40', gradientTo: 'to-pink-800/40', textColor: '#a855f7', borderColor: '#a855f7', bgOpacity: '20', glowColor: '#a855f7', hasGlow: true, hasAnimation: false },
  // SSR (超超稀有) - 金色边框，金光闪烁效果
  3: { gradientFrom: 'from-yellow-900/40', gradientTo: 'to-amber-800/40', textColor: '#ffd700', borderColor: '#ffd700', bgOpacity: '20', glowColor: '#ffd700', hasGlow: true, hasAnimation: true },
  // SP (特殊) - 红色边框，强烈红光动画
  4: { gradientFrom: 'from-red-900/40', gradientTo: 'to-orange-800/40', textColor: '#ef4444', borderColor: '#ef4444', bgOpacity: '20', glowColor: '#ef4444', hasGlow: true, hasAnimation: true },
  // UR (传说) - 梦幻极光渐变，极光流动效果，边缘发光
  5: { gradientFrom: 'from-pink-500/40', gradientTo: 'to-cyan-400/40', textColor: '#f0fdf4', borderColor: '#ec4899', bgOpacity: '30', glowColor: '#ec4899', hasGlow: true, hasAnimation: true },
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
  const rarityConfig = RARITY_CONFIG[rarity];

  return (
    <div className="glass-cyber rounded-xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group">
      {/* 卡片封面 - 显示祝福语 */}
      <div className="aspect-square bg-gradient-to-br from-black/80 to-cyber-bg-light relative overflow-hidden">
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* 祝福语显示区域 */}
        <div
          className={`absolute inset-2 rounded-lg bg-gradient-to-br flex items-center justify-center p-3 border shadow-lg ${
            rarityConfig.hasAnimation ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${rarityConfig.textColor}${rarityConfig.bgOpacity}, ${rarityConfig.borderColor}10)`,
            borderColor: `${rarityConfig.borderColor}60`,
            boxShadow: rarityConfig.hasGlow
              ? `0 0 20px ${rarityConfig.glowColor}30, inset 0 0 20px ${rarityConfig.glowColor}10`
              : undefined,
          }}
        >
          <p
            className="text-sm md:text-base font-bold text-center leading-relaxed break-words max-w-full"
            style={{ color: rarityConfig.textColor }}
          >
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
