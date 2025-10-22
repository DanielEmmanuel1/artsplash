'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import NFTCard from './NFTCard';
import { X } from 'lucide-react';

export default function DashboardGrid() {
  const { userNFTs, listNFT } = useStore();
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFTId, setSelectedNFTId] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState('');

  const handleListClick = (nftId: string) => {
    setSelectedNFTId(nftId);
    setShowListModal(true);
  };

  const handleListConfirm = () => {
    if (selectedNFTId && listingPrice && parseFloat(listingPrice) > 0) {
      listNFT(selectedNFTId, parseFloat(listingPrice));
      setShowListModal(false);
      setSelectedNFTId(null);
      setListingPrice('');
    } else {
      alert('Please enter a valid price!');
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setSelectedNFTId(null);
    setListingPrice('');
  };

  if (userNFTs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <p className="text-gray text-lg mb-4">
          You haven't minted any NFTs yet
        </p>
        <motion.a
          href="/mint"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
        >
          Mint Your First NFT
        </motion.a>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {userNFTs.map((nft, index) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NFTCard
              nft={nft}
              onAction={nft.isListed ? undefined : handleListClick}
              actionLabel={nft.isListed ? undefined : 'List for Sale'}
              showPrice={nft.isListed}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* List NFT Modal */}
      <AnimatePresence>
        {showListModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-md w-full border border-gray/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-metallicBlack">List NFT for Sale</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray hover:text-metallicBlack transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-metallicBlack font-semibold mb-2">
                  Price (AVAX)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="Enter price in AVAX"
                  className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  className="flex-1 bg-silver text-black px-6 py-3 rounded-lg hover:bg-gray transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleListConfirm}
                  className="flex-1 bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
                >
                  List NFT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

