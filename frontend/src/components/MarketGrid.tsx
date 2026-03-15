'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFTCard } from './NFTCard';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS, BACKEND_URL } from '@/lib/constants';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface ListedNFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  price: string;
  seller: string;
}

interface ListingsResponse {
  nfts: ListedNFT[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

type SortOption = 'tokenId_asc' | 'tokenId_desc' | 'price_asc' | 'price_desc';

export function MarketGrid() {
  const { isConnected } = useAccount();
  const [nfts, setNfts] = useState<ListedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('tokenId_asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort
      });

      if (filter !== 'all') {
        params.append('rarity', filter.toString());
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`${BACKEND_URL}/api/market/listings?${params}`);
      const data: ListingsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch listings');
      }

      setNfts(data.nfts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [page, filter, sort, search]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleRefresh = () => {
    fetchListings();
  };

  const handleBuy = (nft: ListedNFT) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'buyItem',
      args: [BigInt(nft.tokenId)],
      value: parseEther(nft.price),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const handleFilterChange = (newFilter: Rarity | 'all') => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <>
      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索祝福语..."
            className="flex-1 px-4 py-2 rounded-lg bg-cyber-card border border-cyber-border text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyber-primary text-black font-medium hover:bg-cyber-primary/90 transition-colors"
          >
            搜索
          </button>
        </form>

        {/* Sort and Refresh Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">排序:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-white text-sm focus:outline-none focus:border-cyber-primary"
            >
              <option value="tokenId_asc">最新上架</option>
              <option value="tokenId_desc">最早上架</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg border border-cyber-border text-sm text-gray-300 hover:border-cyber-primary hover:text-cyber-primary transition-colors disabled:opacity-50"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        {/* Results count */}
        <p className="text-center text-gray-500 text-sm">
          共 {total} 个上架 NFT
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded transition-all ${
            filter === 'all' ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
          }`}
        >
          全部
        </button>
        {([0, 1, 2, 3, 4, 5] as Rarity[]).map(r => (
          <button
            key={r}
            onClick={() => handleFilterChange(r)}
            className={`px-4 py-2 rounded transition-all ${
              filter === r ? 'bg-cyber-primary text-black' : 'glass hover:border-cyber-primary'
            }`}
          >
            {['N', 'R', 'SR', 'SSR', 'SP', 'UR'][r]}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          {nfts.length === 0 ? (
            <p className="text-center text-gray-400 py-16">暂无上架 NFT</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map(nft => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-cyber-border text-sm text-gray-300 hover:border-cyber-primary hover:text-cyber-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="text-gray-400 text-sm">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-cyber-border text-sm text-gray-300 hover:border-cyber-primary hover:text-cyber-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
