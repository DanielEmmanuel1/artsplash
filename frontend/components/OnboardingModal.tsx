'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSettings } from '@/lib/settingsStore';

export default function OnboardingModal() {
  const { appMode, setAppMode, hasSeenOnboarding, setHasSeenOnboarding } = useSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      // show only if not seen yet
      if (!hasSeenOnboarding) setHasSeenOnboarding();
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, setHasSeenOnboarding]);

  if (hasSeenOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-metallicBlack rounded-xl p-6 max-w-lg w-full border border-gray/20 dark:border-gray/40 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-metallicBlack dark:text-white">Welcome to Artistic Splash</h3>
            <button onClick={() => setHasSeenOnboarding()} className="p-1 rounded hover:bg-smokeWhite dark:hover:bg-gray/30">
              <X size={20} className="text-metallicBlack dark:text-white" />
            </button>
          </div>
          <p className="text-gray dark:text-smokeWhite mb-4">
            Explore the app in Demo Mode (no wallet needed). Switch to Creator Mode to mint on-chain, or Developer Mode for extra tools.
          </p>
          <div className="grid gap-2">
            <button onClick={() => { setAppMode('demo'); setHasSeenOnboarding(); }} className={`px-4 py-2 rounded-lg border ${appMode==='demo'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Demo Mode</button>
            <button onClick={() => { setAppMode('creator'); setHasSeenOnboarding(); }} className={`px-4 py-2 rounded-lg border ${appMode==='creator'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Creator Mode</button>
            <button onClick={() => { setAppMode('developer'); setHasSeenOnboarding(); }} className={`px-4 py-2 rounded-lg border ${appMode==='developer'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Developer Mode</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


