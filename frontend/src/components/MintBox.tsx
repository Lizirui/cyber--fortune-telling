"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useBalance,
} from "wagmi";
import { parseEther } from "viem";
import { baseSepolia, base } from "wagmi/chains";
import { NFT_ABI } from "@/lib/contract";
import { CONTRACT_ADDRESS, MINT_FEE, BACKEND_URL } from "@/lib/constants";
import { CHAIN } from "@/lib/wagmi";
import { RarityBadge } from "./RarityBadge";
import { ConnectWallet } from "./ConnectWallet";

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface MintSignature {
  tokenId: number;
  signature: string;
}

interface RevealData {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
}

export function MintBox() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [step, setStep] = useState<
    "idle" | "minting" | "confirming" | "revealed"
  >("idle");
  const [signatureData, setSignatureData] = useState<MintSignature | null>(
    null,
  );
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  // 检查是否在正确的网络上
  const isCorrectNetwork = chainId === baseSepolia.id || chainId === base.id;
  const isTestnet = chainId === baseSepolia.id;
  const isNetworkReady = chainId !== 0 && chainId !== undefined;

  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isTxError,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  // 获取余额
  const { data: balance } = useBalance({
    address,
    chainId: baseSepolia.id,
  });

  // 监听交易成功
  useEffect(() => {
    if (isSuccess && step === "confirming") {
      // 交易成功，调用 reveal API 获取祝福语
      fetchReveal();
    }
  }, [isSuccess, step]);

  // 监听链上交易确认失败
  useEffect(() => {
    if (isTxError && step === "confirming") {
      console.error("Transaction failed. Hash:", hash, "Receipt:", receipt);
      setError("交易在链上确认失败，请查看控制台");
      setStep("idle");
    }
  }, [isTxError, receipt, hash, step]);

  // writeError 可能是用户拒绝交易，直接回到初始状态
  useEffect(() => {
    if (writeError && (step === "minting" || step === "confirming")) {
      console.error("Write contract error:", writeError);
      // 用户拒绝交易时，直接回到初始状态，不显示错误
      setStep("idle");
      setSignatureData(null);
    }
  }, [writeError, step]);

  // 获取祝福语
  const fetchReveal = async () => {
    if (!signatureData) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/mint/reveal/${signatureData.tokenId}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "获取祝福语失败");
      }

      setRevealData({
        tokenId: data.tokenId,
        blessing: data.blessing,
        rarity: data.rarity,
      });
      setStep("revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取祝福语失败");
      setStep("idle");
    }
  };

  // 开始算命：调用后端获取签名，然后立即调用合约
  const handleStart = async () => {
    if (!isConnected || !address) return;

    // 验证合约地址
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x") {
      setError("合约地址未配置，请检查环境变量");
      return;
    }

    setStep("minting");
    setError(null);

    try {
      // 1. 调用后端生成签名（不返回 blessing）
      const res = await fetch(`${BACKEND_URL}/api/mint/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: address }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成签名失败");
      }

      // 2. 保存签名数据
      setSignatureData({
        tokenId: data.tokenId,
        signature: data.signature,
      });

      // 3. 立即调用合约（不显示 blessing）
      // 注意：签名只验证 tokenId + userAddress，不验证 blessing/rarity
      // 合约会存储我们传入的 blessing/rarity
      console.log("Starting mint with params:", {
        address: CONTRACT_ADDRESS,
        tokenId: data.tokenId,
        signature: data.signature,
        value: MINT_FEE,
        chain: CHAIN,
      });

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "mintWithSignature",
        args: [
          " ", // blessing - 使用单个空格减少 Gas 消耗
          0, // rarity - 稍后从 reveal 获取
          BigInt(0), // expiresAt - 保留参数
          data.signature as `0x${string}`,
        ],
        value: parseEther(MINT_FEE),
        chain: CHAIN,
        gas: BigInt(1500000), // 设置足够的 Gas 限制
      });

      setStep("confirming");
    } catch (err) {
      console.error("Start mint error:", err);
      setError(err instanceof Error ? err.message : "开始算命失败");
      setStep("idle");
    }
  };

  const handleSwitchNetwork = () => {
    switchChain?.({ chainId: CHAIN.id });
  };

  // 钱包未连接
  if (!isConnected) {
    return (
      <div className="glass-cyber rounded-xl p-8 md:p-12 text-center relative corner-decoration">
        <div className="text-5xl md:text-7xl mb-4 md:mb-6 opacity-50">🔮</div>
        <p className="text-gray-400 text-lg mb-2">连接你的钱包</p>
        <p className="text-gray-500 text-sm mb-6">开启赛博命运的探索之旅</p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-cyber rounded-xl p-6 md:p-10 text-center relative corner-decoration">
      {/* 动态边框效果 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-primary/0 via-cyber-primary/10 to-cyber-primary/0 opacity-50 pointer-events-none" />

      {step === "idle" && (
        <>
          <div className="text-5xl md:text-7xl mb-4 md:mb-6 relative">
            <span className="relative z-10">🎁</span>
            <span className="absolute inset-0 bg-cyber-primary/20 blur-xl rounded-full" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">
            开始你的算命之旅
          </h2>
          <p className="text-gray-400 mb-4 md:mb-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-cyber-primary">费用:</span>
              <span className="text-cyber-accent font-bold">{MINT_FEE} ETH</span>
              {isTestnet && <span className="text-cyber-primary text-sm">(Sepolia)</span>}
            </div>
            {balance && (
              <span className="text-gray-500 text-xs">
                你的余额: {balance.formatted} ETH
              </span>
            )}
          </p>
          <button
            onClick={
              !isCorrectNetwork && isNetworkReady
                ? handleSwitchNetwork
                : handleStart
            }
            disabled={
              !address ||
              (!isCorrectNetwork && isNetworkReady ? false : !isCorrectNetwork)
            }
            className="cyber-btn w-full md:w-auto"
          >
            {!isNetworkReady
              ? "请连接钱包"
              : !isCorrectNetwork
                ? "请切换到 Base Sepolia"
                : "开始算命"}
          </button>
          {isCorrectNetwork && (
            <div>
              <button
                onClick={() => setShowFaucetModal(true)}
                className="text-cyber-primary text-sm hover:underline mt-4 cursor-pointer"
              >
                没有 ETH？点击领取测试币
              </button>
            </div>
          )}
        </>
      )}

      {step === "minting" && (
        <div className="py-8 md:py-12">
          <div className="relative w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6">
            <div className="absolute inset-0 border-4 border-cyber-primary/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyber-primary rounded-full animate-spin" />
          </div>
          <p className="text-cyber-primary text-lg mb-2">正在生成你的命运...</p>
          <p className="text-gray-500 text-sm">请在钱包中确认交易</p>
        </div>
      )}

      {(step === "confirming" || isConfirming) && isCorrectNetwork && (
        <div className="py-8 md:py-12">
          <div className="relative w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6">
            <div className="absolute inset-0 border-4 border-cyber-secondary/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyber-secondary rounded-full animate-spin" />
          </div>
          <p className="text-cyber-secondary text-lg mb-2">链上确认中...</p>
          <p className="text-gray-500 text-sm">请在钱包中确认交易</p>
        </div>
      )}

      {step === "revealed" && revealData && (
        <div className="py-6 md:py-8">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6 relative inline-block">
            <span className="relative z-10">🎊</span>
            <span className="absolute inset-0 bg-cyber-accent/30 blur-2xl rounded-full animate-pulse" />
          </div>
          <div className="mb-4 md:mb-6">
            <RarityBadge rarity={revealData.rarity} />
          </div>
          <p className="text-lg md:text-2xl font-bold text-white mb-6 md:mb-8 max-w-md mx-auto leading-relaxed px-2">
            {revealData.blessing}
          </p>
          <button
            onClick={() => {
              setStep("idle");
              setSignatureData(null);
              setRevealData(null);
              setError(null);
            }}
            className="cyber-btn-secondary"
          >
            再算一次
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg">
          <p className="text-cyber-danger mb-2">{error}</p>
          {step === "idle" && (
            <button
              onClick={() => setStep("idle")}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← 返回
            </button>
          )}
        </div>
      )}

      {/* 领取测试币弹窗 */}
      {showFaucetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowFaucetModal(false)}
          />
          <div className="relative bg-[#0a0a0f] border border-cyber-primary/30 rounded-xl p-6 md:p-8 max-w-md w-full">
            <button
              onClick={() => setShowFaucetModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              领取 Base Sepolia 测试币
            </h3>
            <div className="text-gray-300 space-y-3 text-sm">
              <p>请按照以下步骤领取测试 ETH：</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  打开{" "}
                  <a
                    href="https://bridge.base.org/deposit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyber-primary hover:underline"
                  >
                    Base Bridge
                  </a>
                </li>
                <li>
                  将你的钱包网络切换到{" "}
                  <span className="text-cyber-accent">Sepolia</span>
                </li>
                <li>
                  将 <span className="text-cyber-accent">Sepolia ETH</span>{" "}
                  跨链到 <span className="text-cyber-accent">Base Sepolia</span>
                </li>
                <li>
                  如果 Sepolia 没有 ETH，可以去{" "}
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyber-primary hover:underline"
                  >
                    Alchemy Sepolia Faucet
                  </a>{" "}
                  或者{" "}
                  <a
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyber-primary hover:underline"
                  >
                    Google Sepolia Faucet
                  </a>
                  领取
                </li>
              </ol>
              <p className="text-gray-400 text-xs mt-4">
                注意：跨链需要几分钟时间，请耐心等待
              </p>
            </div>
            <button
              onClick={() => setShowFaucetModal(false)}
              className="cyber-btn w-full mt-6"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
