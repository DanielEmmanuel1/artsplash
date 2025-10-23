'use client';

import { motion } from 'framer-motion';
import UploadForm from '@/components/UploadForm';

export default function MintPage() {
  return (
    <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
<h1 className="text-4xl md:text-5xl italic font-medium text-blue dark:text-lightBlue mb-4">
            Turn your artwork into digital treasures
          </h1>
          <p className="text-gray dark:text-smokeWhite text-lg max-w-2xl mx-auto">
            Transform your artwork into a unique NFT on the Avalanche blockchain.
            Upload your image, add details, and mint!
          </p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UploadForm />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-white dark:bg-gray/20 rounded-xl p-8 shadow-lg border border-gray/20 dark:border-gray/30">
            <h2 className="text-2xl font-bold text-metallicBlack dark:text-white mb-4">
              Minting Guidelines
            </h2>
            <ul className="space-y-3 text-gray dark:text-smokeWhite">
              <li className="flex items-start">
                <span className="text-lightBlue mr-3 font-bold">•</span>
                <span className="text-metallicBlack/80 dark:text-smokeWhite/90">Ensure your wallet is connected before minting</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-3 font-bold">•</span>
                <span className="text-metallicBlack/80 dark:text-smokeWhite/90">Supported formats: PNG and JPEG (max 10MB)</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-3 font-bold">•</span>
                <span className="text-metallicBlack/80 dark:text-smokeWhite/90">Choose a unique and descriptive name for your NFT</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-3 font-bold">•</span>
                <span className="text-metallicBlack/80 dark:text-smokeWhite/90">Add a detailed description to increase value</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-3 font-bold">•</span>
                <span className="text-metallicBlack/80 dark:text-smokeWhite/90">Once minted, you can list your NFT for sale from your dashboard</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

