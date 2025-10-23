'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import LazyNFTCard from '@/components/LazyNFTCard';
import { scanMarketplaceListings, buyNFT, type MarketplaceListing } from '@/lib/marketplace';
import { areContractsDeployed } from '@/lib/contracts';
import { useWallet } from '@/lib/wallet/useWallet';
import { Loader2 } from 'lucide-react';
import { NFT } from '@/lib/store';

export default function ExplorePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyingNftId, setBuyingNftId] = useState<string | null>(null);
  const { connected } = useWallet();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const result = await scanMarketplaceListings();
      setListings(result);
      setLoading(false);
    };

    fetchListings();

    // Listen for listing-created events to refresh automatically
    const onListingCreated = () => fetchListings();
    if (typeof window !== 'undefined') {
      window.addEventListener('listing-created', onListingCreated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('listing-created', onListingCreated);
      }
    };
  }, []);

  const handleBuyClick = async (nft: NFT) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!areContractsDeployed()) {
      alert('Contracts not deployed yet!');
      return;
    }

    const listing = listings.find(l => l.tokenId === nft.tokenId && l.nftContract === nft.contractAddress);
    if (!listing) {
      alert('Listing not found!');
      return;
    }

    const confirmed = confirm(`Buy "${nft.name}" for ${listing.price} AVAX?`);
    if (!confirmed) return;

    setBuying(true);
    setBuyingNftId(nft.id);

    try {
      const result = await buyNFT(listing.nftContract, listing.tokenId, listing.price);

      if (result.success) {
        alert(`✅ NFT purchased successfully! Transaction: ${result.txHash}`);
        
        // Remove from listings
        setListings(prev => prev.filter(l => 
          !(l.nftContract === listing.nftContract && l.tokenId === listing.tokenId)
        ));
      } else {
        alert(`❌ Failed to buy NFT: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setBuying(false);
      setBuyingNftId(null);
    }
  };

  // Convert listings to NFT format for NFTCard
  const nfts: NFT[] = listings.map(listing => ({
    id: `${listing.nftContract}-${listing.tokenId}`,
    name: listing.name || `Token #${listing.tokenId}`,
    description: listing.description || '',
    image: listing.image || '/vercel.svg',
    price: parseFloat(listing.price),
    owner: listing.seller,
    isListed: true,
    createdAt: new Date(),
    tokenId: listing.tokenId,
    contractAddress: listing.nftContract,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightBlue mx-auto mb-4"></div>
          <p className="text-gray dark:text-smokeWhite">Scanning marketplace...</p>
          <p className="text-sm text-gray dark:text-smokeWhite mt-2">Loading active listings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack dark:text-white mb-4">
            Explore NFTs
          </h1>
          <p className="text-gray dark:text-smokeWhite text-lg">
            Discover unique digital art from creators around the world
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 text-center shadow-md border border-transparent dark:border-gray/30">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {nfts.length}
            </p>
            <p className="text-gray dark:text-smokeWhite text-sm">Active Listings</p>
          </div>
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 text-center shadow-md border border-transparent dark:border-gray/30">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {new Set(nfts.map((nft) => nft.owner)).size}
            </p>
            <p className="text-gray dark:text-smokeWhite text-sm">Sellers</p>
          </div>
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 text-center shadow-md border border-transparent dark:border-gray/30">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {nfts.length > 0 ? (nfts.reduce((sum, nft) => sum + (nft.price || 0), 0) / nfts.length).toFixed(2) : '0.00'}
            </p>
            <p className="text-gray dark:text-smokeWhite text-sm">Avg. Price (AVAX)</p>
          </div>
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 text-center shadow-md border border-transparent dark:border-gray/30">
            <p className="text-3xl font-bold text-lightBlue mb-1">
              {nfts.length > 0 ? Math.min(...nfts.map(n => n.price || 0)).toFixed(2) : '0.00'}
            </p>
            <p className="text-gray dark:text-smokeWhite text-sm">Floor Price (AVAX)</p>
          </div>
        </motion.div>

        {/* NFT Grid */}
        {nfts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray dark:text-smokeWhite text-lg mb-4">
              {areContractsDeployed() 
                ? 'No NFTs listed on the marketplace yet' 
                : 'Contracts not deployed - marketplace unavailable'}
            </p>
            <motion.a
              href="/mint"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
            >
              Mint & List Your NFT
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {nfts.map((nft, index) => (
              <div key={nft.id} className="relative">
                <LazyNFTCard
                  nft={nft}
                  onAction={buying && buyingNftId === nft.id ? undefined : () => handleBuyClick(nft)}
                  actionLabel={buying && buyingNftId === nft.id ? 'Buying...' : 'Buy Now'}
                  showPrice={true}
                  showListedTag={false} // Don't show "Listed" tag on marketplace page
                  index={index}
                />
                {buying && buyingNftId === nft.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Refresh Button */}
        {areContractsDeployed() && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                setLoading(true);
                const result = await scanMarketplaceListings();
                setListings(result);
                setLoading(false);
              }}
              className="bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
            >
              🔄 Refresh Listings
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
