'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFT_ABI } from '@/lib/contract';
import { CONTRACT_ADDRESS, MINT_FEE, BACKEND_URL } from '@/lib/constants';
import { RarityBadge } from './RarityBadge';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

interface MintResult {
  tokenId: number;
  blessing: string;
  rarity: Rarity;
}

export function MintBox() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<'idle' | 'generating' | 'ready' | 'minting' | 'revealed'>('idle');
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleStart = async () => {
    if (!isConnected) return;
    setStep('generating');
    setError(null);

    try {
      // 调用后端生成祝福语
      const res = await fetch(`${BACKEND_URL}/api/mint/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      setResult({
        tokenId: 0, // 等 mint 后获取
        blessing: data.blessing,
        rarity: data.rarity,
      });
      setStep('ready');
    } catch (err) {
      setError('生成祝福语失败');
      setStep('idle');
    }
  };

  const handleMint = async () => {
    if (!result) return;
    setStep('minting');

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [
          result.blessing,
          result.rarity,
          BigInt(Math.floor(Date.now() / 1000) + 300), // 5分钟过期
          BigInt(Math.floor(Math.random() * 1000000)),
          // 签名需要从后端获取
        ],
        value: parseEther(MINT_FEE),
      });
    } catch (err) {
      setError('Mint 失败');
      setStep('idle');
    }
  };

  // 交易确认后揭示
  if (isSuccess && step === 'minting') {
    setStep('revealed');
  }

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
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all"
          >
            开始算命
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
            disabled={isPending}
            className="px-8 py-3 bg-cyber-primary text-black font-bold rounded neon-border hover:bg-white transition-all disabled:opacity-50"
          >
            {isPending ? '处理中...' : `确认 Mint (${MINT_FEE} ETH)`}
          </button>
        </>
      )}

      {(step === 'minting' || isConfirming) && (
        <div className="py-8">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-secondary border-t-transparent rounded-full mx-auto mb-4" />
          <p>链上确认中...</p>
        </div>
      )}

      {step === 'revealed' && result && (
        <div className="animate-[glow_2s_ease-in-out_infinite_alternate]">
          <div className="text-8xl mb-4">🎊</div>
          <RarityBadge rarity={result.rarity} />
          <p className="text-xl mt-4">{result.blessing}</p>
          <button
            onClick={() => setStep('idle')}
            className="mt-4 px-6 py-2 border border-cyber-primary text-cyber-primary rounded hover:bg-cyber-primary hover:text-black transition-all"
          >
            再算一次
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}
    </div>
  );
}
