export interface SignatureData {
    blessing: string;
    rarity: number;
    expiresAt: number;
    nonce: number;
    userAddress: string;
}
export declare function generateSignature(blessing: string, rarity: number, expiresAt: number, nonce: number, userAddress: string): Promise<string>;
export declare function getSignerAddress(): string;
