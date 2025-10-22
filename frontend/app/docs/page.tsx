'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Book, Palette, Settings, Home } from 'lucide-react';

const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Home size={16} />,
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start' }
    ]
  },
  {
    id: 'features',
    title: 'Features',
    icon: <Book size={16} />,
    items: [
      { id: 'wallet-integration', title: 'Wallet Integration' },
      { id: 'nft-minting', title: 'NFT Minting' },
      { id: 'marketplace', title: 'Marketplace' }
    ]
  },
  {
    id: 'modes',
    title: 'Application Modes',
    icon: <Settings size={16} />,
    items: [
      { id: 'creator-mode', title: 'Creator Mode' },
      { id: 'developer-mode', title: 'Developer Mode' }
    ]
  }
];

const docContent = {
  introduction: {
    title: 'Introduction',
    content: `
Artistic Splash NFT Marketplace

Artistic Splash is a decentralized NFT marketplace built on the Avalanche blockchain, designed to empower creators and collectors with a seamless, secure, and user-friendly platform.

Quick Actions

• Mint NFT: Create and mint your digital artwork
• Explore NFTs: Discover unique digital art from creators
• Dashboard: Manage your NFT collection and view statistics
• Connect Wallet: Get started by connecting your crypto wallet

Key Features

• Decentralized Marketplace: Built on Avalanche C-Chain for fast, low-cost transactions
• Multi-Wallet Support: Compatible with MetaMask, Coinbase Wallet, and WalletConnect
• Creator Tools: Easy NFT minting with IPFS storage
• Time-Based Limits: Fair minting limits (2 NFTs per 2 hours for regular users)
• Dark Mode: Beautiful light and dark themes
• Developer Mode: Advanced tools for testing and debugging

Technology Stack

• Frontend: Next.js 16, React, TypeScript, Tailwind CSS
• Blockchain: Avalanche C-Chain (Fuji Testnet/Mainnet)
• Smart Contracts: Solidity, OpenZeppelin
• Storage: IPFS (Pinata)
• Wallet Integration: Wagmi, Viem, Web3Modal
    `
  },
  'quick-start': {
    title: 'Quick Start',
    content: `
Quick Start Guide

1. Connect Your Wallet

1. Click "Connect Wallet" in the top navigation
2. Select your preferred wallet (MetaMask, Coinbase, etc.)
3. Approve the connection and switch to Avalanche Fuji Testnet

2. Get Test AVAX

1. Visit Avalanche Faucet
2. Enter your wallet address
3. Request test AVAX for gas fees

3. Mint Your First NFT

1. Navigate to the "Mint" page
2. Upload an image (PNG/JPEG, max 10MB)
3. Add name and description
4. Click "Mint NFT"
5. Confirm the transaction in your wallet

4. View Your NFTs

1. Go to "Dashboard" to see your minted NFTs
2. View on-chain data and statistics
3. Manage your collection

User Types

• Regular Users: Can mint 2 NFTs per 2 hours
• Admin Users: Unlimited minting capabilities
    `
  },
  'wallet-integration': {
    title: 'Wallet Integration',
    content: `
Wallet Integration

Artistic Splash supports multiple wallet types for maximum compatibility.

Supported Wallets

MetaMask
• Most popular Ethereum wallet
• Automatic network switching to Avalanche
• Full feature support

Coinbase Wallet
• Built-in DApp browser support
• Easy account management
• Mobile and desktop support

WalletConnect
• QR code connection
• Mobile wallet support
• Cross-platform compatibility

Network Configuration

The app automatically configures Avalanche networks:

Fuji Testnet
• Chain ID: 43113
• RPC URL: https://api.avax-test.network/ext/bc/C/rpc
• Explorer: https://testnet.snowtrace.io
• Currency: AVAX

Mainnet
• Chain ID: 43114
• RPC URL: https://api.avax.network/ext/bc/C/rpc
• Explorer: https://snowtrace.io
• Currency: AVAX

Connection Flow

1. User clicks "Connect Wallet"
2. Wallet selection modal appears
3. User selects preferred wallet
4. Wallet prompts for connection approval
5. App requests network switch if needed
6. Connection established and user authenticated
    `
  },
  'nft-minting': {
    title: 'NFT Minting',
    content: `
NFT Minting

Create and mint unique digital assets on the Avalanche blockchain.

Minting Process

1. Image Upload
• Supported formats: PNG, JPEG
• Maximum size: 10MB
• Storage: IPFS via Pinata
• Validation: Automatic file type and size checking

2. Metadata Creation
• Name: Unique identifier for your NFT
• Description: Detailed information about the artwork
• Attributes: Custom properties (future feature)
• Standards: ERC-721 compliant

3. Blockchain Minting
• Contract: ArtisticSplashNFT.sol
• Function: publicMint() or safeMint() (admin)
• Gas: ~0.01 AVAX estimated cost
• Confirmation: Real-time transaction tracking

Minting Limits

Regular Users
• Limit: 2 NFTs per 2-hour window
• Reset: Automatic after 2 hours
• Function: publicMint()

Admin Users
• Limit: Unlimited
• Function: safeMint()
• Access: Role-based permissions

IPFS Integration

All NFT data is stored on IPFS for decentralization:

• Images: Direct IPFS storage
• Metadata: JSON files with IPFS links
• Permanence: Immutable and decentralized
• Access: HTTP gateways for easy viewing
    `
  },
  'marketplace': {
    title: 'Marketplace',
    content: `
Marketplace Features

Trade and discover NFTs in a decentralized marketplace.

Core Features

Listing NFTs
• Set custom prices in AVAX
• Automatic royalty handling (2.5%)
• Platform fee collection (2.5%)
• Secure escrow system

Buying NFTs
• Direct purchase with AVAX
• Automatic ownership transfer
• Royalty distribution
• Transaction history

Canceling Listings
• Remove listings anytime
• Automatic NFT return
• No fees for cancellation

Smart Contract Architecture

ArtisticSplashMarketplace.sol
• Security: ReentrancyGuard protection
• Fees: Configurable platform fees
• Royalties: ERC-2981 standard support
• Events: Comprehensive logging

Key Functions
• listItem(): Create marketplace listing
• buyItem(): Purchase listed NFT
• cancelListing(): Remove listing
• withdrawProceeds(): Collect earnings

Fee Structure

• Platform Fee: 2.5% (configurable)
• Creator Royalty: 2.5% (configurable)
• Gas Fees: User pays transaction costs
• No Hidden Fees: Transparent pricing
    `
  },
  'creator-mode': {
    title: 'Creator Mode',
    content: `
Creator Mode

The default interface designed for artists and content creators.

Features

Simplified Interface
• Clean, intuitive design
• Focus on creation tools
• Minimal technical complexity
• User-friendly workflows

Core Tools
• NFT Minting: Easy upload and mint process
• Collection Management: View and organize NFTs
• Marketplace Access: List and sell creations
• Portfolio Dashboard: Track performance

User Experience
• Guided Workflows: Step-by-step processes
• Visual Feedback: Real-time status updates
• Error Handling: Clear error messages
• Help System: Built-in guidance

Navigation

• Home: Platform overview and featured content
• Explore: Discover other creators' work
• Mint: Create new NFTs
• Dashboard: Manage your collection

Limitations

• No developer tools visible
• Simplified technical information
• Focus on end-user experience
• Streamlined for non-technical users
    `
  },
  'developer-mode': {
    title: 'Developer Mode',
    content: `
Developer Mode

Advanced interface with developer tools and debugging capabilities.

⚠️ Warning

Developer Mode provides access to advanced features and debugging tools. Only use this mode if you understand the implications of your actions.

Features

Advanced Tools
• Test Wallet: Mock wallet for testing
• Contract Interaction: Direct smart contract calls
• Debug Information: Detailed transaction logs
• Network Monitoring: Real-time blockchain data

Developer Navigation
• Test Wallet Page: Access to mock wallet functionality
• Enhanced Logging: Detailed console output
• Contract Explorer: Direct contract interaction
• Gas Estimation: Advanced transaction analysis

Technical Information
• Contract Addresses: Full contract details
• ABI Information: Contract interface details
• Transaction Hashes: Complete transaction history
• Network Status: Real-time network information

Accessing Developer Mode

1. Click the Settings icon in the navigation
2. Select "Developer Mode" from the dropdown
3. Confirm the warning dialog
4. Access advanced features

Safety Guidelines

• Test First: Always test on Fuji testnet
• Small Amounts: Use minimal test funds
• Backup Wallets: Keep wallet backups secure
• Understand Actions: Know what each function does

Available in Developer Mode

• Test Wallet functionality
• Advanced contract interactions
• Detailed debugging information
• Network monitoring tools
• Gas optimization tools
    `
  },
  'smart-contracts': {
    title: 'Smart Contracts',
    content: `
Smart Contracts

Production-ready Solidity contracts with security best practices.

Contract Architecture

ArtisticSplashNFT.sol
ERC-721 NFT Contract with Advanced Features

Key Features
• ERC-721 Compliance: Standard NFT functionality
• ERC-2981 Royalties: Automatic royalty distribution
• Access Control: Role-based permissions
• Time-Based Limits: Fair minting restrictions
• Batch Operations: Efficient bulk minting

Functions
• publicMint(): Public minting with limits
• safeMint(): Admin-only unlimited minting
• batchMint(): Multiple NFT creation
• setDefaultRoyalty(): Configure royalty rates
• configurePublicMint(): Set minting parameters

ArtisticSplashMarketplace.sol
Decentralized Marketplace Contract

Key Features
• Secure Trading: ReentrancyGuard protection
• Fee Management: Configurable platform fees
• Royalty Support: Automatic creator payments
• Escrow System: Safe transaction handling

Functions
• listItem(): Create marketplace listing
• buyItem(): Purchase with automatic transfers
• cancelListing(): Remove listings
• withdrawProceeds(): Collect earnings

Security Features

OpenZeppelin Integration
• AccessControl: Role-based permissions
• ReentrancyGuard: Attack prevention
• ERC2981: Standard royalty support
• ERC721: Proven NFT standard

Best Practices
• Input Validation: Comprehensive checks
• Error Handling: Clear error messages
• Event Logging: Complete audit trail
• Gas Optimization: Efficient operations
    `
  },
  deployment: {
    title: 'Deployment',
    content: `
Deployment Guide

Deploy smart contracts to Avalanche networks.

Prerequisites

• Node.js 18+
• Hardhat development environment
• Avalanche wallet with test AVAX
• Environment variables configured

Deployment Process

1. Compile Contracts
npm run compile

2. Deploy to Fuji Testnet
npm run deploy:fuji

3. Update Frontend
Add contract addresses to frontend/.env.local:
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...

4. Restart Frontend
cd frontend
npm run dev

Contract Verification

Snowtrace Verification
1. Visit Snowtrace (https://testnet.snowtrace.io)
2. Navigate to your contract address
3. Click "Verify and Publish"
4. Upload contract source code
5. Complete verification process

Configuration

Deployment Parameters
• Admin Address: Contract administrator
• Royalty Receiver: Royalty payment address
• Royalty BPS: Royalty percentage (250 = 2.5%)
• Platform Fee BPS: Platform fee percentage
• Fee Recipient: Platform fee collection address

Network Configuration
• Fuji Testnet: Chain ID 43113
• Mainnet: Chain ID 43114
• RPC Endpoints: Avalanche public RPCs
• Block Explorer: Snowtrace integration
    `
  },
  testing: {
    title: 'Testing',
    content: `
Testing Guide

Comprehensive testing strategies for the NFT marketplace.

Test Categories

Unit Tests
• Contract Functions: Individual function testing
• Access Control: Role-based permission testing
• Edge Cases: Boundary condition testing
• Error Handling: Failure scenario testing

Integration Tests
• End-to-End: Complete user workflows
• Wallet Integration: Multi-wallet compatibility
• IPFS Integration: Storage and retrieval testing
• Marketplace: Trading functionality testing

Security Tests
• Reentrancy: Attack vector testing
• Access Control: Permission bypass testing
• Input Validation: Malicious input testing
• Gas Optimization: DoS prevention testing

Running Tests

Contract Tests
npm run test

Frontend Tests
cd frontend
npm run test

E2E Tests
npm run test:e2e

Test Scenarios

Minting Tests
• Valid NFT creation
• Invalid input handling
• Rate limiting enforcement
• Admin vs user permissions

Marketplace Tests
• Successful purchases
• Failed transactions
• Royalty distribution
• Fee collection

Wallet Tests
• Connection flows
• Network switching
• Transaction signing
• Error handling

Test Data

Test Images
• Various file formats
• Different file sizes
• Invalid file types
• Corrupted files

Test Metadata
• Valid JSON structures
• Invalid schemas
• Missing fields
• Malformed data
    `
  }
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const currentContent = docContent[activeSection as keyof typeof docContent];

  return (
    <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack">
      {/* Header */}
      <div className="bg-white dark:bg-gray/20 border-b border-gray/20 dark:border-gray/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lightBlue rounded-lg flex items-center justify-center">
                <Palette className="text-white" size={20} />
              </div>
              <h1 className="text-xl text-lightBlue">Artistic Splash Documentation</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <a 
                href="/mint" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors"
              >
                Mint
              </a>
              <a 
                href="/explore" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors"
              >
                Explore
              </a>
              <a 
                href="/dashboard" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray/20 border-r border-gray/20 dark:border-gray/30 min-h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Book className="text-lightBlue" size={24} />
              <h1 className="text-xl text-metallicBlack dark:text-white">
                Documentation
              </h1>
            </div>
            
            <nav className="space-y-2">
              {docsSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-smokeWhite dark:hover:bg-gray/30 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {section.icon}
                      <span className="text-metallicBlack dark:text-white">
                        {section.title}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`text-gray dark:text-smokeWhite transition-transform ${
                        expandedSections.includes(section.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 space-y-1"
                    >
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full p-2 text-left rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-lightBlue/10 text-lightBlue dark:bg-lightBlue/20'
                              : 'text-gray dark:text-smokeWhite hover:bg-smokeWhite dark:hover:bg-gray/30'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl text-metallicBlack dark:text-white mb-8">
              {currentContent.title}
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray dark:text-smokeWhite leading-relaxed whitespace-pre-line"
              >
                {currentContent.content}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
