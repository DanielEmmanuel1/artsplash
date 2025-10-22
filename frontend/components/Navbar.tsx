'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ConnectWalletButton from './wallet/ConnectWalletButton';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/mint', label: 'Mint' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/test-wallet', label: 'Test Wallet' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray/20 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.h1
              className="text-3xl font-cursive bg-linear-to-r from-lightBlue to-blue bg-clip-text text-transparent drop-shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Artistic Splash
            </motion.h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-metallicBlack hover:text-lightBlue transition-colors duration-200 font-medium relative ${
                  pathname === link.href ? 'text-lightBlue' : ''
                }`}
              >
                {link.label}
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

          {/* Connect Wallet Button */}
          <ConnectWalletButton />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? 'text-lightBlue font-semibold'
                  : 'text-metallicBlack'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

