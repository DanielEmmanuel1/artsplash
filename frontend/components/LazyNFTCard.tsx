'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import NFTCard from './NFTCard';
import { NFT } from '@/lib/store';

interface LazyNFTCardProps {
  nft: NFT;
  onAction?: (nftId: string) => void;
  actionLabel?: string;
  showPrice?: boolean;
  showListedTag?: boolean;
  index?: number;
}

export default function LazyNFTCard({
  nft,
  onAction,
  actionLabel,
  showPrice,
  showListedTag,
  index = 0,
}: LazyNFTCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before the element enters viewport
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef} className="min-h-[400px]">
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * (index % 10) }} // Stagger animation for first 10
        >
          <NFTCard
            nft={nft}
            onAction={onAction}
            actionLabel={actionLabel}
            showPrice={showPrice}
            showListedTag={showListedTag}
          />
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-gray/20 rounded-xl shadow-md overflow-hidden border border-gray/10 dark:border-gray/30 h-[400px] animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray/40" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 dark:bg-gray/40 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray/40 rounded mb-4 w-3/4" />
            <div className="h-8 bg-gray-200 dark:bg-gray/40 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

