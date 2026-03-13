'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFTCard } from './NFTCard';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface ListedNFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price: string;
  seller: string;
}

export function MarketGrid() {
  const { isConnected } = useAccount();
  const [nfts, setNfts] = useState<ListedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Rarity | 'all'>('all');

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // TODO: 从后端或合约获取上架列表
    setLoading(false);
  }, []);

  const handleBuy = (nft: ListedNFT) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'buyItem',
      args: [BigInt(nft.tokenId)],
      value: parseEther(nft.price),
    });
  };

  const filteredNFTs = filter === 'all' ? nfts : nfts.filter(n => n.rarity === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded transition-all ${
            filter === 'all' ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
          }`}
        >
          全部
        </button>
        {([0, 1, 2, 3, 4, 5] as Rarity[]).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded transition-all ${
              filter === r ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
            }`}
          >
            {['N', 'R', 'SR', 'SSR', 'SP', 'UR'][r]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredNFTs.length === 0 ? (
        <p className="text-center text-gray-400 py-16">暂无上架 NFT</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map(nft => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              blessing={nft.blessing}
              rarity={nft.rarity}
              price={nft.price}
              isListed
              onBuy={() => handleBuy(nft)}
            />
          ))}
        </div>
      )}
    </>
  );
}
