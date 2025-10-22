'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import { useWallet } from '@/lib/wallet/useWallet';
import Image from 'next/image';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Connector icons and metadata
const connectorMetadata: Record<string, { name: string; description: string; icon: string }> = {
  metamask: {
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension',
    icon: '🦊',
  },
  'injected': {
    name: 'Browser Wallet',
    description: 'Connect using your browser wallet',
    icon: '🌐',
  },
  'coinbase wallet': {
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: '🔵',
  },
  walletconnect: {
    name: 'WalletConnect',
    description: 'Scan QR code with your mobile wallet',
    icon: '📱',
  },
};

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, connecting } = useWallet();

  const handleConnect = async (connectorId: string) => {
    try {
      await connect(connectorId);
      onClose();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-8 max-w-md w-full border border-gray/20 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <Wallet className="text-lightBlue" size={28} />
                <h2 className="text-2xl font-bold text-metallicBlack">Connect Wallet</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray hover:text-metallicBlack transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray mb-6">
              Choose your preferred wallet to connect to Artistic Splash
            </p>

            {/* Connector List */}
            <div className="space-y-3">
              {connectors.map((connector) => {
                const connectorKey = connector.name.toLowerCase();
                const metadata =
                  connectorMetadata[connectorKey] ||
                  connectorMetadata[connector.id.toLowerCase()] ||
                  {
                    name: connector.name,
                    description: `Connect using ${connector.name}`,
                    icon: '🔐',
                  };

                return (
                  <motion.button
                    key={connector.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(connector.id)}
                    disabled={connecting}
                    className="w-full p-4 border-2 border-gray/20 rounded-lg hover:border-lightBlue transition-all flex items-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-3xl">{metadata.icon}</span>
                    <div className="flex-1 text-left">
                      <h3 className="text-metallicBlack font-semibold">{metadata.name}</h3>
                      <p className="text-gray text-sm">{metadata.description}</p>
                    </div>
                    {connecting && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-lightBlue border-t-transparent rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-smokeWhite rounded-lg">
              <p className="text-xs text-gray">
                <strong>New to Avalanche wallets?</strong> Learn more about{' '}
                <a
                  href="https://core.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lightBlue hover:underline"
                >
                  Core Wallet
                </a>{' '}
                or{' '}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lightBlue hover:underline"
                >
                  MetaMask
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

