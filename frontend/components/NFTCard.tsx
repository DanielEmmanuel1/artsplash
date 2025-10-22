'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { NFT } from '@/lib/store';

interface NFTCardProps {
  nft: NFT;
  onAction?: (nftId: string) => void;
  actionLabel?: string;
  showPrice?: boolean;
}

export default function NFTCard({
  nft,
  onAction,
  actionLabel = 'View',
  showPrice = true,
}: NFTCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray/10 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-64 w-full bg-smokeWhite">
        <Image
          src={nft.image}
          alt={nft.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-metallicBlack mb-2 truncate">
          {nft.name}
        </h3>
        <p className="text-gray text-sm mb-3 line-clamp-2 leading-relaxed">
          {nft.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            {showPrice && nft.price && (
              <p className="text-lightBlue font-bold text-lg">
                {nft.price} AVAX
              </p>
            )}
            <p className="text-gray text-xs">
              Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
            </p>
          </div>

          {onAction && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(nft.id)}
              className="bg-lightBlue text-white px-4 py-2 rounded-lg hover:bg-blue transition-colors duration-200 font-medium text-sm"
            >
              {actionLabel}
            </motion.button>
          )}
        </div>

        {nft.isListed && (
          <div className="mt-2">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Listed
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

