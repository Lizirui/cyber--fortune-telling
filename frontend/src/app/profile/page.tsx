'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { NFTCard } from '@/components/NFTCard';
import { NFTModal } from '@/components/NFTModal';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface NFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (!address || !balance) {
      setLoading(false);
      return;
    }

    // TODO: 获取用户所有 NFT
    setNfts([]);
    setLoading(false);
  }, [address, balance]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-cyber-bg">
        <Header />
        <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">请先连接钱包</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header />
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4">
        {/* User Info */}
        <div className="glass rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">我的收藏</h1>
          <p className="text-gray-400 font-mono">{address}</p>
          <p className="text-cyber-primary mt-2">拥有 {balance?.toString() || 0} 个 NFT</p>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full" />
          </div>
        ) : nfts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">暂无 NFT</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map(nft => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                blessing={nft.blessing}
                rarity={nft.rarity}
                onList={() => setSelectedNFT(nft)}
              />
            ))}
          </div>
        )}

        {/* NFT Modal */}
        {selectedNFT && (
          <NFTModal
            isOpen={!!selectedNFT}
            onClose={() => setSelectedNFT(null)}
            tokenId={selectedNFT.tokenId}
            blessing={selectedNFT.blessing}
            rarity={selectedNFT.rarity}
          />
        )}
      </main>
    </div>
  );
}
