import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  CyberFortuneNFT,
  NFT,
  Listing,
  Transaction,
} from "../generated/CyberFortuneNFT/CyberFortuneNFT";

function getTimestamp(block: ethereum.Block): BigInt {
  return block.timestamp;
}

function getBlockNumber(block: ethereum.Block): BigInt {
  return block.number;
}

export function handleTransfer(event: ethereum.Event): void {
  let nft = NFT.load(event.params.tokenId.toString());
  let contract = CyberFortuneNFT.bind(event.address);

  if (nft == null) {
    // New mint
    nft = new NFT(event.params.tokenId.toString());
    nft.tokenId = event.params.tokenId;
    nft.mintedAt = event.block.timestamp;

    // Get blessing and rarity from contract
    let blessingResult = contract.try_getBlessing(event.params.tokenId);
    nft.blessing = blessingResult.reverted ? "" : blessingResult.value;

    let rarityResult = contract.try_getRarity(event.params.tokenId);
    nft.rarity = rarityResult.reverted ? 0 : rarityResult.value.toI32();
  }

  nft.owner = event.params.to;
  nft.save();
}

export function handleItemListed(event: ethereum.Event): void {
  let tokenId = event.params.tokenId;
  let seller = event.params.seller;
  let price = event.params.price;

  // Get or create NFT entity
  let nft = NFT.load(tokenId.toString());
  if (nft == null) {
    nft = new NFT(tokenId.toString());
    nft.tokenId = tokenId;
    nft.mintedAt = event.block.timestamp;
    nft.blessing = "";
    nft.rarity = 0;
  }

  // Get current owner
  let contract = CyberFortuneNFT.bind(event.address);
  let ownerResult = contract.try_ownerOf(tokenId);
  nft.owner = ownerResult.reverted ? Bytes.empty() : ownerResult.value;
  nft.save();

  // Create or update listing
  let listing = Listing.load(tokenId.toString());
  if (listing == null) {
    listing = new Listing(tokenId.toString());
    listing.nft = nft.id;
  }

  listing.seller = seller;
  listing.price = price;
  listing.isActive = true;
  listing.listedAt = event.block.timestamp;
  listing.save();

  // Create transaction record
  let tx = new Transaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.nft = nft.id;
  tx.eventType = "listed";
  tx.from = seller;
  tx.to = null;
  tx.price = price;
  tx.timestamp = event.block.timestamp;
  tx.blockNumber = event.block.number;
  tx.save();
}

export function handleItemBought(event: ethereum.Event): void {
  let tokenId = event.params.tokenId;
  let buyer = event.params.buyer;
  let price = event.params.price;

  // Update listing
  let listing = Listing.load(tokenId.toString());
  if (listing != null) {
    listing.isActive = false;
    listing.save();
  }

  // Update NFT owner
  let nft = NFT.load(tokenId.toString());
  if (nft != null) {
    nft.owner = buyer;
    nft.save();

    // Create transaction record
    let tx = new Transaction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    );
    tx.nft = nft.id;
    tx.eventType = "bought";
    tx.from = listing != null ? listing.seller : null;
    tx.to = buyer;
    tx.price = price;
    tx.timestamp = event.block.timestamp;
    tx.blockNumber = event.block.number;
    tx.save();
  }
}

export function handleListingCancelled(event: ethereum.Event): void {
  let tokenId = event.params.tokenId;

  // Update listing
  let listing = Listing.load(tokenId.toString());
  if (listing != null) {
    listing.isActive = false;
    listing.save();

    // Create transaction record
    let tx = new Transaction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    );
    tx.nft = listing.nft;
    tx.eventType = "cancelled";
    tx.from = listing.seller;
    tx.to = null;
    tx.price = null;
    tx.timestamp = event.block.timestamp;
    tx.blockNumber = event.block.number;
    tx.save();
  }
}
