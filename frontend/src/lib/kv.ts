import { kv } from '@vercel/kv';

export interface StoredBlessing {
  blessing: string;
  rarity: number;
}

const BLESSING_PREFIX = 'blessing:';

export async function saveBlessing(tokenId: number, data: StoredBlessing): Promise<void> {
  await kv.set(`${BLESSING_PREFIX}${tokenId}`, JSON.stringify(data));
}

export async function getBlessing(tokenId: number): Promise<StoredBlessing | null> {
  const result = await kv.get<string>(`${BLESSING_PREFIX}${tokenId}`);
  if (!result) return null;
  return JSON.parse(result) as StoredBlessing;
}
