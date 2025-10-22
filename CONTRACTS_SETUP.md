# Quick Setup Guide - Artistic Splash Smart Contracts

## 📦 Installation

```bash
# Install dependencies
npm install

# Install OpenZeppelin contracts specifically
npm install @openzeppelin/contracts@^5.0.2

# Verify installation
npx hardhat compile
```

## 🔧 Configuration

### 1. Create `.env` file

```bash
# Copy the example (if provided) or create new
touch .env
```

Add to `.env`:
```env
PRIVATE_KEY=your_64_char_hex_private_key_without_0x_prefix
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_api_key_for_contract_verification
```

### 2. Get Test AVAX

Visit [Avalanche Fuji Faucet](https://faucet.avax.network/) to get test AVAX for deployment.

## 🚀 Quick Start

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Generate TypeScript Types

```bash
npm run typechain
```

### Deploy to Fuji Testnet

```bash
npm run deploy:fuji
```

## 📁 Project Structure

```
contracts/
├── ArtisticSplashNFT.sol         # ERC-721 NFT contract
├── ArtisticSplashMarketplace.sol # Marketplace contract
└── README.md                      # Full documentation

scripts/
└── deploy.ts                      # Deployment script

test/
└── ArtisticSplash.test.ts        # Comprehensive tests

typechain-types/                   # Generated TypeScript types
├── factories/
└── index.ts

deployments/                       # Deployment records (gitignored)
└── deployment-*.json
```

## 🎯 Common Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Deploy to Fuji testnet
npx hardhat run scripts/deploy.ts --network fuji

# Deploy to local network
npx hardhat node                           # Terminal 1
npx hardhat run scripts/deploy.ts --network localhost  # Terminal 2

# Verify contract on Snowtrace
npx hardhat verify --network fuji <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Clean and recompile
npx hardhat clean
npx hardhat compile

# Generate TypeChain types
npx hardhat typechain
```

## 🔗 Important Links

- **Fuji Explorer**: https://testnet.snowtrace.io
- **Fuji Faucet**: https://faucet.avax.network/
- **Full Documentation**: See `contracts/README.md`
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/contracts

## ⚡ Quick Test Workflow

```bash
# 1. Install and compile
npm install && npm run compile

# 2. Run tests
npm test

# 3. Deploy to Fuji
npm run deploy:fuji

# 4. Verify contracts (use addresses from deployment output)
npx hardhat verify --network fuji <NFT_ADDRESS> "<ADMIN>" "<ROYALTY_RECEIVER>" <ROYALTY_BPS>
npx hardhat verify --network fuji <MARKETPLACE_ADDRESS> <PLATFORM_FEE_BPS> "<FEE_RECIPIENT>"
```

## 🐛 Troubleshooting

### "Cannot find module '@openzeppelin/contracts'"

```bash
npm install @openzeppelin/contracts
```

### "Invalid private key"

- Ensure your private key is 64 hex characters
- Don't include the `0x` prefix in the .env file
- Check for extra spaces or newlines

### "Insufficient funds"

- Get test AVAX from the Fuji faucet
- Check your balance: https://testnet.snowtrace.io/address/<YOUR_ADDRESS>

### "Network not configured"

- Verify your `.env` file exists and is in the root directory
- Check that `FUJI_RPC_URL` is set correctly
- Try: `npx hardhat run scripts/deploy.ts --network fuji --verbose`

### Compilation errors

```bash
# Clean and rebuild
npx hardhat clean
rm -rf cache artifacts typechain-types
npm run compile
```

## 📝 Next Steps

1. ✅ Complete setup and deploy contracts
2. ✅ Verify contracts on Snowtrace
3. 🔄 Integrate contracts with frontend
4. 🔄 Test full mint → list → buy flow
5. 🔄 Add IPFS integration for metadata
6. 🔄 Deploy to mainnet (after audit)

---

For detailed documentation, see `contracts/README.md`

