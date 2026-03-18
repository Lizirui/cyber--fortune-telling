import OpenAI from 'openai';

import { Rarity } from './types';

function getClient() {
  const OPENAI_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.deepseek.com'
  });
}

// 稀有度概率分布
const RARITY_WEIGHTS: Rarity[] = [
  0, 0, 0, 0, 0, // N: 50% (5个)
  1, 1,          // R: 25% (2个)
  2, 2,          // SR: 15% (2个)
  3,             // SSR: 7% (1个)
  4,             // SP: 2.5% (1个)
  5              // UR: 0.5% (1个)
];

function getRandomRarity(): Rarity {
  const index = Math.floor(Math.random() * RARITY_WEIGHTS.length);
  return RARITY_WEIGHTS[index];
}

// 预设祝福语（用于无 API Key 时）- Web3 风格
const BLESSINGS: Record<Rarity, string[]> = {
  0: ['愿你 Gas 费永远低廉', '祝你区块确认快速', '愿你私钥安全无损', '祝你钱包常亮', '愿你链上平安'],
  1: ['愿你DeFi收益丰厚', '祝你NFT minted', '愿你Gas费打骨折', '祝你白名单常在', '愿你逢签必中'],
  2: ['愿你抓住百倍币', '祝你空投接到手软', '愿你mint秒中', '祝你DAO治理有方', '愿你跨链顺畅无阻'],
  3: ['愿你成为加密传奇', '祝你持币暴富', '愿你钱包地址成神', '祝你forever hodl', '愿你币价涨破天际'],
  4: ['愿你掌控区块链', '祝你创造代币标准', '愿你开创新范式', '祝你引领Web3革命', '愿你成为中本聪第二'],
  5: ['愿你超越中本聪', '祝你永恒存在于链上', '愿你成为加密之神', '祝你统治元宇宙', '愿你永不做恶梦']
};

const RARITY_PROMPTS: Record<Rarity, string> = {
  0: 'Generate a common Web3/crypto blessing message in Chinese, about 60-80 characters. Keep it simple and related to blockchain, crypto, or Web3. Just return the blessing text, no additional content.',
  1: 'Generate a rare Web3/crypto blessing message in Chinese, about 60-80 characters. Make it more special and related to DeFi, NFTs, or blockchain. Just return the blessing text, no additional content.',
  2: 'Generate a super rare Web3/crypto blessing message in Chinese, about 60-80 characters. Make it quite special and related to crypto wealth, tokens, or Web3 dreams. Just return the blessing text, no additional content.',
  3: 'Generate a super super rare Web3/crypto blessing message in Chinese, about 60-80 characters. Make it very special and legendary, related to becoming a crypto legend or whale. Just return the blessing text, no additional content.',
  4: 'Generate a special Web3/crypto blessing message in Chinese, about 60-80 characters. Make it extremely special and legendary, related to creating blockchain standards or revolution. Just return the blessing text, no additional content.',
  5: 'Generate an ultimate rare Web3/crypto blessing message in Chinese, about 60-80 characters. Make it the most special and legendary possible, related to becoming a crypto god or Satoshi. Just return the blessing text, no additional content.'
};

export async function generateBlessing(): Promise<{ blessing: string; rarity: Rarity }> {
  const rarity = getRandomRarity();
  const client = getClient();

  // 如果没有配置 API Key，使用预设祝福语
  if (!client) {
    const blessings = BLESSINGS[rarity];
    const blessing = blessings[Math.floor(Math.random() * blessings.length)];
    return { blessing, rarity };
  }

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'user', content: RARITY_PROMPTS[rarity] }
    ],
    temperature: 0.8
  });

  const blessing = completion.choices[0]?.message?.content || '愿你心想事成';

  return {
    blessing,
    rarity
  };
}

// 根据稀有度生成指定数量的祝福语（用于初始化池）
export async function generateBlessingsByRarity(
  rarity: Rarity,
  count: number
): Promise<string[]> {
  const client = getClient();

  if (!client) {
    // 无 API Key 时使用预设祝福语
    const blessings = BLESSINGS[rarity];
    // 重复利用直到满足数量
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(blessings[i % blessings.length]);
    }
    return result;
  }

  const rarityNames = ['普通', '稀有', '超稀有', '超超稀有', '特殊', '终极'];
  const prompt = `Generate ${count} unique Web3/crypto blessing messages in Chinese, each about 60-80 characters.
Rarity level: ${rarity} (${rarityNames[rarity]}).
Each blessing should be unique, special, and related to blockchain, crypto, DeFi, NFTs, or Web3.
Return them as a JSON array of strings, like: ["blessing1", "blessing2", ...]`;

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9
  });

  const content = completion.choices[0]?.message?.content || '[]';

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // 解析失败返回空数组
    return [];
  }
}
