'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import DashboardGrid from '@/components/DashboardGrid';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isWalletConnected, userNFTs } = useStore();
  const router = useRouter();

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isWalletConnected) {
      // Don't redirect, just show a message
    }
  }, [isWalletConnected]);

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-smokeWhite flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-12 text-center max-w-md shadow-xl"
        >
          <h2 className="text-3xl font-bold text-blue mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray mb-8">
            Please connect your wallet to view your dashboard and manage your NFTs
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
          >
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smokeWhite py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack mb-4">
            My Dashboard
          </h1>
          <p className="text-gray text-lg">
            Manage your NFT collection and listings
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-gray text-sm mb-1">Total NFTs</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-gray text-sm mb-1">Listed for Sale</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs.filter((nft) => nft.isListed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-gray text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs
                .filter((nft) => nft.isListed)
                .reduce((sum, nft) => sum + (nft.price || 0), 0)
                .toFixed(2)}{' '}
              AVAX
            </p>
          </div>
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DashboardGrid />
        </motion.div>
      </div>
    </div>
  );
}

