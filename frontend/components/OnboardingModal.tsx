'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle } from 'lucide-react';
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
          className="bg-white dark:bg-metallicBlack rounded-2xl p-8 max-w-2xl w-full border border-gray/20 dark:border-gray/40 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-metallicBlack dark:text-white">Welcome to Artistic Splash</h3>
          </div>
          <div className="space-y-4 mb-6">
            <p className="text-gray dark:text-smokeWhite leading-relaxed">
              Artistic Splash is a creator-focused NFT studio on Avalanche. Mint one-of-one art, list on the marketplace, and manage your collection with a clean, modern UI.
            </p>

            <div>
              <h4 className="font-semibold text-metallicBlack dark:text-white mb-2">Modes</h4>
              <ul className="space-y-2 text-sm text-gray dark:text-smokeWhite">
                <li>
                  <span className="font-semibold text-lightBlue">Demo Mode</span> — Explore without a wallet. No on-chain actions. Great for getting a feel of the app.
                </li>
                <li>
                  <span className="font-semibold">Creator Mode</span> — Real on-chain minting/listing. Requires a wallet and AVAX for gas.
                </li>
                <li>
                  <span className="font-semibold">Developer Mode</span> — Same as Creator, plus extra debug tools and test utilities.
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Disclaimer: This is a test application. Use a burner wallet and avoid using funds you can’t afford to lose.
              </p>
            </div>

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
          <button onClick={close} disabled={!ack} className="w-full px-4 py-3 rounded-lg bg-lightBlue text-white disabled:opacity-40 disabled:cursor-not-allowed">
            Continue to app
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


