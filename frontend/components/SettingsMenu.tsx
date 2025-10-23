'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Code, Check } from 'lucide-react';
import { useSettings, AppMode } from '@/lib/settingsStore';
import DevModeWarningModal from './DevModeWarningModal';

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDevWarning, setShowDevWarning] = useState(false);
  const { 
    appMode, 
    setAppMode, 
    hasAcknowledgedDevMode,
    acknowledgeDevMode,
    showGlobalLoading
  } = useSettings();

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === 'developer' && !hasAcknowledgedDevMode) {
      setShowDevWarning(true);
    } else {
      setAppMode(newMode);
      showGlobalLoading(2000);
    }
  };

  const handleDevModeConfirm = () => {
    acknowledgeDevMode();
    setAppMode('developer');
    setShowDevWarning(false);
  };

  return (
    <>
      {/* Settings Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-smokeWhite dark:hover:bg-gray/20 transition-colors"
          title="Settings"
        >
          <Settings 
            size={24} 
            className="text-metallicBlack dark:text-white" 
          />
        </motion.button>

        {/* Settings Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-metallicBlack rounded-xl shadow-2xl border border-gray/20 dark:border-gray/30 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="bg-smokeWhite dark:bg-gray/20 px-4 py-3 border-b border-gray/20 dark:border-gray/30">
                  <h3 className="font-bold text-metallicBlack dark:text-white flex items-center">
                    <Settings size={18} className="mr-2" />
                    Settings
                  </h3>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                  {/* App Mode */}
                  <div>
                    <label className="text-sm font-semibold text-metallicBlack dark:text-white flex items-center mb-3">
                      <Palette size={16} className="mr-2 text-lightBlue" />
                      Application Mode
                    </label>
                    <div className="space-y-2">
                      <ModeOption
                        icon={<Palette size={20} />}
                        title="Demo Mode"
                        description="Try the UI without on-chain actions"
                        isActive={appMode === 'demo'}
                        onClick={() => handleModeChange('demo')}
                      />
                      <ModeOption
                        icon={<Palette size={20} />}
                        title="Creator Mode"
                        description="Standard interface for creating and trading NFTs"
                        isActive={appMode === 'creator'}
                        onClick={() => handleModeChange('creator')}
                      />
                      <ModeOption
                        icon={<Code size={20} />}
                        title="Developer Mode"
                        description="Advanced tools for testing and debugging"
                        isActive={appMode === 'developer'}
                        onClick={() => handleModeChange('developer')}
                        badge="Advanced"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Developer Mode Warning Modal */}
      <DevModeWarningModal
        isOpen={showDevWarning}
        onConfirm={handleDevModeConfirm}
        onCancel={() => setShowDevWarning(false)}
      />
    </>
  );
}

interface ModeOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
}

function ModeOption({ icon, title, description, isActive, onClick, badge }: ModeOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg border-2 transition-all text-left
        ${isActive 
          ? 'border-lightBlue bg-lightBlue/10 dark:bg-lightBlue/20' 
          : 'border-gray/20 dark:border-gray/30 hover:border-lightBlue/50'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`mt-0.5 ${isActive ? 'text-lightBlue' : 'text-gray'}`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className={`font-semibold ${
                isActive 
                  ? 'text-lightBlue' 
                  : 'text-metallicBlack dark:text-white'
              }`}>
                {title}
              </h4>
              {badge && (
                <span className="text-xs px-2 py-0.5 bg-yellow-500 text-black rounded-full font-bold">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">
              {description}
            </p>
          </div>
        </div>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-2"
          >
            <Check size={20} className="text-lightBlue" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

