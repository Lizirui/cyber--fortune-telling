"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { MarketFilters } from "@/components/MarketFilters";
import { MarketPagination } from "@/components/MarketPagination";
import { BuyConfirmModal } from "@/components/BuyConfirmModal";
import type { Listing, Rarity } from "@/lib/types";

export default function MarketPage() {
  const { isConnected } = useAccount();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "newest" | "oldest">("newest");

  // 购买弹窗
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const limit = 12;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      if (selectedRarity !== null) {
        params.set("rarity", selectedRarity.toString());
      }

      const response = await fetch(`/api/market/listings-onchain?${params}`);
      const data = await response.json();

      if (data.listings) {
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sort, selectedRarity]);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, selectedRarity]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRarityChange = (rarity: Rarity | null) => {
    setSelectedRarity(rarity);
    setPage(1);
  };

  const handleSortChange = (newSort: typeof sort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleBuy = (listing: Listing) => {
    setSelectedListing(listing);
    setShowBuyModal(true);
  };

  const handleBuySuccess = () => {
    // 刷新列表
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid-bg relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-cyber-primary/5 rounded-full blur-3xl" />
      </div>

      <Header />
      <main className="pt-16 md:pt-20 pb-8 md:pb-12 max-w-7xl mx-auto px-3 md:px-4 relative z-10">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            NFT 交易市场
          </h1>
          <p className="text-gray-400 mt-1">买卖你的赛博算命 NFT</p>
        </div>

        {/* 筛选器 */}
        <MarketFilters
          selectedRarity={selectedRarity}
          onRarityChange={handleRarityChange}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {/* 市场内容 */}
        {loading ? (
          <div className="flex justify-center py-12 md:py-20">
            <div className="relative w-10 md:w-12 h-10 md:h-12">
              <div className="absolute inset-0 border-2 border-cyber-primary/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyber-primary rounded-full animate-spin" />
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="glass-cyber rounded-xl p-8 md:p-12 inline-block">
              <div className="text-5xl md:text-6xl mb-4 opacity-50">🛒</div>
              <p className="text-gray-400 text-lg mb-2">暂无可出售的 NFT</p>
              <p className="text-gray-500 text-sm">
                成为第一个上架 NFT 的人吧！
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 列表 */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.tokenId}
                  listing={listing}
                  onBuy={handleBuy}
                />
              ))}
            </div>

            {/* 分页 */}
            <MarketPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* 购买确认弹窗 */}
      <BuyConfirmModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        listing={selectedListing}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
}
