/**
 * Smart Contract Addresses and ABIs
 * 
 * After deploying contracts, update these addresses
 */

// Contract addresses (update after deployment)
export const CONTRACTS = {
  NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  MARKETPLACE_ADDRESS: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 Contract Addresses Loaded:');
  console.log('NFT:', CONTRACTS.NFT_ADDRESS);
  console.log('Marketplace:', CONTRACTS.MARKETPLACE_ADDRESS);
  console.log('Deployed:', CONTRACTS.NFT_ADDRESS !== '0x0000000000000000000000000000000000000000');
}

// Simplified ABIs for minting (full ABIs will be generated via TypeChain)
export const NFT_ABI = [
  // safeMint function (admin only)
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "safeMint",
    "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // publicMint function (anyone, with limits)
  {
    "inputs": [
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "publicMint",
    "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  // totalSupply function
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ownerOf function
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  // tokenURI function
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  // hasRole function (AccessControl)
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "hasRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "NFTMinted",
    "type": "event"
  }
] as const;

export const MARKETPLACE_ABI = [
  // listItem function
  {
    "inputs": [
      { "internalType": "address", "name": "nft", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // buyItem function
  {
    "inputs": [
      { "internalType": "address", "name": "nft", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // cancelListing function
  {
    "inputs": [
      { "internalType": "address", "name": "nft", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

/**
 * Check if contracts are deployed
 */
export function areContractsDeployed(): boolean {
  return (
    CONTRACTS.NFT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
    CONTRACTS.MARKETPLACE_ADDRESS !== '0x0000000000000000000000000000000000000000'
  );
}

/**
 * Get contract deployment instructions
 */
export function getDeploymentInstructions(): string {
  return `
🚀 Deploy Smart Contracts to Fuji Testnet:

1. Add your private key to .env:
   PRIVATE_KEY=your_64_char_hex_private_key

2. Deploy contracts:
   npm run deploy:fuji

3. Update frontend .env.local with contract addresses:
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...

4. Restart your dev server

📚 For detailed instructions, see: CONTRACTS_SETUP.md
  `;
}

