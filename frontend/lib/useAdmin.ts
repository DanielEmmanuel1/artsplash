/**
 * Admin Detection Hook
 * Checks if the connected wallet has admin privileges on the NFT contract
 */

import { useReadContract } from 'wagmi';
import { CONTRACTS, NFT_ABI } from './contracts';
import { useWallet } from './wallet/useWallet';

export function useAdmin() {
  const { connected, address } = useWallet();
  
  // Check if user has DEFAULT_ADMIN_ROLE
  const { data: isAdmin, error: adminError } = useReadContract({
    address: CONTRACTS.NFT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'hasRole',
    args: [
      '0x0000000000000000000000000000000000000000000000000000000000000000', // DEFAULT_ADMIN_ROLE
      address as `0x${string}`
    ],
    query: {
      enabled: connected && !!address && CONTRACTS.NFT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Check if user has MINTER_ROLE
  const { data: isMinter, error: minterError } = useReadContract({
    address: CONTRACTS.NFT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'hasRole',
    args: [
      '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', // MINTER_ROLE keccak256 hash
      address as `0x${string}`
    ],
    query: {
      enabled: connected && !!address && CONTRACTS.NFT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Debug logging
  if (connected && address) {
    console.log('🔍 Admin Check Debug:');
    console.log('Address:', address);
    console.log('Contract:', CONTRACTS.NFT_ADDRESS);
    console.log('isAdmin result:', isAdmin);
    console.log('isMinter result:', isMinter);
    console.log('Admin error:', adminError);
    console.log('Minter error:', minterError);
    console.log('Expected admin address: 0xd17b3a5Ec474E2475e95A2C178d6785CAF3A47ba');
    console.log('Is this the admin address?', address.toLowerCase() === '0xd17b3a5ec474e2475e95a2c178d6785caf3a47ba');
  }

  return {
    isAdmin: !!isAdmin,
    isMinter: !!isMinter,
    isConnected: connected,
    address,
  };
}
