'use client';

import { motion } from 'framer-motion';
import { useWallet } from '@/lib/wallet/useWallet';
import { getExplorerAddressUrl, getExplorerTxUrl } from '@/lib/wallet/chains';
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton';
import { CheckCircle, XCircle, AlertCircle, Wallet, Network, Code } from 'lucide-react';
import { useState } from 'react';

export default function TestWalletPage() {
  const {
    connected,
    connecting,
    address,
    chainId,
    isCorrectNetwork,
    isAvalanche,
    isFuji,
    isMainnet,
    walletClient,
    connectors,
    switchToFuji,
    switchToMainnet,
    disconnect,
  } = useWallet();

  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handleSwitchToFuji = async () => {
    setSwitching(true);
    setSwitchError(null);
    try {
      const success = await switchToFuji();
      if (!success) {
        setSwitchError('Failed to switch to Fuji. Please try manually in your wallet.');
      }
    } catch (error: any) {
      setSwitchError(error.message || 'Failed to switch network');
    } finally {
      setSwitching(false);
    }
  };

  const handleSwitchToMainnet = async () => {
    setSwitching(true);
    setSwitchError(null);
    try {
      const success = await switchToMainnet();
      if (!success) {
        setSwitchError('Failed to switch to Mainnet. Please try manually in your wallet.');
      }
    } catch (error: any) {
      setSwitchError(error.message || 'Failed to switch network');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="min-h-screen bg-smokeWhite py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack mb-4">
            🧪 Wallet Adapter Test Page
          </h1>
          <p className="text-gray text-lg">
            Test all wallet connection and network switching functionality
          </p>
        </motion.div>

        {/* Connect Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-8 shadow-lg border border-gray/20 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-metallicBlack mb-2">Connection Status</h2>
              <p className="text-gray">
                {connected ? 'Wallet is connected' : 'Connect your wallet to get started'}
              </p>
            </div>
            <ConnectWalletButton className="w-48" />
          </div>

          {connecting && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">🔄 Connecting...</p>
            </div>
          )}
        </motion.div>

        {/* Wallet Info */}
        {connected && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray/20 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Wallet className="text-lightBlue" size={28} />
                <h2 className="text-2xl font-bold text-metallicBlack">Wallet Information</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray">Address:</span>
                  <span className="font-mono text-metallicBlack font-semibold">{address}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray">Chain ID:</span>
                  <span className="font-mono text-metallicBlack font-semibold">{chainId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray">Wallet Client:</span>
                  {walletClient ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )}
                </div>

                {address && chainId && (
                  <div className="mt-4">
                    <a
                      href={getExplorerAddressUrl(chainId, address) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lightBlue hover:underline text-sm"
                    >
                      View on Snowtrace →
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Network Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray/20 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Network className="text-lightBlue" size={28} />
                <h2 className="text-2xl font-bold text-metallicBlack">Network Status</h2>
              </div>

              <div className="space-y-4">
                <StatusRow label="Correct Network" status={isCorrectNetwork} />
                <StatusRow label="Is Avalanche" status={isAvalanche} />
                <StatusRow label="Is Fuji Testnet" status={isFuji} />
                <StatusRow label="Is Mainnet" status={isMainnet} />
              </div>

              {/* Network Switch Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSwitchToFuji}
                  disabled={switching || isFuji}
                  className="w-full bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {switching ? 'Switching...' : isFuji ? '✓ On Fuji' : 'Switch to Fuji Testnet'}
                </button>

                <button
                  onClick={handleSwitchToMainnet}
                  disabled={switching || isMainnet}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {switching ? 'Switching...' : isMainnet ? '✓ On Mainnet' : 'Switch to Mainnet'}
                </button>

                {switchError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{switchError}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Available Connectors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray/20 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Code className="text-lightBlue" size={28} />
                <h2 className="text-2xl font-bold text-metallicBlack">Available Connectors</h2>
              </div>

              <div className="space-y-3">
                {connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className="flex justify-between items-center p-4 bg-smokeWhite rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-metallicBlack">{connector.name}</p>
                      <p className="text-sm text-gray">ID: {connector.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-8 shadow-lg border border-gray/20"
        >
          <h2 className="text-2xl font-bold text-metallicBlack mb-4">Test Instructions</h2>
          <ol className="space-y-3 text-gray">
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">1.</span>
              <span>Click "Connect Wallet" and select a wallet from the modal</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">2.</span>
              <span>Approve the connection request in your wallet</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">3.</span>
              <span>Check the wallet information and network status displayed above</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">4.</span>
              <span>Test network switching by clicking the network buttons</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">5.</span>
              <span>Click on your address in the navbar to see the account menu</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-lightBlue font-bold">6.</span>
              <span>Test disconnect functionality from the account menu</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray">{label}:</span>
      <div className="flex items-center space-x-2">
        {status ? (
          <>
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-700 font-semibold">Yes</span>
          </>
        ) : (
          <>
            <XCircle className="text-red-500" size={20} />
            <span className="text-red-700 font-semibold">No</span>
          </>
        )}
      </div>
    </div>
  );
}

