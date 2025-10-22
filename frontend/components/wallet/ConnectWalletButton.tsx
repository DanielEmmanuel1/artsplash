'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown } from 'lucide-react';
import { useWallet, formatAddress } from '@/lib/wallet/useWallet';
import WalletModal from './WalletModal';
import AccountMenu from './AccountMenu';

interface ConnectWalletButtonProps {
  className?: string;
  showFullAddress?: boolean;
}

export default function ConnectWalletButton({
  className = '',
  showFullAddress = false,
}: ConnectWalletButtonProps) {
  const { connected, connecting, address, connect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleClick = () => {
    if (connected) {
      setShowAccountMenu(!showAccountMenu);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={connecting}
        className={`
          relative
          bg-lightBlue text-white px-6 py-2 rounded-lg 
          hover:bg-blue transition-colors duration-200 
          font-medium shadow-md border border-blue/20
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2
          ${className}
        `}
      >
        <Wallet size={18} />
        <span>
          {connecting
            ? 'Connecting...'
            : connected && address
            ? showFullAddress
              ? address
              : formatAddress(address)
            : 'Connect Wallet'}
        </span>
        {connected && <ChevronDown size={16} />}
      </motion.button>

      {/* Account Menu Dropdown */}
      <AnimatePresence>
        {connected && showAccountMenu && (
          <AccountMenu
            onClose={() => setShowAccountMenu(false)}
            anchorElement={null}
          />
        )}
      </AnimatePresence>

      {/* Connect Modal */}
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

