export const NFT_ABI = [
  // ERC721
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  // Mint
  "function mint(string blessing, uint8 rarity, uint256 expiresAt, uint256 nonce, bytes signature) payable",
  // Marketplace
  "function listItem(uint256 tokenId, uint256 price) payable",
  "function buyItem(uint256 tokenId) payable",
  "function cancelListing(uint256 tokenId)",
  "function getListing(uint256 tokenId) view returns (address seller, uint256 price, bool isListed)",
  // Views
  "function totalSupply() view returns (uint256)",
  "function getBlessing(uint256 tokenId) view returns (string)",
  "function getRarity(uint256 tokenId) view returns (uint8)",
] as const;

export const NFT_ABI_MARKETPLACE = [
  "event ItemListed(address indexed seller, uint256 indexed tokenId, uint256 price)",
  "event ItemBought(address indexed buyer, uint256 indexed tokenId, uint256 price)",
  "event ItemCanceled(address indexed seller, uint256 indexed tokenId)",
] as const;
