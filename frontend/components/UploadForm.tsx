'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UploadForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNFT, isWalletConnected } = useStore();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (!isWalletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!name || !description || !imagePreview) {
      alert('Please fill all fields and upload an image!');
      return;
    }

    setIsLoading(true);

    // Simulate minting delay
    setTimeout(() => {
      addNFT({
        name,
        description,
        image: imagePreview,
        isListed: false,
      });

      setIsLoading(false);
      setShowSuccess(true);

      // Reset form
      setName('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-gray/20">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-metallicBlack font-semibold mb-2">
            Upload Image (PNG or JPEG)
          </label>

          {!imagePreview ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray/30 rounded-lg p-12 text-center cursor-pointer hover:border-lightBlue transition-colors"
            >
              <Upload className="mx-auto mb-4 text-gray" size={48} />
              <p className="text-gray">Click to upload or drag and drop</p>
              <p className="text-gray text-sm mt-2">PNG or JPEG (MAX. 10MB)</p>
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
          <label className="block text-metallicBlack font-semibold mb-2">
            NFT Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter NFT name"
            className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-metallicBlack font-semibold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT"
            rows={4}
            className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue resize-none"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            isLoading
              ? 'bg-gray cursor-not-allowed'
              : 'bg-lightBlue hover:bg-blue'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Minting...
            </span>
          ) : (
            'Mint NFT'
          )}
        </motion.button>
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
              className="bg-white rounded-xl p-8 max-w-md text-center border border-gray/20 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              </motion.div>
              <h2 className="text-2xl font-bold text-metallicBlack mb-2">
                NFT Minted Successfully!
              </h2>
              <p className="text-gray mb-6">
                Your NFT has been created and added to your dashboard
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

