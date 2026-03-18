"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { NFTCard } from "@/components/NFTCard";
import { ListNFTModal } from "@/components/ListNFTModal";
import { NFT_ABI } from "@/lib/contract";
import { CONTRACT_ADDRESS, API_BASE_URL } from "@/lib/constants";
import { Rarity } from "@/lib/types";

interface UserNFT {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  isListed?: boolean;
  listingPrice?: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // 上架弹窗
  const [listModalTokenId, setListModalTokenId] = useState<number | null>(null);
  // 取消上架
  const [cancelTokenId, setCancelTokenId] = useState<number | null>(null);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // 获取用户的 NFT 列表
  const fetchUserNFTs = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/nft/user/${address}`);
      const data = await response.json();

      if (data.nfts) {
        // 检查每个 NFT 是否已上架（直接从链上读取）
        const nftsWithListingStatus: UserNFT[] = await Promise.all(
          data.nfts.map(
            async (nft: {
              tokenId: number;
              blessing: string;
              rarity: Rarity;
            }) => {
              try {
                const listingRes = await fetch(
                  `/api/nft/listing/${nft.tokenId}`,
                );
                if (listingRes.ok) {
                  const listingData = await listingRes.json();
                  if (listingData.isListed) {
                    return {
                      ...nft,
                      isListed: true,
                      listingPrice: listingData.priceEth,
                    };
                  }
                }
              } catch {
                // Listing not found
              }
              return {
                ...nft,
                isListed: false,
              };
            },
          ),
        );
        setNfts(nftsWithListingStatus);
      }
    } catch (error) {
      console.error("Failed to fetch user NFTs:", error);
      // 即使失败也设置 NFT（不显示上架状态）
      try {
        const response = await fetch(`${API_BASE_URL}/api/nft/user/${address}`);
        const data = await response.json();
        if (data.nfts) {
          setNfts(
            data.nfts.map(
              (nft: { tokenId: number; blessing: string; rarity: Rarity }) => ({
                ...nft,
                isListed: false,
              }),
            ),
          );
        }
      } catch {
        // Ignore
      }
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
  }, [address, balance, fetchUserNFTs]);

  const handleListSuccess = () => {
    fetchUserNFTs();
    setListModalTokenId(null);
  };

  // 取消上架
  const handleCancelListing = async (tokenId: number) => {
    setCancelTokenId(tokenId);
  };

  const {
    data: cancelHash,
    writeContract: writeCancelContract,
    isPending: isCancelPending,
  } = useWriteContract();
  const { isLoading: isCanceling, isSuccess: isCancelSuccess } =
    useWaitForTransactionReceipt({
      hash: cancelHash,
    });

  const isCancelling = isCancelPending || isCanceling;

  useEffect(() => {
    if (isCancelSuccess && cancelTokenId !== null) {
      fetchUserNFTs();
      setCancelTokenId(null);
    }
  }, [isCancelSuccess, cancelTokenId, fetchUserNFTs]);

  const confirmCancel = () => {
    if (cancelTokenId === null) return;
    writeCancelContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: "cancelListing",
      args: [BigInt(cancelTokenId)],
    });
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
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                我的收藏
              </h1>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-cyber-primary/10 border border-cyber-primary/30 rounded-xl text-center">
                <p className="text-2xl md:text-3xl font-bold text-cyber-primary">
                  {balance?.toString() || 0}
                </p>
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
              <p className="text-gray-500 text-sm">
                去首页 Mint 一个属于你的赛博祝福吧
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {nfts.map((nft) => (
              <div key={nft.tokenId} className="flex flex-col gap-2">
                <NFTCard
                  tokenId={nft.tokenId}
                  blessing={nft.blessing}
                  rarity={nft.rarity}
                />
                {/* 上架/下架按钮 */}
                <div className="p-2 bg-cyber-bg-light rounded-lg">
                  {nft.isListed ? (
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-primary text-xs font-medium">
                        {nft.listingPrice} ETH
                      </span>
                      <button
                        onClick={() => handleCancelListing(nft.tokenId)}
                        disabled={cancelTokenId !== null}
                        className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setListModalTokenId(nft.tokenId)}
                      className="w-full py-2 text-xs bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary rounded transition-colors cursor-pointer"
                    >
                      上架出售
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 上架弹窗 */}
      {listModalTokenId !== null && (
        <ListNFTModal
          isOpen={true}
          onClose={() => setListModalTokenId(null)}
          tokenId={listModalTokenId}
          onSuccess={handleListSuccess}
        />
      )}

      {/* 取消上架确认弹窗 */}
      {cancelTokenId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCancelTokenId(null)}
          />
          <div className="relative glass-cyber rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">取消上架</h2>
            <p className="text-gray-400 mb-4">
              确定要取消 NFT # {cancelTokenId} 的上架吗？
            </p>
            {isCancelling && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
                链上处理中...
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTokenId(null)}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                保留
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isCancelling ? "取消中..." : "确认取消"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
