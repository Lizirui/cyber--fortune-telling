import { ethers } from 'ethers';
export declare const nftContract: ethers.Contract;
export declare function getNFTInfo(tokenId: number): Promise<{
    owner: any;
    blessing: any;
    rarity: number;
}>;
