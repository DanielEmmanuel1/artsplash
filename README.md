# Artistic Splash NFT Marketplace - Technical Documentation

## Overview

Artistic Splash is a production-ready decentralized NFT marketplace built on the Avalanche blockchain. This document provides comprehensive technical information for developers, administrators, and contributors.

## Architecture

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: Zustand for global state
- **Animations**: Framer Motion
- **Wallet Integration**: Wagmi v2, Viem, Web3Modal

### Blockchain Stack
- **Network**: Avalanche C-Chain (Fuji Testnet/Mainnet)
- **Smart Contracts**: Solidity ^0.8.20
- **Libraries**: OpenZeppelin Contracts v5.4.0
- **Development**: Hardhat with TypeScript
- **Storage**: IPFS via Pinata

### Security Features
- **Access Control**: OpenZeppelin AccessControl
- **Reentrancy Protection**: ReentrancyGuard
- **Royalty Standard**: ERC-2981 compliance
- **Input Validation**: Comprehensive parameter checking

## Smart Contracts

### ArtisticSplashNFT.sol

**ERC-721 NFT Contract with Advanced Features**

#### Key Features
- ERC-721 compliance with URI storage
- ERC-2981 royalty standard support
- Role-based access control (DEFAULT_ADMIN_ROLE, MINTER_ROLE)
- Time-based minting limits for fair distribution
- Batch minting capabilities
- Configurable royalty rates

#### Core Functions

```solidity
// Public minting with time-based limits
function publicMint(string calldata uri) external payable returns (uint256)

// Admin-only unlimited minting
function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) returns (uint256)

// Batch minting for efficiency
function batchMint(address to, string[] memory uris) external onlyRole(MINTER_ROLE) returns (uint256[] memory)

// Role management
function grantRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE)
function revokeRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE)

// Configuration
function configurePublicMint(uint256 _mintFeeWei, uint256 _maxPerAddress, uint256 _maxSupply, uint256 _timeWindow, bool _paused) external onlyRole(DEFAULT_ADMIN_ROLE)
```

#### Minting Limits
- **Regular Users**: 2 NFTs per 2-hour window
- **Admin Users**: Unlimited minting via MINTER_ROLE
- **Time Window**: Configurable (default: 2 hours)
- **Automatic Reset**: Counter resets after time window expires

### ArtisticSplashMarketplace.sol

**Decentralized Marketplace Contract**

#### Key Features
- Secure NFT trading with escrow system
- Configurable platform fees
- Automatic royalty distribution
- Reentrancy attack protection
- Comprehensive event logging

#### Core Functions

```solidity
// Create marketplace listing
function listItem(address nft, uint256 tokenId, uint256 price) external

// Purchase listed NFT
function buyItem(address nft, uint256 tokenId) external payable

// Cancel listing
function cancelListing(address nft, uint256 tokenId) external

// Withdraw proceeds
function withdrawProceeds() external
```

#### Fee Structure
- **Platform Fee**: 2.5% (configurable)
- **Creator Royalty**: 2.5% (configurable)
- **Gas Fees**: Paid by transaction initiator
- **Transparent Pricing**: No hidden fees

## Admin Panel

### Role-Based Access Control

#### DEFAULT_ADMIN_ROLE
- **Capabilities**: Full platform control
- **Functions**: Grant/revoke roles, configure settings, emergency controls
- **Access**: Contract deployment and management
- **Security**: Can modify all contract parameters

#### MINTER_ROLE
- **Capabilities**: Unlimited NFT minting
- **Functions**: safeMint() access, bypass public limits
- **Access**: Admin-level minting privileges
- **Use Case**: Platform operators, verified creators

### Admin Functions

#### Role Management
```solidity
// Grant admin privileges
function grantRole(DEFAULT_ADMIN_ROLE, userAddress)

// Grant minter privileges  
function grantRole(MINTER_ROLE, userAddress)

// Revoke access
function revokeRole(role, userAddress)
```

#### Platform Configuration
- Set minting fees and limits
- Configure time windows
- Pause/unpause minting
- Update royalty rates
- Emergency controls

#### Contract Management
- Deploy new contract versions
- Update contract addresses
- Monitor platform health
- Handle emergency situations

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MetaMask or compatible wallet
- Avalanche wallet with test AVAX

### Installation

```bash
# Clone repository
git clone <repository-url>
cd artsplash

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

```env
# Wallet and RPC
PRIVATE_KEY=your_64_char_hex_private_key
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Contract Addresses (after deployment)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...

# IPFS Storage
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here

# Optional: WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Fuji testnet
npm run deploy:fuji

