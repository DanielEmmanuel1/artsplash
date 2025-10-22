/**
 * Avalanche Chain Configurations
 * 
 * Official Docs:
 * - https://docs.avax.network/
 * - https://chainlist.org/chain/43113 (Fuji)
 * - https://chainlist.org/chain/43114 (Mainnet)
 */

import { defineChain } from 'viem';

/**
 * Avalanche Fuji Testnet
 * ChainID: 43113 (0xA86A in hex)
 */
export const avalancheFuji = defineChain({
  id: 43113,
  name: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax-test.network/ext/bc/C/rpc'],
    },
    public: {
      http: ['https://api.avax-test.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Snowtrace',
      url: 'https://testnet.snowtrace.io',
    },
  },
  testnet: true,
});

/**
 * Avalanche C-Chain Mainnet
 * ChainID: 43114 (0xA86B in hex)
 */
export const avalancheMainnet = defineChain({
  id: 43114,
  name: 'Avalanche C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
    public: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Snowtrace',
      url: 'https://snowtrace.io',
    },
  },
  testnet: false,
});

/**
 * Get chain by ID
 */
export function getChainById(chainId: number) {
  switch (chainId) {
    case 43113:
      return avalancheFuji;
    case 43114:
      return avalancheMainnet;
    default:
      return null;
  }
}

/**
 * Check if chain is Avalanche
 */
export function isAvalancheChain(chainId: number) {
  return chainId === 43113 || chainId === 43114;
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(chainId: number, address: string) {
  const chain = getChainById(chainId);
  if (!chain) return null;
  return `${chain.blockExplorers.default.url}/address/${address}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string) {
  const chain = getChainById(chainId);
  if (!chain) return null;
  return `${chain.blockExplorers.default.url}/tx/${txHash}`;
}

