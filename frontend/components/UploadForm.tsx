'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useWallet } from '@/lib/wallet/useWallet';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { mintNFT, validateMintRequirements, type MintStatus } from '@/lib/mint';
import { validateImageFile, ipfsToHttp } from '@/lib/ipfs';
import { areContractsDeployed, getDeploymentInstructions } from '@/lib/contracts';

export default function UploadForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNFT } = useStore();
  const { connected, address } = useWallet();
  const router = useRouter();
  
  const contractsDeployed = areContractsDeployed();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Invalid file');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMintStatus(null);

    // Validate requirements
    const validation = validateMintRequirements(imageFile, name, description, connected);
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    if (!address || !imageFile) return;

    setIsLoading(true);

    try {
      // Real blockchain minting
      const result = await mintNFT(
        imageFile,
        name,
        description,
        address,
        (status) => {
          setMintStatus(status);
          if (status.txHash) {
            setTxHash(status.txHash);
          }
          if (status.tokenId) {
            setTokenId(status.tokenId);
          }
        }
      );

      if (result.success) {
        // Add to local store (optional - for dashboard display)
        addNFT({
          name,
          description,
          image: result.imageHash ? ipfsToHttp(result.imageHash) : imagePreview!,
          isListed: false,
          tokenId: result.tokenId,
          txHash: result.txHash,
        });

        setShowSuccess(true);
        
        // Reset form
        setTimeout(() => {
          setName('');
          setDescription('');
          setImageFile(null);
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setMintStatus(null);
        }, 1000);
      } else {
        setError(result.error || 'Minting failed');
      }
    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Contract Deployment Warning */}
      {!contractsDeployed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                Contracts Not Deployed
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                Smart contracts haven't been deployed yet. For now, you can test the UI with mock mode.
                See <code className="bg-yellow-500/20 px-1 rounded">CONTRACTS_SETUP.md</code> for deployment instructions.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray/20 rounded-xl shadow-lg p-8 border border-gray/20 dark:border-gray/30">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-metallicBlack dark:text-white font-semibold mb-2">
            Upload Image (PNG or JPEG)
          </label>

          {!imagePreview ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray/30 dark:border-gray/40 rounded-lg p-12 text-center cursor-pointer hover:border-lightBlue transition-colors bg-smokeWhite/50 dark:bg-metallicBlack/50"
            >
              <Upload className="mx-auto mb-4 text-gray dark:text-smokeWhite" size={48} />
              <p className="text-gray dark:text-smokeWhite">Click to upload or drag and drop</p>
              <p className="text-gray dark:text-smokeWhite text-sm mt-2">PNG or JPEG (MAX. 10MB)</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-lg overflow-hidden"
            >
              <Image
                src={imagePreview}
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* NFT Name */}
        <div className="mb-6">
          <label className="block text-metallicBlack dark:text-white font-semibold mb-2">
            NFT Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter NFT name"
            className="w-full px-4 py-3 border border-gray/30 dark:border-gray/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue bg-white dark:bg-metallicBlack/50 text-metallicBlack dark:text-white placeholder-gray/50 dark:placeholder-smokeWhite/50"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-metallicBlack dark:text-white font-semibold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT"
            rows={4}
            className="w-full px-4 py-3 border border-gray/30 dark:border-gray/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue resize-none bg-white dark:bg-metallicBlack/50 text-metallicBlack dark:text-white placeholder-gray/50 dark:placeholder-smokeWhite/50"
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
          >
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Minting Status */}
        {mintStatus && isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-lightBlue/10 border border-lightBlue/30 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Loader2 className="text-lightBlue flex-shrink-0 animate-spin mt-1" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-blue dark:text-lightBlue mb-1">
                  {mintStatus.stage === 'uploading' && '📦 Uploading to IPFS...'}
                  {mintStatus.stage === 'creating-metadata' && '📄 Creating metadata...'}
                  {mintStatus.stage === 'minting' && '⛓️ Minting on blockchain...'}
                  {mintStatus.stage === 'complete' && '✅ Complete!'}
                </p>
                <p className="text-sm text-gray dark:text-smokeWhite">
                  {mintStatus.message}
                </p>
                {mintStatus.txHash && (
                  <a
                    href={`https://testnet.snowtrace.io/tx/${mintStatus.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-lightBlue hover:underline mt-1 inline-flex items-center"
                  >
                    View on Snowtrace <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !connected}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            isLoading || !connected
              ? 'bg-gray cursor-not-allowed'
              : 'bg-lightBlue hover:bg-blue'
          }`}
        >
          {!connected ? (
            'Connect Wallet First'
          ) : isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 animate-spin" size={20} />
              {mintStatus?.stage === 'uploading' && 'Uploading...'}
              {mintStatus?.stage === 'creating-metadata' && 'Creating Metadata...'}
              {mintStatus?.stage === 'minting' && 'Minting...'}
              {!mintStatus && 'Processing...'}
            </span>
          ) : contractsDeployed ? (
            '🚀 Mint NFT on Blockchain'
          ) : (
            '🎨 Create NFT (Demo Mode)'
          )}
        </motion.button>

        {/* Gas Estimate */}
        {connected && contractsDeployed && !isLoading && (
          <p className="text-xs text-gray dark:text-smokeWhite text-center mt-2">
            Estimated cost: ~0.01 AVAX (gas fees)
          </p>
        )}
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray/20 rounded-xl p-8 max-w-md text-center border border-gray/20 dark:border-gray/30 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              </motion.div>
              <h2 className="text-2xl font-bold text-metallicBlack dark:text-white mb-2">
                {contractsDeployed ? '🎉 NFT Minted Successfully!' : '✅ NFT Created!'}
              </h2>
              <p className="text-gray dark:text-smokeWhite mb-2">
                {contractsDeployed
                  ? 'Your NFT has been minted on the Avalanche blockchain'
                  : 'Your NFT has been created and added to your dashboard'}
              </p>
              {tokenId && (
                <p className="text-sm text-lightBlue font-mono mb-2">
                  Token ID: #{tokenId}
                </p>
              )}
              {txHash && (
                <a
                  href={`https://testnet.snowtrace.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-lightBlue hover:underline mb-6 inline-flex items-center"
                >
                  View on Snowtrace <ExternalLink size={14} className="ml-1" />
                </a>
              )}
              <div className="space-y-2 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
                >
                  Go to Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-gray/20 text-metallicBlack dark:text-white px-6 py-3 rounded-lg hover:bg-gray/30 transition-colors font-medium"
                >
                  Mint Another
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

