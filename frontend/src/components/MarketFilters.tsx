'use client';

import { Rarity, RARITY_NAMES } from '@/lib/types';

interface MarketFiltersProps {
  selectedRarity: Rarity | null;
  onRarityChange: (rarity: Rarity | null) => void;
  sort: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  onSortChange: (sort: 'price_asc' | 'price_desc' | 'newest' | 'oldest') => void;
}

const RARITY_OPTIONS: (Rarity | null)[] = [null, 0, 1, 2, 3, 4, 5];

export function MarketFilters({
  selectedRarity,
  onRarityChange,
  sort,
  onSortChange,
}: MarketFiltersProps) {
  return (
    <div className="glass-cyber rounded-xl p-4 mb-6">
      {/* 稀有度筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {RARITY_OPTIONS.map((rarity) => {
          const isSelected = selectedRarity === rarity;
          const label = rarity === null ? '全部' : RARITY_NAMES[rarity];

          return (
            <button
              key={rarity ?? 'all'}
              onClick={() => onRarityChange(rarity)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-cyber-primary text-black'
                  : 'bg-cyber-bg-light text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 排序选项 */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm">排序:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as typeof sort)}
          className="bg-cyber-bg-light text-white px-3 py-1.5 rounded-lg text-sm border border-gray-700 focus:border-cyber-primary focus:outline-none"
        >
          <option value="newest">最新</option>
          <option value="oldest">最旧</option>
          <option value="price_asc">价格: 从低到高</option>
          <option value="price_desc">价格: 从高到低</option>
        </select>
      </div>
    </div>
  );
}
