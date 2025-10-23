'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useSettings } from '@/lib/settingsStore';

export default function OnboardingModal() {
  const { appMode, setAppMode } = useSettings();
  const [show, setShow] = useState(false);
  const [ack, setAck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 5000); // always show 5s after entering
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const close = () => {
    if (!ack) return;
    setShow(false);
  };

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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-metallicBlack dark:text-white">Welcome to Artistic Splash</h3>
          </div>
          <div className="space-y-3 mb-4">
            <p className="text-gray dark:text-smokeWhite">
              Try the app in <span className="font-semibold text-lightBlue">Demo Mode</span> without a wallet. Switch to <span className="font-semibold">Creator Mode</span> to mint on-chain, or <span className="font-semibold">Developer Mode</span> for advanced tools.
            </p>
            <div className="grid gap-2">
              <button onClick={() => setAppMode('demo')} className={`px-4 py-2 rounded-lg border ${appMode==='demo'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Demo Mode (no wallet)</button>
              <button onClick={() => setAppMode('creator')} className={`px-4 py-2 rounded-lg border ${appMode==='creator'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Creator Mode (on-chain)</button>
              <button onClick={() => setAppMode('developer')} className={`px-4 py-2 rounded-lg border ${appMode==='developer'?'border-lightBlue bg-lightBlue/10 text-lightBlue':'border-gray/30 dark:border-gray/40 text-metallicBlack dark:text-white'}`}>Developer Mode</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray dark:text-smokeWhite mb-4 select-none cursor-pointer">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="w-4 h-4" />
            I understand how the modes work and agree to continue.
          </label>
          <button onClick={close} disabled={!ack} className="w-full px-4 py-2 rounded-lg bg-lightBlue text-white disabled:opacity-40 disabled:cursor-not-allowed">
            Continue to app
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


