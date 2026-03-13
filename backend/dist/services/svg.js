import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const RARITY_NAMES = {
    0: 'N',
    1: 'R',
    2: 'SR',
    3: 'SSR',
    4: 'SP',
    5: 'UR'
};
const RARITY_FILES = {
    0: 'n.svg',
    1: 'r.svg',
    2: 'sr.svg',
    3: 'ssr.svg',
    4: 'sp.svg',
    5: 'ur.svg'
};
function getTemplatesDir() {
    // 获取当前文件所在目录
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // 返回 templates 目录（相对于 src/services）
    return path.join(__dirname, '..', '..', 'templates');
}
export function generateSVG(blessing, tokenId, rarity) {
    const templatePath = path.join(getTemplatesDir(), RARITY_FILES[rarity]);
    let svg = fs.readFileSync(templatePath, 'utf-8');
    // 替换占位符
    svg = svg.replace(/{{BLESSING}}/g, blessing);
    svg = svg.replace(/{{TOKEN_ID}}/g, tokenId.toString());
    return svg;
}
export function getRarityName(rarity) {
    return RARITY_NAMES[rarity];
}
export function getRarityByName(name) {
    const entries = Object.entries(RARITY_NAMES);
    const found = entries.find(([_, v]) => v === name);
    return found ? parseInt(found[0]) : 0;
}
