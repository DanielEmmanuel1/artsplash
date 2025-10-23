'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ConnectWalletButton from './wallet/ConnectWalletButton';
import SettingsMenu from './SettingsMenu';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '@/lib/settingsStore';
import DevModeWarningModal from './DevModeWarningModal';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { appMode, setAppMode, hasAcknowledgedDevMode, acknowledgeDevMode } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDevWarning, setShowDevWarning] = useState(false);

  const handleModeChange = (newMode: 'demo' | 'creator' | 'developer') => {
    if (newMode === 'developer' && !hasAcknowledgedDevMode) {
      setShowDevWarning(true);
      return;
    }
    setAppMode(newMode);
  };

  const handleDevConfirm = () => {
    acknowledgeDevMode();
    setAppMode('developer');
    setShowDevWarning(false);
  };

      const baseNavLinks = [
        { href: '/mint', label: 'Mint' },
        { href: '/explore', label: 'Explore' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/docs', label: 'Docs' },
      ];

  // Add test-wallet only in developer mode
  const navLinks = appMode === 'developer' 
    ? [...baseNavLinks, { href: '/test-wallet', label: 'Test Wallet', isDev: true }]
    : baseNavLinks;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-metallicBlack border-b border-gray/20 dark:border-gray/30 sticky top-0 z-50 shadow-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/mint" className="flex items-center">
            <motion.h1
              className="text-3xl font-cursive bg-linear-to-r from-lightBlue to-blue bg-clip-text text-transparent drop-shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Artistic Splash
            </motion.h1>
          </Link>

          {/* Navigation Links (Desktop - large and up) */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-metallicBlack dark:text-white hover:text-lightBlue transition-colors duration-200 font-medium relative ${
                  pathname === link.href ? 'text-lightBlue' : ''
                } ${'isDev' in link && link.isDev ? 'flex items-center' : ''}`}
              >
                {link.label}
                {'isDev' in link && link.isDev && (
                  <span className="ml-1 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                    DEV
                  </span>
                )}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-lightBlue"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Desktop actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              <SettingsMenu />
              <ConnectWalletButton />
            </div>
            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-lg border border-gray/20 dark:border-gray/30 hover:bg-smokeWhite dark:hover:bg-gray/30"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="text-metallicBlack dark:text-white" size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Slide-In Menu */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85%] bg-white dark:bg-metallicBlack border-l border-gray/20 dark:border-gray/30 z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-metallicBlack dark:text-white">Menu</span>
                <button
                  aria-label="Close menu"
                  className="p-2 rounded-lg hover:bg-smokeWhite dark:hover:bg-gray/30"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="text-metallicBlack dark:text-white" size={22} />
                </button>
              </div>
              <nav className="space-y-3 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-smokeWhite dark:bg-gray/30 text-lightBlue'
                        : 'text-metallicBlack dark:text-white hover:bg-smokeWhite dark:hover:bg-gray/30'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {/* Integrated Settings (Mode) */}
              <div className="mb-6">
                <div className="text-xs uppercase tracking-wide text-gray dark:text-smokeWhite mb-2">Mode</div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleModeChange('demo')}
                    className={`w-full px-3 py-2 rounded-lg border text-left ${
                      appMode === 'demo'
                        ? 'border-lightBlue bg-lightBlue/10 text-lightBlue'
                        : 'border-gray/20 dark:border-gray/30 text-metallicBlack dark:text-white hover:border-lightBlue/50'
                    }`}
                  >
                    Demo Mode
                  </button>
                  <button
                    onClick={() => handleModeChange('creator')}
                    className={`w-full px-3 py-2 rounded-lg border text-left ${
                      appMode === 'creator'
                        ? 'border-lightBlue bg-lightBlue/10 text-lightBlue'
                        : 'border-gray/20 dark:border-gray/30 text-metallicBlack dark:text-white hover:border-lightBlue/50'
                    }`}
                  >
                    Creator Mode
                  </button>
                  <button
                    onClick={() => handleModeChange('developer')}
                    className={`w-full px-3 py-2 rounded-lg border text-left ${
                      appMode === 'developer'
                        ? 'border-lightBlue bg-lightBlue/10 text-lightBlue'
                        : 'border-gray/20 dark:border-gray/30 text-metallicBlack dark:text-white hover:border-lightBlue/50'
                    }`}
                  >
                    Developer Mode
                  </button>
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <ThemeToggle />
                <ConnectWalletButton />
              </div>
            </motion.div>
          </>
        )}
        <DevModeWarningModal
          isOpen={showDevWarning}
          onConfirm={handleDevConfirm}
          onCancel={() => setShowDevWarning(false)}
        />
      </div>
    </motion.nav>
  );
}

