/**
 * Wagmi Configuration for Artistic Splash
 * 
 * Official Docs:
 * - https://wagmi.sh/react/getting-started
 * - https://wagmi.sh/react/guides/connect-wallet
 * - https://web3modal.com/docs (Web3Modal/AppKit integration)
 */

import { createConfig, http } from 'wagmi';
import { avalancheFuji, avalancheMainnet } from './chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Artistic Splash';

if (!projectId) {
  console.warn(
    '⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Get one at https://cloud.walletconnect.com'
  );
}

/**
 * Wagmi configuration with Avalanche networks
 * Supports MetaMask, Coinbase Wallet, and WalletConnect
 */
export const wagmiConfig = createConfig({
  chains: [avalancheFuji, avalancheMainnet],
  connectors: [
    // Injected connector (MetaMask, Browser wallets)
    injected({
      target: 'metaMask',
    }),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName,
      appLogoUrl: '/logo.png', // Optional: add your logo
    }),
    
    // WalletConnect
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: appName,
              description: 'Create, mint, and trade NFTs on Avalanche',
              url: typeof window !== 'undefined' ? window.location.origin : '',
              icons: ['https://avatars.githubusercontent.com/u/37784886'],
            },
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [avalancheFuji.id]: http(),
    [avalancheMainnet.id]: http(),
  },
  ssr: true, // Enable SSR support for Next.js
});

/**
 * App metadata for Web3Modal
 */
export const web3ModalMetadata = {
  name: appName,
  description: 'Create, mint, and trade NFTs on Avalanche',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

/**
 * Supported connector names for easy reference
 */
export const CONNECTOR_NAMES = {
  METAMASK: 'MetaMask',
  INJECTED: 'Injected',
  COINBASE: 'Coinbase Wallet',
  WALLETCONNECT: 'WalletConnect',
} as const;

/**
 * Default chain (Fuji testnet for development)
 */
export const DEFAULT_CHAIN = avalancheFuji;

