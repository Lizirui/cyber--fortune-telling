# Smart Contract Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy an ERC-721 NFT contract on Base with mint functionality, signature verification, marketplace, and ERC-2981 royalty support.

**Architecture:** Single smart contract `CyberFortuneNFT.sol` implementing ERC-721, ERC-2981, and marketplace functionality. Uses OpenZeppelin contracts for security.

**Tech Stack:** Solidity, Hardhat, OpenZeppelin, ethers.js

---

## File Structure

```
contracts/
├── CyberFortuneNFT.sol    # Main NFT contract
└── interfaces/
    └── IVerifier.sol       # Signature verifier interface

test/
└── CyberFortuneNFT.js    # Contract tests

scripts/
├── deploy.js             # Deploy script
└── verify.js             # Verification script
```

---

## Chunk 1: Project Setup & Basic NFT Contract

### Task 1: Initialize Hardhat Project

**Files:**
- Create: `package.json`
- Create: `hardhat.config.js`
- Create: `.env.example`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "cyber-fortune-nft",
  "version": "1.0.0",
  "description": "Cyber Fortune NFT Contract",
  "main": "index.js",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.js --network",
    "deploy:base-sepolia": "hardhat run scripts/deploy.js --network base-sepolia",
    "deploy:base": "hardhat run scripts/deploy.js --network base"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts": "^5.0.0",
    "dotenv": "^16.3.1",
    "hardhat": "^2.19.0"
  },
  "dependencies": {
    "ethers": "^6.10.0"
  }
}
```

- [ ] **Step 2: Create hardhat.config.js**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532
    },
    "base": {
      url: process.env.BASE_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453
    }
  },
  etherscan: {
    "base-sepolia": {
      apiKey: {
        base: process.env.BASESCAN_API_KEY || ""
      }
    },
    "base": {
      apiKey: {
        base: process.env.BASESCAN_API_KEY || ""
      }
    }
  }
};
```

- [ ] **Step 3: Create .env.example**

```
# RPC URLs
BASE_SEPOLIA_RPC_URL=
BASE_RPC_URL=

# Deployer private key (without 0x prefix)
PRIVATE_KEY=

# Block explorer API key
BASESCAN_API_KEY=
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Commit**

```bash
git add package.json hardhat.config.js .env.example
git commit -m "chore: add Hardhat project setup"
```

---

### Task 2: Write Basic NFT Contract Tests

**Files:**
- Create: `test/CyberFortuneNFT.js`

- [ ] **Step 1: Write failing test for basic NFT**

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberFortuneNFT", function () {
  let owner, user1, user2;
  let nft;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("CyberFortuneNFT");
    nft = await NFT.deploy("Cyber Fortune", "CFORTUNE");
    await nft.waitForDeployment();
  });

  describe("Basic NFT", function () {
    it("should deploy with correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Cyber Fortune");
      expect(await nft.symbol()).to.equal("CFORTUNE");
    });

    it("should mint NFT and assign to caller", async function () {
      // This test will fail because mint doesn't exist yet
      await nft.mint("test blessing", 1);
      expect(await nft.ownerOf(1)).to.equal(owner.address);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```
Expected: FAIL - "nft.mint is not a function"

- [ ] **Step 3: Commit**

```bash
git add test/CyberFortuneNFT.js
git commit -m "test: add failing NFT tests"
```

---

### Task 3: Implement Basic NFT Contract

**Files:**
- Create: `contracts/CyberFortuneNFT.sol`

