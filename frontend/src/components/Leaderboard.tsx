'use client';

import { useEffect, useState } from 'react';
import { BACKEND_URL } from '@/lib/constants';

interface LeaderboardItem {
  address: string;
  totalMinted: number;
  rarityBreakdown: {
    N: number;
    R: number;
    SR: number;
    SSR: number;
    SP: number;
    UR: number;
  };
}

export function Leaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-cyber-primary">排行榜</h2>
      </div>
      <div className="divide-y divide-gray-800">
        {items.length === 0 ? (
          <p className="p-4 text-gray-400 text-center">暂无数据</p>
        ) : (
          items.map((item, index) => (
            <div key={item.address} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-600">
                  {index + 1}
                </span>
                <span className="font-mono text-sm">
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">共 {item.totalMinted}</span>
                {item.rarityBreakdown.UR > 0 && (
                  <span className="px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] text-xs rounded">
                    UR x{item.rarityBreakdown.UR}
                  </span>
                )}
                {item.rarityBreakdown.SP > 0 && (
                  <span className="px-2 py-0.5 bg-[#ff8800]/20 text-[#ff8800] text-xs rounded">
                    SP x{item.rarityBreakdown.SP}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
