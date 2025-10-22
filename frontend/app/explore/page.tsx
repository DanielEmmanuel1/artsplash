'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import NFTCard from '@/components/NFTCard';

export default function ExplorePage() {
  const { allNFTs } = useStore();

  const handleBuyClick = (nftId: string) => {
    // Mock buy action
    alert(`Purchase functionality coming soon! NFT ID: ${nftId}`);
  };

  return (
    <div className="min-h-screen bg-smokeWhite py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack mb-4">
            Explore NFTs
          </h1>
          <p className="text-gray text-lg">
            Discover unique digital art from creators around the world
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {allNFTs.length}
            </p>
            <p className="text-gray text-sm">Total NFTs</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {allNFTs.filter((nft) => nft.isListed).length}
            </p>
            <p className="text-gray text-sm">Listed</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {new Set(allNFTs.map((nft) => nft.owner)).size}
            </p>
            <p className="text-gray text-sm">Creators</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {(allNFTs.reduce((sum, nft) => sum + (nft.price || 0), 0) / allNFTs.length).toFixed(1)}
            </p>
            <p className="text-gray text-sm">Avg. Price (AVAX)</p>
          </div>
        </motion.div>

        {/* NFT Grid */}
        {allNFTs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray text-lg">No NFTs available yet</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {allNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <NFTCard
                  nft={nft}
                  onAction={nft.isListed ? handleBuyClick : undefined}
                  actionLabel="Buy"
                  showPrice={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

