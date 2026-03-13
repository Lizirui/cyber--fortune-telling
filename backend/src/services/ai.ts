import OpenAI from 'openai';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const OPENAI_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY not configured');
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

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

const RARITY_PROMPTS: Record<Rarity, string> = {
  0: 'Generate a common blessing message in Chinese, about 60-80 characters. Keep it simple and warm. Just return the blessing text, no additional content.',
  1: 'Generate a rare blessing message in Chinese, about 60-80 characters. Make it more special. Just return the blessing text, no additional content.',
  2: 'Generate a super rare blessing message in Chinese, about 60-80 characters. Make it quite special and unique. Just return the blessing text, no additional content.',
  3: 'Generate a super super rare blessing message in Chinese, about 60-80 characters. Make it very special and memorable. Just return the blessing text, no additional content.',
  4: 'Generate a special blessing message in Chinese, about 60-80 characters. Make it extremely special and legendary. Just return the blessing text, no additional content.',
  5: 'Generate an ultimate rare blessing message in Chinese, about 60-80 characters. Make it the most special and legendary possible. Just return the blessing text, no additional content.'
};

export async function generateBlessing(): Promise<{ blessing: string; rarity: Rarity }> {
  const rarity = getRandomRarity();

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
