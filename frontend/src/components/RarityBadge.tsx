import { Rarity } from '@/lib/types';

const RARITY_CONFIG: Record<Rarity, { name: string; color: string }> = {
  0: { name: 'N', color: '#888888' },    // 灰色
  1: { name: 'R', color: '#00aaff' },    // 蓝色
  2: { name: 'SR', color: '#a855f7' },    // 紫色
  3: { name: 'SSR', color: '#ffd700' },   // 金色
  4: { name: 'SP', color: '#ef4444' },    // 红色
  5: { name: 'UR', color: '#ec4899' },    // 极光粉紫
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const config = RARITY_CONFIG[rarity];
  return (
    <span
      className="px-2 py-1 rounded text-xs font-bold"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}`,
      }}
    >
      {config.name}
    </span>
  );
}
