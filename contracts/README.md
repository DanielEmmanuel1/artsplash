# Artistic Splash Smart Contracts

Production-ready Solidity contracts for the Artistic Splash NFT marketplace on Avalanche C-Chain.

## 📋 Table of Contents

- [Overview](#overview)
- [Contracts](#contracts)
- [Setup](#setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security](#security)
- [Integration](#integration)
- [References](#references)

## 🎯 Overview

Artistic Splash is a decentralized NFT marketplace that enables creators to mint, list, and sell NFTs on the Avalanche blockchain. The system consists of two main contracts:

1. **ArtisticSplashNFT**: ERC-721 NFT contract with royalty support (ERC-2981)
2. **ArtisticSplashMarketplace**: Decentralized marketplace for buying and selling NFTs

### Key Features

- ✅ ERC-721 compliant NFT minting with metadata URIs
- ✅ ERC-2981 royalty standard support
- ✅ Role-based access control (Admin, Minter)
- ✅ Decentralized marketplace with escrow
- ✅ Automatic royalty distribution
- ✅ Platform fees with configurable recipient
- ✅ Pull payment pattern for security
- ✅ Reentrancy protection
- ✅ Batch minting support
- ✅ Gas-optimized with OpenZeppelin libraries

## 📜 Contracts

### ArtisticSplashNFT

ERC-721 NFT contract with extended functionality.

#### Constructor Parameters

```solidity
constructor(
    address admin,          // Admin address (has full control)
    address royaltyReceiver, // Address receiving royalty payments
    uint96 royaltyBps       // Royalty in basis points (250 = 2.5%)
)
```

#### Public Functions

| Function | Access | Description |
|----------|--------|-------------|
| `safeMint(address to, string uri)` | MINTER_ROLE | Mints a single NFT with metadata URI |
| `batchMint(address to, string[] uris)` | MINTER_ROLE | Mints multiple NFTs in one transaction |
| `setDefaultRoyalty(address receiver, uint96 feeNumerator)` | ADMIN | Updates default royalty settings |
| `setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)` | ADMIN | Sets royalty for specific token |
| `setBaseURI(string baseURI)` | ADMIN | Sets base URI for all tokens |
| `burn(uint256 tokenId)` | TOKEN_OWNER | Burns a token (owner only) |
| `totalSupply()` | PUBLIC | Returns total minted tokens |
| `royaltyInfo(uint256 tokenId, uint256 salePrice)` | PUBLIC | Returns royalty info (ERC-2981) |

#### Events

```solidity
event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
event BaseURIUpdated(string baseURI);
```

#### Roles

- **DEFAULT_ADMIN_ROLE**: Can grant/revoke roles, update royalties, set base URI
- **MINTER_ROLE**: Can mint new NFTs

### ArtisticSplashMarketplace

Decentralized marketplace for trading NFTs with automatic royalty distribution.

#### Constructor Parameters

```solidity
constructor(
    uint256 platformFeeBps,  // Platform fee in basis points (250 = 2.5%)
    address feeRecipient     // Address receiving platform fees
)
```

#### Public Functions

| Function | Access | Description |
|----------|--------|-------------|
| `listItem(address nft, uint256 tokenId, uint256 price)` | PUBLIC | Lists NFT for sale (transfers to escrow) |
| `cancelListing(address nft, uint256 tokenId)` | SELLER | Cancels listing and returns NFT |
| `buyItem(address nft, uint256 tokenId)` | PUBLIC | Buys listed NFT (handles royalties) |
| `withdrawProceeds()` | PUBLIC | Withdraws accumulated proceeds |
| `setPlatformFee(uint256 newFeeBps)` | OWNER | Updates platform fee (max 10%) |
| `setFeeRecipient(address newRecipient)` | OWNER | Updates fee recipient |
| `getListing(address nft, uint256 tokenId)` | PUBLIC | Returns listing details |
| `rescueToken(address nft, uint256 tokenId, address to)` | OWNER | Emergency token rescue (non-listed only) |

#### Events

```solidity
event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 price);
event Bought(address indexed nft, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price, uint256 royaltyAmount, uint256 platformFee);
event Cancelled(address indexed nft, uint256 indexed tokenId, address indexed seller);
event ProceedsWithdrawn(address indexed seller, uint256 amount);
event PlatformFeeUpdated(uint256 newFeeBps);
event FeeRecipientUpdated(address indexed newRecipient);
```

#### Payment Flow

When an NFT is purchased:
1. Buyer sends full price in AVAX
2. Marketplace calculates royalty (if ERC-2981 supported)
3. Marketplace calculates platform fee
4. Remaining amount goes to seller
5. All proceeds are held in contract (pull payment pattern)
6. Recipients withdraw their proceeds separately

**Example**: 1 AVAX sale with 2.5% royalty and 2.5% platform fee:
- Royalty: 0.025 AVAX
- Platform fee: 0.025 AVAX
- Seller: 0.95 AVAX

## 🚀 Setup

### Prerequisites

- Node.js v18+
- npm or yarn
- Avalanche wallet with AVAX (for Fuji testnet)

### Installation

```bash
# Install dependencies
npm install

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Compile contracts
npm run compile
```

### Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_snowtrace_api_key_for_verification
```

⚠️ **Security Warning**: Never commit your `.env` file or expose your private key!

## 📦 Deployment

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
npm run deploy:local
```

### Avalanche Fuji Testnet

```bash
# Deploy to Fuji testnet
npm run deploy:fuji
```

The deployment script will:
1. Deploy ArtisticSplashNFT contract
2. Deploy ArtisticSplashMarketplace contract
3. Configure roles and permissions
4. Save deployment addresses to `deployments/` directory
5. Display verification commands

### Manual Deployment

```bash
npx hardhat run scripts/deploy.ts --network fuji
```

### Contract Verification

After deployment, verify contracts on Snowtrace:

```bash
# Verify NFT contract
npx hardhat verify --network fuji <NFT_ADDRESS> "<ADMIN>" "<ROYALTY_RECEIVER>" <ROYALTY_BPS>

# Verify Marketplace contract
npx hardhat verify --network fuji <MARKETPLACE_ADDRESS> <PLATFORM_FEE_BPS> "<FEE_RECIPIENT>"
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npx hardhat test test/ArtisticSplash.test.ts
```

### Test Coverage

The test suite includes:

- **NFT Contract Tests**
  - Deployment and initialization
  - Minting (single and batch)
  - Royalty calculations
  - Access control
  - Token management (burning)
  - Edge cases and error handling

- **Marketplace Tests**
  - Listing NFTs
  - Canceling listings
  - Buying NFTs
  - Royalty distribution
  - Platform fee distribution
  - Proceeds withdrawal
  - Fee management
  - Access control

- **Integration Tests**
  - Complete marketplace flow
  - Multiple listings and sales
  - Complex scenarios

### Gas Report

Enable gas reporting in `hardhat.config.ts`:

```typescript
gasReporter: {
  enabled: true,
  currency: "USD",
  coinmarketcap: process.env.COINMARKETCAP_API_KEY,
}
```

## 🔒 Security

### Security Features

✅ **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
✅ **Access Control**: Role-based permissions using OpenZeppelin AccessControl
✅ **Pull Payment Pattern**: Safer than direct transfers, prevents reentrancy
✅ **Checks-Effects-Interactions**: CEI pattern followed throughout
✅ **Input Validation**: All inputs validated (addresses, amounts, permissions)
✅ **Safe Math**: Solidity 0.8+ built-in overflow protection
✅ **Audited Libraries**: Using OpenZeppelin contracts (industry standard)
✅ **Emergency Functions**: Owner can rescue stuck tokens (non-listed only)

### Security Checklist

- [x] Enable Solidity optimizer (200 runs)
- [x] Use OpenZeppelin audited contracts
- [x] Implement reentrancy guards
- [x] Follow CEI pattern
- [x] Use pull payment pattern
- [x] Validate all inputs
- [x] Limit privileged roles
- [x] Use safe transfer methods
- [x] Add comprehensive tests
- [ ] Run Slither static analysis
- [ ] Get professional audit (recommended for mainnet)
- [ ] Implement emergency pause (optional enhancement)
- [ ] Add timelock for admin functions (optional enhancement)

### Running Security Analysis

```bash
# Install Slither
pip3 install slither-analyzer

# Run analysis
slither contracts/
```

### Known Considerations

1. **Platform Fee**: Limited to 10% maximum to prevent abuse
2. **Royalty Cap**: No built-in royalty cap (rely on ERC-2981 implementation)
3. **Marketplace Escrow**: NFTs are held in marketplace contract during listing
4. **Gas Costs**: Batch minting optimized but still has per-token cost
5. **Metadata Storage**: URIs are on-chain, actual metadata should be on IPFS/Arweave

## 🔗 Integration

### TypeChain Integration

Generate TypeScript types for your contracts:

```bash
npm run typechain
```

This creates type-safe contract interfaces in `typechain-types/` directory.

### Frontend Integration

#### Example: Using in Next.js/React

```typescript
import { ethers } from 'ethers';
import { ArtisticSplashNFT__factory, ArtisticSplashMarketplace__factory } from '../typechain-types';

// Connect to contracts
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const nftAddress = "0x..."; // From deployment
const marketplaceAddress = "0x..."; // From deployment

const nft = ArtisticSplashNFT__factory.connect(nftAddress, signer);
const marketplace = ArtisticSplashMarketplace__factory.connect(marketplaceAddress, signer);

// Mint NFT
const tx = await nft.safeMint(
  await signer.getAddress(),
  "ipfs://QmYourMetadataHash"
);
await tx.wait();

// List NFT for sale
const tokenId = 1;
const price = ethers.parseEther("1.0");

await nft.approve(marketplaceAddress, tokenId);
await marketplace.listItem(nftAddress, tokenId, price);

// Buy NFT
await marketplace.buyItem(nftAddress, tokenId, { value: price });

// Withdraw proceeds
await marketplace.withdrawProceeds();
```

#### Example: Reading Contract Data

```typescript
// Get total supply
const totalSupply = await nft.totalSupply();

// Get listing info
const listing = await marketplace.getListing(nftAddress, tokenId);
console.log("Seller:", listing.seller);
console.log("Price:", ethers.formatEther(listing.price), "AVAX");

// Get royalty info
const [receiver, royaltyAmount] = await nft.royaltyInfo(
  tokenId,
  ethers.parseEther("1.0")
);
console.log("Royalty:", ethers.formatEther(royaltyAmount), "AVAX");

// Get user proceeds
const proceeds = await marketplace.proceeds(userAddress);
console.log("Proceeds:", ethers.formatEther(proceeds), "AVAX");
```

### Contract ABIs

After compilation, ABIs are available in:
- `artifacts/contracts/ArtisticSplashNFT.sol/ArtisticSplashNFT.json`
- `artifacts/contracts/ArtisticSplashMarketplace.sol/ArtisticSplashMarketplace.json`

## 🎯 Recommended Enhancements

### Short-term

1. **Auction System**: Add timed auctions with bid management
2. **Offer System**: Allow buyers to make offers below listing price
3. **Metadata Pinning**: Integrate with IPFS/Pinata for metadata storage
4. **Batch Operations**: Add batch listing and batch buying
5. **Events Indexing**: Add subgraph for event indexing

### Medium-term

1. **Dynamic Royalties**: Per-token royalty settings
2. **Marketplace Fees**: Tiered fees based on volume
3. **Admin Fee Split**: Multi-recipient fee distribution
4. **Featured Listings**: Paid promotion system
5. **Collection Verification**: Verified creator badge system

### Long-term

1. **Multi-chain Support**: Deploy to multiple EVM chains
2. **Lazy Minting**: Mint on first sale to save gas
3. **Fractionalization**: Split NFT ownership
4. **Rental System**: Rent NFTs (ERC-4907)
5. **Governance**: DAO for platform parameters

## 📚 References

### OpenZeppelin Documentation

- **ERC-721**: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721
- **ERC-721 URIStorage**: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage
- **ERC-2981 Royalties**: https://docs.openzeppelin.com/contracts/4.x/api/token/common#ERC2981
- **Access Control**: https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl
- **Reentrancy Guard**: https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard
- **Ownable**: https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable

### Avalanche Documentation

- **C-Chain Overview**: https://docs.avax.network/learn/avalanche/avalanche-platform
- **Deploy Smart Contracts**: https://docs.avax.network/build/dapp/smart-contracts/deploy-a-smart-contract
- **Fuji Testnet**: https://docs.avax.network/build/dapp/testnet-workflow
- **Fuji RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **Mainnet RPC**: https://api.avax.network/ext/bc/C/rpc
- **Snowtrace (Explorer)**: https://snowtrace.io (Mainnet), https://testnet.snowtrace.io (Fuji)

### ERC Standards

- **ERC-721**: https://eips.ethereum.org/EIPS/eip-721
- **ERC-2981**: https://eips.ethereum.org/EIPS/eip-2981
- **ERC-165**: https://eips.ethereum.org/EIPS/eip-165

### Development Tools

- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org/v6/
- **TypeChain**: https://github.com/dethcrypto/TypeChain

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## ⚠️ Disclaimer

These contracts are provided as-is for educational and development purposes. While they follow best practices and include security measures, they have not been professionally audited. **Do not use in production without a thorough security audit.**

For production deployment:
1. Get a professional smart contract audit
2. Implement additional monitoring and emergency procedures
3. Consider insurance options
4. Have an incident response plan
5. Gradual rollout with limited funds initially

---

**Built with ❤️ for the Avalanche ecosystem**

