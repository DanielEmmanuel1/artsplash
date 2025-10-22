'use client';

import { motion } from 'framer-motion';
import { Copy, ExternalLink, LogOut, CheckCircle } from 'lucide-react';
import { useWallet, formatAddress } from '@/lib/wallet/useWallet';
import { getExplorerAddressUrl } from '@/lib/wallet/chains';
import { useState, useEffect } from 'react';

interface AccountMenuProps {
  onClose: () => void;
  anchorElement?: HTMLElement | null;
}

export default function AccountMenu({ onClose }: AccountMenuProps) {
  const { address, chainId, disconnect, isFuji, isMainnet } = useWallet();
  const [copied, setCopied] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (address && chainId) {
      const explorerUrl = getExplorerAddressUrl(chainId, address);
      if (explorerUrl) {
        window.open(explorerUrl, '_blank');
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const networkName = isFuji ? 'Fuji Testnet' : isMainnet ? 'Mainnet' : 'Unknown Network';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="account-menu absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray/20 overflow-hidden z-50"
    >
      {/* Account Info */}
      <div className="p-4 bg-smokeWhite border-b border-gray/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray font-medium">Connected Account</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isFuji
                ? 'bg-yellow-100 text-yellow-800'
                : isMainnet
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {networkName}
          </span>
        </div>
        <p className="text-metallicBlack font-mono font-semibold">
          {address && formatAddress(address)}
        </p>
      </div>

      {/* Actions */}
      <div className="p-2">
        <motion.button
          whileHover={{ backgroundColor: '#f5f5f5' }}
          onClick={handleCopyAddress}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-metallicBlack font-medium">Address Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} className="text-gray" />
              <span className="text-metallicBlack font-medium">Copy Address</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ backgroundColor: '#f5f5f5' }}
          onClick={handleViewExplorer}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors"
        >
          <ExternalLink size={18} className="text-gray" />
          <span className="text-metallicBlack font-medium">View on Snowtrace</span>
        </motion.button>

        <div className="my-2 border-t border-gray/20" />

        <motion.button
          whileHover={{ backgroundColor: '#fee' }}
          onClick={handleDisconnect}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors"
        >
          <LogOut size={18} className="text-red-500" />
          <span className="text-red-500 font-medium">Disconnect</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