- [ ] **Step 1: Write basic NFT contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_FEE = 0.01 ether;

    // Mapping from token ID to blessing text
    mapping(uint256 => string) public blessings;

    // Mapping from token ID to rarity (0=N, 1=R, 2=SR, 3=SSR, 4=SP, 5=UR)
    mapping(uint256 => uint8) public rarities;

    constructor() ERC721("Cyber Fortune", "CFORTUNE") Ownable(msg.sender) {}

    function mint(string calldata blessing, uint8 rarity) external payable {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;

        // Set token URI (will be updated later with full metadata)
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        // Basic URI - will be enhanced in later tasks
        return string(abi.encodePacked("data:application/json,",
            '{"name":"Fortune #', Strings.toString(tokenId), '"}'));
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm run test
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add contracts/CyberFortuneNFT.sol
git commit -m "feat: add basic NFT contract with mint"
```

---

## Chunk 2: Signature Verification & Mint Limits

### Task 4: Add Signature Verification Tests

**Files:**
- Modify: `test/CyberFortuneNFT.js`

- [ ] **Step 1: Add failing signature test**

```javascript
it("should verify signature and prevent tampering", async function () {
  const blessing = "test blessing";
  const rarity = 3;
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;

  // Create mock signature (will fail until we implement)
  const signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  // This should fail because the function doesn't exist yet
  await nft.mintWithSignature(blessing, rarity, expiresAt, signature);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```
Expected: FAIL

- [ ] **Step 3: Commit**

```bash
git commit -m "test: add signature verification tests"
```

---

### Task 5: Implement Signature Verification

**Files:**
- Modify: `contracts/CyberFortuneNFT.sol`

- [ ] **Step 1: Add signature verification logic**

```solidity
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, Ownable, EIP712("CyberFortuneNFT", "1") {
    using ECDSA for bytes32;

    // Authorized signer address (backend wallet)
    address public authorizedSigner;

    // Used signatures tracking (nonce)
    mapping(bytes => bool) public usedSignatures;

    // Daily mint tracking per wallet
    mapping(address => uint256) public dailyMintedCount;
    mapping(address => uint256) public lastMintDay;
    uint256 public constant MAX_DAILY_MINT = 10;
    uint256 public constant MAX_MINT_PER_TX = 5;

    event SignatureVerified(address minter, string blessing, uint8 rarity);

    function setAuthorizedSigner(address _signer) external onlyOwner {
        authorizedSigner = _signer;
    }

    function mintWithSignature(
        string calldata blessing,
        uint8 rarity,
        uint256 expiresAt,
        bytes calldata signature
    ) external payable {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(block.timestamp < expiresAt, "Signature expired");
        require(rarity <= 5, "Invalid rarity");

        // Verify signature
        bytes32 hash = keccak256(abi.encodePacked(blessing, rarity, expiresAt, _nextTokenId, msg.sender));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();

        require(ethSignedHash.recover(signature) == authorizedSigner, "Invalid signature");
        require(!usedSignatures[signature], "Signature already used");

        // Mark signature as used
        usedSignatures[signature] = true;

        // Check daily mint limit
        _checkMintLimit();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        blessings[tokenId] = blessing;
        rarities[tokenId] = rarity;

        _setTokenURI(tokenId, _generateTokenURI(tokenId));

        emit SignatureVerified(msg.sender, blessing, rarity);
    }

    function _checkMintLimit() internal {
        uint256 today = block.timestamp / 86400;

        if (lastMintDay[msg.sender] != today) {
            dailyMintedCount[msg.sender] = 0;
            lastMintDay[msg.sender] = today;
        }

        require(dailyMintedCount[msg.sender] < MAX_DAILY_MINT, "Daily mint limit reached");
        dailyMintedCount[msg.sender]++;
    }
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm run test
```

- [ ] **Step 3: Commit**

```bash
git add contracts/CyberFortuneNFT.sol
git commit -m "feat: add signature verification and mint limits"
```

---

## Chunk 3: Marketplace Functionality

### Task 6: Add Marketplace Tests

**Files:**
- Modify: `test/CyberFortuneNFT.js`

- [ ] **Step 1: Add failing marketplace tests**

```javascript
describe("Marketplace", function () {
  it("should list an item for sale", async function () {
    // Mint first
    await nft.mint("test blessing", 1);
    await nft.approve(nft.target, 1);
    await nft.listItem(1, ethers.parseEther("0.1"));

    const listing = await nft.getListing(1);
    expect(listing[0]).to.equal(owner.address); // seller
    expect(listing[1]).to.equal(ethers.parseEther("0.1")); // price
  });

  it("should allow buying an item", async function () {
    await nft.mint("test blessing", 1);
    await nft.approve(nft.target, 1);
    await nft.listItem(1, ethers.parseEther("0.1"));

    await nft.connect(user1).buyItem(1, { value: ethers.parseEther("0.1") });
    expect(await nft.ownerOf(1)).to.equal(user1.address);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test
```
Expected: FAIL

- [ ] **Step 3: Commit**

```bash
git commit -m "test: add marketplace tests"
```

---

### Task 7: Implement Marketplace

**Files:**
- Modify: `contracts/CyberFortuneNFT.sol`

- [ ] **Step 1: Add marketplace functionality**

```solidity
// Add to contract
struct Listing {
    address seller;
    uint256 price;
    bool isListed;
}

mapping(uint256 => Listing) public listings;
mapping(address => uint256) public creatorRevenue;

event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
event ItemBought(uint256 indexed tokenId, address indexed buyer, uint256 price);
event ListingCancelled(uint256 indexed tokenId);

function listItem(uint256 tokenId, uint256 price) external {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    require(price > 0, "Price must be greater than 0");

    approve(address(this), tokenId);
    listings[tokenId] = Listing({
        seller: msg.sender,
        price: price,
        isListed: true
    });

    emit ItemListed(tokenId, msg.sender, price);
}

function buyItem(uint256 tokenId) external payable {
    Listing memory listing = listings[tokenId];
    require(listing.isListed, "Item not listed");
    require(msg.value >= listing.price, "Insufficient payment");

    // Transfer NFT
    _transfer(listing.seller, msg.sender, tokenId);

    // Calculate royalty (5%) and creator share
    uint256 royalty = (listing.price * 5) / 100;
    uint256 sellerAmount = listing.price - royalty;

    // Transfer to seller
    payable(listing.seller).transfer(sellerAmount);

    // Track creator revenue
    creatorRevenue[owner()] += royalty;

    // Clear listing
    delete listings[tokenId];

    emit ItemBought(tokenId, msg.sender, listing.price);
}

function cancelListing(uint256 tokenId) external {
    require(listings[tokenId].seller == msg.sender, "Not the seller");
    require(listings[tokenId].isListed, "Not listed");

    delete listings[tokenId];
    emit ListingCancelled(tokenId);
}

function getListing(uint256 tokenId) external view returns (address, uint256, bool) {
    Listing memory l = listings[tokenId];
    return (l.seller, l.price, l.isListed);
}

function withdrawCreatorRevenue() external onlyOwner {
    uint256 amount = creatorRevenue[owner()];
    require(amount > 0, "No revenue to withdraw");
    creatorRevenue[owner()] = 0;
    payable(owner()).transfer(amount);
}

// Update tokenURI to include rarity
function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
    string memory rarityStr;
    uint8 rarity = rarities[tokenId];
    if (rarity == 0) rarityStr = "N";
    else if (rarity == 1) rarityStr = "R";
    else if (rarity == 2) rarityStr = "SR";
    else if (rarity == 3) rarityStr = "SSR";
    else if (rarity == 4) rarityStr = "SP";
    else rarityStr = "UR";

    return string(abi.encodePacked(
        "data:application/json,",
        '{"name":"Cyber Fortune #', Strings.toString(tokenId), '",',
        '"description":"', blessings[tokenId], '",',
        '"attributes":[{"trait_type":"Rarity","value":"', rarityStr, '"}],',
        '"rarity":', Strings.toString(rarity), '}'
    ));
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm run test
```

- [ ] **Step 3: Commit**

```bash
git add contracts/CyberFortuneNFT.sol
git commit -m "feat: add marketplace functionality"
```

---

## Chunk 4: ERC-2981 Royalty & Final Tests

### Task 8: Add ERC-2981 Royalty Standard

**Files:**
- Modify: `contracts/CyberFortuneNFT.sol`

- [ ] **Step 1: Add ERC-2981 implementation**

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract CyberFortuneNFT is ERC721, ERC721URIStorage, ERC2981, Ownable, EIP712("CyberFortuneNFT", "1") {
    // Add to constructor
    constructor() ERC721("Cyber Fortune", "CFORTUNE") Ownable(msg.sender) {
        _setDefaultRoyalty(owner(), 500); // 5% royalty
    }

    // Override supportsInterface
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

- [ ] **Step 2: Add royalty test**

```javascript
it("should support ERC-2981 royalty standard", async function () {
  const interfaceId = "0x2a55205a"; // ERC-2981
  expect(await nft.supportsInterface(interfaceId)).to.equal(true);

  const royaltyInfo = await nft.royaltyInfo(1, ethers.parseEther("1"));
  expect(royaltyInfo[0]).to.equal(owner.address);
  expect(royaltyInfo[1]).to.equal(ethers.parseEther("0.05")); // 5%
});
```

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add contracts/CyberFortuneNFT.sol test/CyberFortuneNFT.js
git commit -m "feat: add ERC-2981 royalty support"
```

---

## Chunk 5: Deployment Scripts

### Task 9: Create Deployment Script

**Files:**
- Create: `scripts/deploy.js`

- [ ] **Step 1: Write deployment script**

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying CyberFortuneNFT...");

  const NFT = await hre.ethers.getContractFactory("CyberFortuneNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("CyberFortuneNFT deployed to:", address);

  // Set the authorized signer (from env)
  if (process.env.AUTHORIZED_SIGNER) {
    console.log("Setting authorized signer...");
    const tx = await nft.setAuthorizedSigner(process.env.AUTHORIZED_SIGNER);
    await tx.wait();
    console.log("Authorized signer set to:", process.env.AUTHORIZED_SIGNER);
  }

  // Verify on Blockscout
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: []
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

- [ ] **Step 2: Update .env.example with AUTHORIZED_SIGNER**

```
AUTHORIZED_SIGNER=0x...
```

- [ ] **Step 3: Commit**

```bash
git add scripts/deploy.js .env.example
git commit -m "chore: add deployment script"
```

---

## Chunk 6: Final Contract Cleanup & Review

### Task 10: Final Contract Review

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

- [ ] **Step 2: Compile with optimization**

Add to hardhat.config.js:
```javascript
solidity: {
  version: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete CyberFortuneNFT smart contract"
```

---

## Summary

This plan delivers:
- ✅ ERC-721 NFT contract with mint functionality
- ✅ Signature verification to prevent tampering
- ✅ Mint limits (max 10/day, 5 per tx)
- ✅ On-chain marketplace (list, buy, cancel)
- ✅ ERC-2981 royalty support (5%)
- ✅ Basic tokenURI with rarity attributes
- ✅ Deployment scripts for Base

**Next Steps:**
- Deploy to Base Sepolia testnet for testing
- Deploy to Base mainnet
- Move to Phase 2: Backend implementation
