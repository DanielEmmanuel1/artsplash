'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-smokeWhite border-t border-gray/30 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-metallicBlack">
            <Palette size={20} className="text-lightBlue" />
            <span className="font-cursive text-xl bg-linear-to-r from-lightBlue to-blue bg-clip-text text-transparent">
              Artistic Splash
            </span>
          </div>
          <p className="text-center text-gray text-sm">
            © 2025 Artistic Splash. All rights reserved.
          </p>
          <p className="text-center text-gray text-xs max-w-md">
            Empowering creators to mint, sell, and collect unique digital art on the Avalanche blockchain
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

