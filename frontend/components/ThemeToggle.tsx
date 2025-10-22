'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '@/lib/settingsStore';

export default function ThemeToggle() {
  const { themeMode, toggleTheme } = useSettings();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gray/30 dark:bg-lightBlue transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle Circle */}
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{ x: themeMode === 'dark' ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {themeMode === 'light' ? (
          <Sun size={14} className="text-yellow-500" />
        ) : (
          <Moon size={14} className="text-blue" />
        )}
      </motion.div>
    </motion.button>
  );
}

