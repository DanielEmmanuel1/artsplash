'use client';

/**
 * Wallet Provider Component
 * 
 * Wraps the application with Wagmi and React Query providers
 * to enable wallet connection functionality.
 * 
 * Official Docs:
 * - https://wagmi.sh/react/api/WagmiProvider
 * - https://tanstack.com/query/latest/docs/framework/react/overview
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './config';
import { ReactNode, useState } from 'react';

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Create a client for React Query (required by Wagmi)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent refetch on window focus for better UX
            refetchOnWindowFocus: false,
            // Keep data fresh for 10 seconds
            staleTime: 10_000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

