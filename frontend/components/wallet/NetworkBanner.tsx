'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useWallet } from '@/lib/wallet/useWallet';
import { useState } from 'react';

export default function NetworkBanner() {
  const { connected, isCorrectNetwork, isFuji, switchToFuji, chainId } = useWallet();
  const [dismissed, setDismissed] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Only show if connected and on wrong network
  const shouldShow = connected && !isCorrectNetwork && !dismissed;

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    try {
      const success = await switchToFuji();
      if (success) {
        setDismissed(true);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-40"
        >
          <div className="bg-yellow-500 text-black px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <AlertTriangle size={24} />
                <div>
                  <p className="font-semibold">Wrong Network</p>
                  <p className="text-sm">
                    You're connected to chain ID {chainId}. Please switch to Avalanche Fuji Testnet (43113) to use this app.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwitchNetwork}
                  disabled={switching}
                  className="bg-black text-yellow-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {switching ? 'Switching...' : 'Switch to Fuji'}
                </motion.button>

                <button
                  onClick={() => setDismissed(true)}
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

