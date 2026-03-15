import fs from 'fs';
import path from 'path';

type Rarity = 0 | 1 | 2 | 3 | 4 | 5;

const RARITY_NAMES: Record<Rarity, string> = {
  0: 'N',
  1: 'R',
  2: 'SR',
  3: 'SSR',
  4: 'SP',
  5: 'UR'
};

const RARITY_FILES: Record<Rarity, string> = {
  0: 'n.svg',
  1: 'r.svg',
  2: 'sr.svg',
  3: 'ssr.svg',
  4: 'sp.svg',
  5: 'ur.svg'
};

function getTemplatesDir(): string {
  // 获取 templates 目录（相对于 src/lib）
  return path.join(process.cwd(), 'src', 'templates');
}

export function generateSVG(blessing: string, tokenId: number, rarity: Rarity): string {
  const templatePath = path.join(getTemplatesDir(), RARITY_FILES[rarity]);
  let svg = fs.readFileSync(templatePath, 'utf-8');

  // 替换占位符
  svg = svg.replace(/{{BLESSING}}/g, blessing);
  svg = svg.replace(/{{TOKEN_ID}}/g, tokenId.toString());

  return svg;
}

export function getRarityName(rarity: Rarity): string {
  return RARITY_NAMES[rarity];
}
