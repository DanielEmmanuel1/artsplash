'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Code, X } from 'lucide-react';

interface DevModeWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DevModeWarningModal({ 
  isOpen, 
  onConfirm, 
  onCancel 
}: DevModeWarningModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-metallicBlack rounded-xl p-8 max-w-md w-full border-2 border-yellow-500 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-metallicBlack dark:text-white">
                Developer Mode
              </h2>
              <p className="text-sm text-gray">Advanced features</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray hover:text-metallicBlack dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Warning Content */}
        <div className="mb-6 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-metallicBlack dark:text-smokeWhite font-medium mb-2">
              ⚠️ Warning: You are about to enable Developer Mode
            </p>
            <p className="text-sm text-gray dark:text-gray">
              This mode provides access to advanced testing and debugging tools that are intended for developers.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-metallicBlack dark:text-white flex items-center">
              <Code size={16} className="mr-2 text-lightBlue" />
              What you'll get access to:
            </h3>
            <ul className="space-y-2 ml-6 text-gray dark:text-smokeWhite">
              <li className="flex items-start">
                <span className="text-lightBlue mr-2">•</span>
                <span>Wallet testing and debugging page</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-2">•</span>
                <span>Real-time blockchain state inspection</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-2">•</span>
                <span>Network switching controls</span>
              </li>
              <li className="flex items-start">
                <span className="text-lightBlue mr-2">•</span>
                <span>Advanced wallet connector information</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              <strong>Important:</strong> Only use these features if you understand blockchain development and wallet management. Incorrect usage may lead to unexpected behavior.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 bg-gray/20 dark:bg-gray/10 text-metallicBlack dark:text-white px-6 py-3 rounded-lg hover:bg-gray/30 dark:hover:bg-gray/20 transition-colors font-medium border border-gray/30"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-lg"
          >
            I Understand, Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

