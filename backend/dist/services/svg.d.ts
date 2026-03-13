type Rarity = 0 | 1 | 2 | 3 | 4 | 5;
export declare function generateSVG(blessing: string, tokenId: number, rarity: Rarity): string;
export declare function getRarityName(rarity: Rarity): string;
export declare function getRarityByName(name: string): Rarity;
export {};
