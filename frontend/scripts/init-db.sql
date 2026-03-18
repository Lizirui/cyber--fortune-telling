-- 赛博算命 NFT 祝福语池数据库表
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建祝福语池表
CREATE TABLE IF NOT EXISTS blessing_pool (
    id SERIAL PRIMARY KEY,
    rarity INTEGER NOT NULL CHECK (rarity >= 0 AND rarity <= 5),
    blessing TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_blessing_pool_rarity ON blessing_pool(rarity);
CREATE INDEX IF NOT EXISTS idx_blessing_pool_is_used ON blessing_pool(is_used);

-- 可选：创建初始祝福语数据（每种稀有度添加一些）- Web3 风格
-- 普通祝福语 (rarity = 0)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(0, '愿你Gas费永远低廉', FALSE),
(0, '祝你区块确认快速', FALSE),
(0, '愿你私钥安全无损', FALSE),
(0, '祝你钱包常亮', FALSE),
(0, '愿你链上平安', FALSE),
(0, '祝你交易秒过', FALSE),
(0, '愿你地址吉祥', FALSE),
(0, '祝你Gas打骨折', FALSE),
(0, '愿你节点稳定', FALSE),
(0, '祝你签名顺畅', FALSE)
ON CONFLICT DO NOTHING;

-- 稀有祝福语 (rarity = 1)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(1, '愿你DeFi收益丰厚', FALSE),
(1, '祝你NFT minted', FALSE),
(1, '愿你Gas费打骨折', FALSE),
(1, '祝你白名单常在', FALSE),
(1, '愿你逢签必中', FALSE),
(1, '祝你空投接到手软', FALSE),
(1, '愿你mint秒中', FALSE),
(1, '祝你DAO治理有方', FALSE),
(1, '愿你跨链顺畅无阻', FALSE),
(1, '祝你套利百发百中', FALSE)
ON CONFLICT DO NOTHING;

-- 超稀有祝福语 (rarity = 2)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(2, '愿你抓住百倍币', FALSE),
(2, '祝你空投大丰收', FALSE),
(2, '愿你mint百发百中', FALSE),
(2, '祝你DeFi挖矿丰收', FALSE),
(2, '愿你NFT暴涨百倍', FALSE),
(2, '祝你Gas费全免', FALSE),
(2, '愿你白名单拿到手软', FALSE),
(2, '祝你抢到热门NFT', FALSE),
(2, '愿你链上好运行', FALSE),
(2, '祝你合约无bug', FALSE)
ON CONFLICT DO NOTHING;

-- 超超稀有祝福语 (rarity = 3)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(3, '愿你成为加密传奇', FALSE),
(3, '祝你持币暴富', FALSE),
(3, '愿你钱包地址成神', FALSE),
(3, '祝你forever hodl', FALSE),
(3, '愿你币价涨破天际', FALSE),
(3, '祝你成为 Whale', FALSE),
(3, '愿你掌控无数代币', FALSE),
(3, '祝你名震 Web3 圈', FALSE),
(3, '愿你开创新协议', FALSE),
(3, '祝你成为链上巨鲸', FALSE)
ON CONFLICT DO NOTHING;

-- 特殊祝福语 (rarity = 4)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(4, '愿你掌控区块链', FALSE),
(4, '祝你创造代币标准', FALSE),
(4, '愿你开创新范式', FALSE),
(4, '祝你引领Web3革命', FALSE),
(4, '愿你成为中本聪第二', FALSE),
(4, '祝你创建顶级DAO', FALSE),
(4, '愿你部署永恒合约', FALSE),
(4, '祝你铸造传世NFT', FALSE),
(4, '愿你统治Layer2', FALSE),
(4, '祝你改变加密史', FALSE)
ON CONFLICT DO NOTHING;

-- 终极稀有祝福语 (rarity = 5)
INSERT INTO blessing_pool (rarity, blessing, is_used) VALUES
(5, '愿你超越中本聪', FALSE),
(5, '祝你永恒存在于链上', FALSE),
(5, '愿你成为加密之神', FALSE),
(5, '祝你统治元宇宙', FALSE),
(5, '愿你永不做恶梦', FALSE),
(5, '祝你创造新共识', FALSE),
(5, '愿你化身区块链', FALSE),
(5, '祝你定义Web3未来', FALSE),
(5, '愿你成为DAO之魂', FALSE),
(5, '祝你永生不灭于链上', FALSE)
ON CONFLICT DO NOTHING;

-- 验证数据
SELECT rarity, COUNT(*) as count FROM blessing_pool GROUP BY rarity ORDER BY rarity;
