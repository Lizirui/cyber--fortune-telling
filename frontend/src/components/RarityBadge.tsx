type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const RARITY_CONFIG: Record<Rarity, { name: string; color: string }> = {
  0: { name: 'N', color: '#888888' },
  1: { name: 'R', color: '#00ff00' },
  2: { name: 'SR', color: '#00aaff' },
  3: { name: 'SSR', color: '#ff00ff' },
  4: { name: 'SP', color: '#ff8800' },
  5: { name: 'UR', color: '#ffd700' },
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
