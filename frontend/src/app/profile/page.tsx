'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { parseEther } from 'viem';
import { Header } from '@/components/Header';
import { NFTCard } from '@/components/NFTCard';
import { ListModal } from '@/components/ListModal';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS, BACKEND_URL } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface UserNFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  listing?: {
    price: string;
    isListed: boolean;
  };
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const fetchUserNFTs = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/market/user/${address}`);
      const data = await response.json();

      if (data.nfts) {
        setNfts(data.nfts);
      }
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    if (balance !== undefined) {
      if (Number(balance) > 0) {
        fetchUserNFTs();
      } else {
        setNfts([]);
        setLoading(false);
      }
    }
  }, [address, balance, fetchUserNFTs, refetchTrigger]);

  const handleListed = () => {
    setRefetchTrigger(prev => prev + 1);
    setSelectedNFT(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
        </div>
        <Header />
        <main className="pt-16 md:pt-20 pb-8 md:pb-12 max-w-7xl mx-auto px-3 md:px-4 text-center relative z-10">
          <div className="glass-cyber rounded-xl p-8 md:p-12 inline-block">
            <div className="text-5xl md:text-6xl mb-4 opacity-50">🔐</div>
            <p className="text-gray-400 text-lg">请先连接钱包</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-secondary/5 rounded-full blur-3xl" />
      </div>

      <Header />
      <main className="pt-16 md:pt-20 pb-8 md:pb-12 max-w-7xl mx-auto px-3 md:px-4 relative z-10">
        {/* 用户信息卡片 */}
        <div className="glass-cyber rounded-xl p-6 md:p-8 mb-6 md:mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-cyber-primary/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2 md:mb-3">我的收藏</h1>
              <p className="text-gray-400 font-mono text-xs md:text-sm truncate max-w-[200px] md:max-w-none">{address}</p>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-cyber-primary/10 border border-cyber-primary/30 rounded-xl text-center">
                <p className="text-2xl md:text-3xl font-bold text-cyber-primary">{balance?.toString() || 0}</p>
                <p className="text-gray-500 text-xs mt-1">持有 NFT</p>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="flex justify-center py-12 md:py-20">
            <div className="relative w-10 md:w-12 h-10 md:h-12">
              <div className="absolute inset-0 border-2 border-cyber-primary/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyber-primary rounded-full animate-spin" />
            </div>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="glass-cyber rounded-xl p-8 md:p-12 inline-block">
              <div className="text-5xl md:text-6xl mb-4 opacity-50">📦</div>
              <p className="text-gray-400 text-lg mb-2">暂无 NFT</p>
              <p className="text-gray-500 text-sm">去首页Mint一个属于你的赛博祝福吧</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {nfts.map(nft => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                blessing={nft.blessing}
                rarity={nft.rarity}
                price={nft.listing?.price}
                isListed={nft.listing?.isListed}
                onList={() => setSelectedNFT(nft)}
              />
            ))}
          </div>
        )}
      </main>

      {/* List Modal */}
      {selectedNFT && (
        <ListModal
          isOpen={!!selectedNFT}
          onClose={() => setSelectedNFT(null)}
          onListed={handleListed}
          tokenId={selectedNFT.tokenId}
          blessing={selectedNFT.blessing}
          rarity={selectedNFT.rarity}
          currentPrice={selectedNFT.listing?.price}
          isListed={selectedNFT.listing?.isListed}
        />
      )}
    </div>
  );
}
