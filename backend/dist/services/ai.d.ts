type Rarity = 0 | 1 | 2 | 3 | 4 | 5;
export declare function generateBlessing(): Promise<{
    blessing: string;
    rarity: Rarity;
}>;
export {};