# Start frontend development server
cd frontend
npm run dev
```

## Deployment

### Contract Deployment

1. **Compile Contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to Fuji Testnet**
   ```bash
   npm run deploy:fuji
   ```

3. **Update Frontend Configuration**
   ```bash
   # Add contract addresses to frontend/.env.local
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...
   ```

4. **Restart Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

### Contract Verification

1. Visit [Snowtrace](https://testnet.snowtrace.io)
2. Navigate to your contract address
3. Click "Verify and Publish"
4. Upload contract source code
5. Complete verification process

### Deployment Parameters

```solidity
// NFT Contract Constructor
constructor(
    address admin,           // Contract administrator
    address royaltyReceiver, // Royalty payment address
    uint96 royaltyBps       // Royalty percentage (250 = 2.5%)
)

// Marketplace Contract Constructor  
constructor(
    uint256 platformFeeBps, // Platform fee percentage
    address feeRecipient     // Platform fee collection address
)
```

## Testing

### Test Categories

#### Unit Tests
- Contract function testing
- Access control verification
- Edge case handling
- Error scenario testing

#### Integration Tests
- End-to-end workflows
- Wallet integration
- IPFS storage
- Marketplace functionality

#### Security Tests
- Reentrancy attack prevention
- Access control bypass attempts
- Input validation
- Gas optimization

### Running Tests

```bash
# Contract tests
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

### Test Scenarios

#### Minting Tests
- Valid NFT creation
- Invalid input handling
- Rate limiting enforcement
- Admin vs user permissions

#### Marketplace Tests
- Successful purchases
- Failed transactions
- Royalty distribution
- Fee collection

#### Wallet Tests
- Connection flows
- Network switching
- Transaction signing
- Error handling

## Security Considerations

### Smart Contract Security
- **OpenZeppelin Audited**: Using battle-tested libraries
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: Secure transaction handling
- **Input Validation**: Comprehensive parameter checking
- **Event Logging**: Complete audit trail

### Frontend Security
- **No Private Keys**: Never store sensitive data
- **Environment Variables**: Secure configuration
- **Wallet Integration**: Standard provider APIs only
- **Error Handling**: Graceful failure management

### Operational Security
- **Role Management**: Principle of least privilege
- **Emergency Controls**: Pause functionality
- **Monitoring**: Transaction and event tracking
- **Backup Procedures**: Contract and data backups

## API Reference

### Contract Functions

#### NFT Contract
```solidity
// Public minting
function publicMint(string calldata uri) external payable returns (uint256)

// Admin minting
function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) returns (uint256)

// Role management
function grantRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE)
function hasRole(bytes32 role, address account) external view returns (bool)

// Configuration
function configurePublicMint(uint256 _mintFeeWei, uint256 _maxPerAddress, uint256 _maxSupply, uint256 _timeWindow, bool _paused) external onlyRole(DEFAULT_ADMIN_ROLE)
```

#### Marketplace Contract
```solidity
// Trading functions
function listItem(address nft, uint256 tokenId, uint256 price) external
function buyItem(address nft, uint256 tokenId) external payable
function cancelListing(address nft, uint256 tokenId) external

// Fee management
function setPlatformFee(uint256 _platformFeeBps) external onlyOwner
function withdrawProceeds() external
```

### Frontend Hooks

#### Wallet Integration
```typescript
// Wallet connection
const { connected, address, connect, disconnect } = useWallet()

// Admin status
const { isAdmin, isMinter } = useAdmin()

// Contract interaction
const { data, write, isLoading } = useWriteContract()
```

## Troubleshooting

### Common Issues

#### Contract Deployment
- **Gas Estimation Failed**: Check network connectivity
- **Insufficient Funds**: Ensure wallet has enough AVAX
- **Invalid Private Key**: Verify .env configuration

#### Frontend Issues
- **Wallet Not Connecting**: Check network configuration
- **Transaction Fails**: Verify gas limits and permissions
- **IPFS Upload Fails**: Check Pinata JWT configuration

#### Minting Issues
- **Rate Limit Exceeded**: Wait for time window reset
- **Insufficient Permissions**: Check MINTER_ROLE assignment
- **Invalid Metadata**: Verify IPFS hash format

### Debug Tools

#### Contract Interaction
```bash
# Check contract state
npx hardhat console --network fuji

# Verify roles
await nftContract.hasRole(ADMIN_ROLE, userAddress)
```

#### Frontend Debugging
- Browser console logs
- Network tab monitoring
- Wallet connection status
- Contract interaction logs

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive testing
- Documentation updates

### Security Guidelines
- Never commit private keys
- Use environment variables
- Test on testnet first
- Follow security best practices
- Report vulnerabilities responsibly

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support and questions:
- GitHub Issues: Report bugs and feature requests
- Documentation: Comprehensive guides and API reference
- Community: Join our developer community

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Network**: Avalanche Fuji Testnet / Mainnet
