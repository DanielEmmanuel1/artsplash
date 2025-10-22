/**
 * Wallet Adapter - Main Export
 * 
 * Simplified imports for the Artistic Splash wallet integration
 */

// Main provider
export { WalletProvider } from './WalletProvider';

// Hooks
export { useWallet, formatAddress } from './useWallet';
export type { WalletState } from './useWallet';

// Chains
export {
  avalancheFuji,
  avalancheMainnet,
  getChainById,
  isAvalancheChain,
  getExplorerAddressUrl,
  getExplorerTxUrl,
} from './chains';

// Components (re-export from components folder)
export { default as ConnectWalletButton } from '../../components/wallet/ConnectWalletButton';
export { default as WalletModal } from '../../components/wallet/WalletModal';
export { default as NetworkBanner } from '../../components/wallet/NetworkBanner';
export { default as AccountMenu } from '../../components/wallet/AccountMenu';

