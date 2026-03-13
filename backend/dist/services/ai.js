import OpenAI from 'openai';
const OPENAI_API_KEY = process.env.DEEPSEEK_API_KEY;
let client = null;
if (OPENAI_API_KEY) {
    client = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: 'https://api.deepseek.com'
    });
}
// 稀有度概率分布
const RARITY_WEIGHTS = [
    0, 0, 0, 0, 0, // N: 50% (5个)
    1, 1, // R: 25% (2个)
    2, 2, // SR: 15% (2个)
    3, // SSR: 7% (1个)
    4, // SP: 2.5% (1个)
    5 // UR: 0.5% (1个)
];
function getRandomRarity() {
    const index = Math.floor(Math.random() * RARITY_WEIGHTS.length);
    return RARITY_WEIGHTS[index];
}
// 预设祝福语（用于无 API Key 时）
const BLESSINGS = {
    0: ['愿你每天开心快乐', '祝你万事如意', '愿你心想事成', '祝你身体健康', '愿你幸福美满'],
    1: ['愿你事业有成', '祝你财源广进', '愿你梦想成真', '祝你福气满满', '愿你好运连连'],
    2: ['愿你前程似锦', '祝你大展宏图', '愿你一帆风顺', '祝你鹏程万里', '愿你马到成功'],
    3: ['愿你站在人生巅峰', '祝你成为传奇', '愿你光芒万丈', '祝你举世无双', '愿你非凡脱俗'],
    4: ['愿你成为传说', '祝你永恒不朽', '愿你超凡入圣', '祝你震古烁今', '愿你独领风骚'],
    5: ['愿你超越极限', '祝你封神之作', '愿你永恒传奇', '祝你唯我独尊', '愿你铸造神话']
};
const RARITY_PROMPTS = {
    0: 'Generate a common blessing message in Chinese, about 60-80 characters. Keep it simple and warm. Just return the blessing text, no additional content.',
    1: 'Generate a rare blessing message in Chinese, about 60-80 characters. Make it more special. Just return the blessing text, no additional content.',
    2: 'Generate a super rare blessing message in Chinese, about 60-80 characters. Make it quite special and unique. Just return the blessing text, no additional content.',
    3: 'Generate a super super rare blessing message in Chinese, about 60-80 characters. Make it very special and memorable. Just return the blessing text, no additional content.',
    4: 'Generate a special blessing message in Chinese, about 60-80 characters. Make it extremely special and legendary. Just return the blessing text, no additional content.',
    5: 'Generate an ultimate rare blessing message in Chinese, about 60-80 characters. Make it the most special and legendary possible. Just return the blessing text, no additional content.'
};
export async function generateBlessing() {
    const rarity = getRandomRarity();
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
