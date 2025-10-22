'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useWallet } from '@/lib/wallet/useWallet';
import DashboardGrid from '@/components/DashboardGrid';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { userNFTs } = useStore();
  const { connected } = useWallet();
  const router = useRouter();

  if (!connected) {
    return (
      <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray/20 rounded-xl p-12 text-center max-w-md shadow-xl border border-transparent dark:border-gray/30"
        >
          <h2 className="text-3xl font-bold text-blue dark:text-lightBlue mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray dark:text-smokeWhite mb-8">
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
    <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack dark:text-white mb-4">
            My Dashboard
          </h1>
          <p className="text-gray dark:text-smokeWhite text-lg">
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
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Total NFTs</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Listed for Sale</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs.filter((nft) => nft.isListed).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Total Value</p>
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

