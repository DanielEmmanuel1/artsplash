'use client';

/**
 * useWallet Hook
 * 
 * Provides a clean API for wallet interactions in the Artistic Splash app.
 * Wraps Wagmi hooks with additional functionality for network switching and error handling.
 * 
 * Official Docs:
 * - https://wagmi.sh/react/api/hooks/useAccount
 * - https://wagmi.sh/react/api/hooks/useConnect
 * - https://wagmi.sh/react/api/hooks/useDisconnect
 * - https://wagmi.sh/react/api/hooks/useSwitchChain
 * - https://wagmi.sh/react/api/hooks/useWalletClient
 */

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { avalancheFuji, avalancheMainnet, isAvalancheChain } from './chains';
import { useCallback } from 'react';
import type { Connector } from 'wagmi';

export interface WalletState {
  // Connection state
  connected: boolean;
  connecting: boolean;
  address?: `0x${string}`;
  chainId?: number;
  
  // Network info
  isCorrectNetwork: boolean;
  isAvalanche: boolean;
  isFuji: boolean;
  isMainnet: boolean;
  
  // Wallet client (for signing transactions)
  walletClient?: any;
  
  // Actions
  connect: (connectorId?: string) => Promise<void>;
  disconnect: () => void;
  switchToFuji: () => Promise<boolean>;
  switchToMainnet: () => Promise<boolean>;
  switchChain: (chainId: number) => Promise<boolean>;
  
  // Available connectors
  connectors: Connector[];
  
  // Error state
  error?: Error;
}

/**
 * Main wallet hook - use this in your components
 */
export function useWallet(): WalletState {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connect: wagmiConnect, connectors, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain, error: switchError } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Network checks
  const isAvalanche = chainId ? isAvalancheChain(chainId) : false;
  const isFuji = chainId === avalancheFuji.id;
  const isMainnet = chainId === avalancheMainnet.id;
  const isCorrectNetwork = isAvalanche;

  /**
   * Connect to a wallet
   * @param connectorId - Optional connector ID (metamask, coinbase, walletconnect)
   */
  const connect = useCallback(
    async (connectorId?: string) => {
      try {
        let targetConnector: Connector | undefined;

        if (connectorId) {
          // Find connector by ID or name
          targetConnector = connectors.find(
            (c) =>
              c.id.toLowerCase().includes(connectorId.toLowerCase()) ||
              c.name.toLowerCase().includes(connectorId.toLowerCase())
          );
        }

        // Use first available connector if none specified or found
        if (!targetConnector) {
          targetConnector = connectors[0];
        }

        if (!targetConnector) {
          throw new Error('No wallet connector available');
        }

        // Connect with the selected connector
        await wagmiConnect({ connector: targetConnector });
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    },
    [connectors, wagmiConnect]
  );

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  /**
   * Switch to Avalanche Fuji Testnet
   */
  const switchToFuji = useCallback(async (): Promise<boolean> => {
    try {
      if (!switchChain) {
        console.warn('switchChain not available');
        return false;
      }

      await switchChain({ chainId: avalancheFuji.id });
      return true;
    } catch (error) {
      console.error('Error switching to Fuji:', error);
      
      // Fallback: try to add the network manually
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${avalancheFuji.id.toString(16)}`,
                chainName: avalancheFuji.name,
                nativeCurrency: avalancheFuji.nativeCurrency,
                rpcUrls: [avalancheFuji.rpcUrls.default.http[0]],
                blockExplorerUrls: [avalancheFuji.blockExplorers.default.url],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Fuji network:', addError);
          return false;
        }
      }
      
      return false;
    }
  }, [switchChain]);

  /**
   * Switch to Avalanche Mainnet
   */
  const switchToMainnet = useCallback(async (): Promise<boolean> => {
    try {
      if (!switchChain) {
        console.warn('switchChain not available');
        return false;
      }

      await switchChain({ chainId: avalancheMainnet.id });
      return true;
    } catch (error) {
      console.error('Error switching to Mainnet:', error);
      
      // Fallback: try to add the network manually
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${avalancheMainnet.id.toString(16)}`,
                chainName: avalancheMainnet.name,
                nativeCurrency: avalancheMainnet.nativeCurrency,
                rpcUrls: [avalancheMainnet.rpcUrls.default.http[0]],
                blockExplorerUrls: [avalancheMainnet.blockExplorers.default.url],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Mainnet network:', addError);
          return false;
        }
      }
      
      return false;
    }
  }, [switchChain]);

  /**
   * Switch to any chain by ID
   */
  const switchToChain = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      try {
        if (!switchChain) {
          console.warn('switchChain not available');
          return false;
        }

        await switchChain({ chainId: targetChainId });
        return true;
      } catch (error) {
        console.error(`Error switching to chain ${targetChainId}:`, error);
        return false;
      }
    },
    [switchChain]
  );

  return {
    // State
    connected: isConnected,
    connecting: isConnecting || isSwitchingChain,
    address,
    chainId,
    
    // Network info
    isCorrectNetwork,
    isAvalanche,
    isFuji,
    isMainnet,
    
    // Wallet client
    walletClient,
    
    // Actions
    connect,
    disconnect,
    switchToFuji,
    switchToMainnet,
    switchChain: switchToChain,
    
    // Connectors
    connectors,
    
    // Errors
    error: connectError || switchError || undefined,
  };
}

/**
 * Format wallet address to shortened version
 * Example: 0x1234...5678
 */
export function formatAddress(address?: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Declare ethereum on window for TypeScript
 */
declare global {
  interface Window {
    ethereum?: any;
  }
}

