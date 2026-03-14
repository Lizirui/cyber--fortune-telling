'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia, base } from 'wagmi/chains';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS, MINT_FEE, BACKEND_URL } from '@/lib/constants';
import { CHAIN } from '@/lib/wagmi';
import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface MintResult {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
  expiresAt: number;
  signature: string;
}

export function MintBox() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [step, setStep] = useState<'idle' | 'generating' | 'ready' | 'minting' | 'revealed'>('idle');
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 检查是否在正确的网络上
  const isCorrectNetwork = chainId === baseSepolia.id || chainId === base.id;
  const isNetworkReady = chainId !== 0 && chainId !== undefined;

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({ hash });

  // 监听交易成功
  useEffect(() => {
    if (isSuccess && step === 'minting') {
      setStep('revealed');
    }
  }, [isSuccess, step]);

  // 监听链上交易确认失败
  useEffect(() => {
    if (isTxError && step === 'minting') {
      setError('交易在链上确认失败');
      setStep('ready');
    }
  }, [isTxError, step]);

  // writeError 可能是用户拒绝交易，不要显示错误，直接让用户重试
  useEffect(() => {
    if (writeError && step === 'minting') {
      console.error('Write contract error:', writeError);
      // 用户拒绝或签名失败，回到 ready 状态让用户重试
      setError(writeError.message || '交易失败，请重试');
      setStep('ready');
    }
  }, [writeError, step]);

  const handleStart = async () => {
    if (!isConnected || !address) return;
    setStep('generating');
    setError(null);

    try {
      // 调用后端生成祝福语
      const res = await fetch(`${BACKEND_URL}/api/mint/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成祝福语失败');
      }

      setResult({
        tokenId: data.tokenId,
        blessing: data.blessing,
        rarity: data.rarity,
        expiresAt: data.expiresAt,
        signature: data.signature,
      });
      setStep('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成祝福语失败');
      setStep('idle');
    }
  };

  const handleMint = () => {
    if (!result) return;

    // 验证合约地址
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x') {
      setError('合约地址未配置，请检查环境变量');
      return;
    }

    console.log('Starting mint with params:', {
      address: CONTRACT_ADDRESS,
      blessing: result.blessing,
      rarity: result.rarity,
      expiresAt: result.expiresAt,
      signature: result.signature,
      value: MINT_FEE,
      chain: CHAIN,
    });

    setStep('minting');
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mintWithSignature',
        args: [
          result.blessing,
          result.rarity,
          BigInt(result.expiresAt),
          result.signature as `0x${string}`,
        ],
        value: parseEther(MINT_FEE),
        chain: CHAIN,
      });
    } catch (err) {
      // 同步错误（例如参数验证失败）
      console.error('Mint error:', err);
      setError(err instanceof Error ? err.message : 'Mint 失败');
      setStep('ready');
    }
  };

  // 钱包未连接
  if (!isConnected) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">请先连接钱包</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-8 text-center">
      {step === 'idle' && (
        <>
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2">开始你的算命之旅</h2>
          <p className="text-gray-400 mb-4">费用: {MINT_FEE} ETH</p>
          <button
            onClick={handleStart}
            disabled={!address || !isCorrectNetwork}
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all disabled:opacity-50"
          >
            {!isNetworkReady ? '请连接钱包' : !isCorrectNetwork ? '请切换到 Base Sepolia' : '开始算命'}
          </button>
        </>
      )}

      {step === 'generating' && (
        <div className="py-8">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>正在生成你的命运...</p>
        </div>
      )}

      {step === 'ready' && result && (
        <>
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-4">命运已注定</h2>
          <p className="text-gray-400 mb-4">确认后将揭示你的祝福</p>
          <button
            onClick={handleMint}
            disabled={isPending || isConfirming || !isCorrectNetwork || !CONTRACT_ADDRESS}
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all disabled:opacity-50"
          >
            {isPending || isConfirming ? '处理中...' : !isCorrectNetwork ? '请切换到 Base Sepolia' : `确认 Mint (${MINT_FEE} ETH)`}
          </button>
        </>
      )}

      {(step === 'minting' || isConfirming) && (
        <div className="py-8">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-secondary border-t-transparent rounded-full mx-auto mb-4" />
          <p>链上确认中...</p>
          <p className="text-sm text-gray-500 mt-2">请在钱包中确认交易</p>
        </div>
      )}

      {step === 'revealed' && result && (
        <div className="animate-[glow_2s_ease-in-out_infinite_alternate]">
          <div className="text-8xl mb-4">🎊</div>
          <RarityBadge rarity={result.rarity} />
          <p className="text-xl mt-4">{result.blessing}</p>
          <button
            onClick={() => {
              setStep('idle');
              setResult(null);
              setError(null);
            }}
            className="mt-4 px-6 py-2 border border-cyber-primary text-cyber-primary rounded hover:bg-cyber-primary hover:text-black transition-all"
          >
            再算一次
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <p className="text-red-500">{error}</p>
          {step === 'ready' && (
            <button
              onClick={() => setStep('idle')}
              className="mt-2 px-4 py-2 text-gray-400 hover:text-white"
            >
              返回
            </button>
          )}
        </div>
      )}
    </div>
  );
}
