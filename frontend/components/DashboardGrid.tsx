'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type NFT as StoreNFT } from '@/lib/store';
import LazyNFTCard from './LazyNFTCard';
import { X, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet/useWallet';
import { useReadContract } from 'wagmi';
import { readContract, getPublicClient } from 'wagmi/actions';
import { CONTRACTS, NFT_ABI, areContractsDeployed } from '@/lib/contracts';
import { wagmiConfig } from '@/lib/wallet/config';
import { getNFTMetadata } from '@/lib/mint';
import { ipfsToHttp } from '@/lib/ipfs';
import { listNFT as listNFTOnMarketplace, getListing, cancelListing as cancelMarketplaceListing, scanSellerListings } from '@/lib/marketplace';

interface DashboardGridProps {
  onCountsUpdate?: (total: number, owned: number, listed?: number, listedValue?: number) => void;
}

export default function DashboardGrid({ onCountsUpdate }: DashboardGridProps) {
  const { userNFTs, listNFT, getOwnedCache, setOwnedCache, getSellerListingCache, setSellerListingCache } = useStore();
  const { connected, address } = useWallet();
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<StoreNFT | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [chainNFTs, setChainNFTs] = useState<StoreNFT[]>([]);
  const [loadingOnChain, setLoadingOnChain] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<StoreNFT[]>([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'listed' | 'holding'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid');

  useEffect(() => {
    const fetchOwnedOnChain = async () => {
      try {
        if (!connected || !address || !areContractsDeployed()) {
          setChainNFTs([]);
          setLoadingOnChain(false);
          return;
        }
        
        setLoadingOnChain(true);

        // Cached owned NFTs for this address (5 min TTL)
        const ownedCached = getOwnedCache(address);
        const ttlMs = 5 * 60 * 1000;
        if (ownedCached && Date.now() - ownedCached.fetchedAt < ttlMs) {
          console.log('🗃️ Using cached owned NFTs');
          setChainNFTs(ownedCached.nfts);
          const listed = ownedCached.nfts.filter(n => n.isListed).length;
          const listedValue = ownedCached.nfts.filter(n => n.isListed).reduce((s, n) => s + (n.price || 0), 0);
          if (onCountsUpdate) onCountsUpdate(ownedCached.nfts.length, ownedCached.nfts.length, listed, listedValue);
          setLoadingOnChain(false);
          return;
        }
        console.log('🔍 Scanning ALL ERC721 transfers to your wallet:', address);

        // Get the public client
        const client = getPublicClient(wagmiConfig);
        if (!client) {
          console.error('❌ No public client available');
          setChainNFTs([]);
          setLoadingOnChain(false);
          return;
        }

        // Get current block number
        const currentBlock = await client.getBlockNumber();
        console.log(`📊 Current block: ${currentBlock}`);

        // Use a simplified approach: scan recent blocks only (last 50,000 blocks = ~1-2 days on Avalanche)
        const blocksToScan = BigInt(50000);
        const startBlock = currentBlock > blocksToScan ? currentBlock - blocksToScan : BigInt(0);
        const chunkSize = BigInt(2000);
        
        console.log(`📥 Scanning last 50k blocks (${startBlock} to ${currentBlock})...`);

        const allLogs: any[] = [];
        let chunksScanned = 0;
        const totalChunks = Number((currentBlock - startBlock) / chunkSize) + 1;
        
        // Scan in chunks
        for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
          const toBlock = fromBlock + chunkSize - BigInt(1) > currentBlock ? currentBlock : fromBlock + chunkSize - BigInt(1);
          chunksScanned++;
          
          if (chunksScanned % 5 === 0) {
            console.log(`  📊 Progress: ${chunksScanned}/${totalChunks} chunks scanned...`);
          }
          
          try {
            const logs = await client.getLogs({
              address: undefined,
              event: {
                type: 'event',
                name: 'Transfer',
                inputs: [
                  { type: 'address', indexed: true, name: 'from' },
                  { type: 'address', indexed: true, name: 'to' },
                  { type: 'uint256', indexed: true, name: 'tokenId' },
                ],
              },
              args: {
                to: address as `0x${string}`,
              },
              fromBlock,
              toBlock,
            });
            
            if (logs.length > 0) {
              console.log(`  ✅ Found ${logs.length} transfers in blocks ${fromBlock}-${toBlock}`);
              allLogs.push(...logs);
            }
          } catch (chunkError: any) {
            console.warn(`⚠️  Error scanning blocks ${fromBlock}-${toBlock}:`, chunkError?.message);
          }
        }

        console.log(`📥 Scan complete! Found ${allLogs.length} ERC721 transfers to your wallet`);
        const logs = allLogs;

        // Extract unique contract + tokenId pairs
        const nftMap = new Map<string, { contract: string; tokenId: bigint }>();
        
        for (const log of logs) {
          const contractAddress = log.address;
          const tokenId = log.topics[3]; // tokenId is in topic3
          
          if (tokenId) {
            const tokenIdNum = BigInt(tokenId);
            const key = `${contractAddress}-${tokenIdNum}`;
            nftMap.set(key, { contract: contractAddress, tokenId: tokenIdNum });
          }
        }

        console.log(`🎯 Found ${nftMap.size} unique NFTs transferred to you`);

        // Now verify current ownership, fetch metadata, and check listing status
        const nfts: StoreNFT[] = [];
        
        for (const [key, { contract, tokenId }] of nftMap.entries()) {
          try {
            // Check if we still own it AND if the contract exists
            const owner = await readContract(wagmiConfig, {
              address: contract as `0x${string}`,
              abi: NFT_ABI,
              functionName: 'ownerOf',
              args: [tokenId],
            });

            if (String(owner).toLowerCase() !== String(address).toLowerCase()) {
              console.log(`⏭️  Skipping ${contract}:${tokenId} - no longer owned`);
              continue;
            }

            console.log(`✅ You own ${contract}:${tokenId}`);

            // Get token URI
            const uri = await readContract(wagmiConfig, {
              address: contract as `0x${string}`,
              abi: NFT_ABI,
              functionName: 'tokenURI',
              args: [tokenId],
            }).catch(() => undefined);

            if (!uri || typeof uri !== 'string') {
              console.warn(`⚠️  No URI for ${contract}:${tokenId}`);
              continue;
            }

            // Fetch metadata
            const meta = await getNFTMetadata(uri);
            
            // Only include if it's an Artistic Splash NFT (check metadata or contract)
            const isArtisticSplash = 
              meta?.name?.includes('Artistic Splash') ||
              meta?.attributes?.some((attr: any) => 
                attr.trait_type === 'Platform' && attr.value === 'Artistic Splash'
              ) ||
              contract.toLowerCase() === CONTRACTS.NFT_ADDRESS.toLowerCase();

            if (!isArtisticSplash) {
              console.log(`⏭️  Skipping ${contract}:${tokenId} - not Artistic Splash`);
              continue;
            }

            const imageUrl = meta?.image ? ipfsToHttp(meta.image) : '/vercel.svg';
            
            // Check if listed on marketplace
            const listing = await getListing(contract, Number(tokenId));
            const isListed = listing !== null;
            const price = listing?.price ? parseFloat(listing.price) : undefined;

            nfts.push({
              id: `${contract}-${tokenId}`,
              name: meta?.name || `Token #${tokenId}`,
              description: meta?.description || '',
              image: imageUrl,
              isListed,
              price,
              owner: address as string,
              createdAt: new Date(),
              tokenId: Number(tokenId),
              contractAddress: contract,
            } as StoreNFT);

            console.log(`✨ Added: ${meta?.name || `Token #${tokenId}`}${isListed ? ` (Listed for ${price} AVAX)` : ''}`);
          } catch (err: any) {
            console.warn(`⚠️  Error checking ${contract}:${tokenId}:`, err?.message || err);
            console.log(`⏭️  Skipping - contract may not exist on this network`);
            // Skip NFTs from non-existent contracts
            continue;
          }
        }

        console.log(`🎉 Final result: ${nfts.length} Artistic Splash NFTs`);
        setChainNFTs(nfts);
        setOwnedCache(address, nfts);

        // Update parent component with counts
        const listed = nfts.filter(n => n.isListed).length;
        const listedValue = nfts.filter(n => n.isListed).reduce((s, n) => s + (n.price || 0), 0);
        if (onCountsUpdate) {
          onCountsUpdate(nfts.length, nfts.length, listed, listedValue);
        }
      } catch (e) {
        console.error('Error fetching on-chain NFTs:', e);
        setChainNFTs([]);
        if (onCountsUpdate) {
          onCountsUpdate(0, 0, 0, 0);
        }
      } finally {
        setLoadingOnChain(false);
      }
    };
    fetchOwnedOnChain();
  }, [connected, address]); // onCountsUpdate is stable, no need in deps

  const combinedNFTs = useMemo(() => {
    // When contracts are deployed, ONLY show on-chain NFTs (authoritative)
    // Local store NFTs are only used when contracts aren't deployed (demo mode)
    if (areContractsDeployed() && connected) {
      console.log('📦 Showing on-chain NFTs only:', chainNFTs.length);
      console.log('  - Token IDs:', chainNFTs.map(n => n.tokenId));
      return chainNFTs;
    }
    
    // Fallback to local store when not connected or contracts not deployed
    console.log('📦 Showing local store NFTs (demo mode):', userNFTs.length);
    return userNFTs;
  }, [userNFTs, chainNFTs, connected]);

  // Load "My Listings" (escrowed items) held by marketplace
  useEffect(() => {
    const loadMyListings = async () => {
      try {
        if (!connected || !address || !areContractsDeployed()) {
          setMyListings([]);
          return;
        }
        setLoadingMyListings(true);
        const cached = getSellerListingCache(address);
        const ttlMs = 5 * 60 * 1000;
        if (cached && Date.now() - cached.fetchedAt < ttlMs) {
          setMyListings(cached.nfts);
          return;
        }
        const listings = await scanSellerListings(address);
        // Convert to StoreNFT for display
        const mapped: StoreNFT[] = listings.map(l => ({
          id: `${l.nftContract}-${l.tokenId}-escrow`,
          name: l.name || `Token #${l.tokenId}`,
          description: l.description || '',
          image: l.image || '/vercel.svg',
          owner: address,
          isListed: true,
          price: parseFloat(l.price),
          createdAt: new Date(),
          tokenId: l.tokenId,
          contractAddress: l.nftContract,
        }));
        setMyListings(mapped);
        setSellerListingCache(address, mapped);
      } finally {
        setLoadingMyListings(false);
      }
    };
    loadMyListings();
  }, [connected, address, showSuccessModal]);

  // Recompute dashboard counts whenever owned NFTs or myListings change
  useEffect(() => {
    if (!onCountsUpdate) return;
    // Build unique set of contract-token keys across owned + listed
    const key = (n: StoreNFT) => `${n.contractAddress}-${n.tokenId}`;
    const ownedCount = chainNFTs.length;
    const listedCount = myListings.length;
    const totalCount = new Set<string>([
      ...chainNFTs.map(key),
      ...myListings.map(key),
    ]).size;
    const listedValue = myListings.reduce((s, n) => s + (n.price || 0), 0);
    onCountsUpdate(totalCount, ownedCount, listedCount, listedValue);
  }, [chainNFTs, myListings, onCountsUpdate]);

  const handleListClick = (nft: StoreNFT) => {
    // Check if NFT is from the configured contract (just for informational purposes)
    const isFromConfiguredContract = 
      !nft.contractAddress || 
      nft.contractAddress.toLowerCase() === CONTRACTS.NFT_ADDRESS.toLowerCase();
    
    if (!isFromConfiguredContract && areContractsDeployed()) {
      const confirmed = confirm(
        `ℹ️ NOTE: This NFT is from a different contract\n\n` +
        `NFT Contract: ${nft.contractAddress}\n` +
        `Main Contract: ${CONTRACTS.NFT_ADDRESS}\n\n` +
        `This is OK! The marketplace supports NFTs from ANY contract.\n\n` +
        `This probably happened because:\n` +
        `• You minted this NFT before contracts were redeployed\n` +
        `• You imported an NFT from elsewhere\n\n` +
        `The marketplace will:\n` +
        `1. Transfer this NFT to escrow\n` +
        `2. List it for sale\n` +
        `3. Return it to you if delisted, or transfer to buyer if sold\n\n` +
        `Continue with listing?`
      );
      
      if (!confirmed) return;
    }
    
    setSelectedNFT(nft);
    setShowListModal(true);
  };

  const handleDelistClick = async (nft: StoreNFT) => {
    if (!areContractsDeployed()) {
      alert('Contracts not deployed!');
      return;
    }

    const confirmed = confirm(`Delist "${nft.name}" from the marketplace?`);
    if (!confirmed) return;

    setIsListing(true);

    try {
      const result = await cancelMarketplaceListing(
        nft.contractAddress || CONTRACTS.NFT_ADDRESS,
        nft.tokenId || 0
      );

      if (result.success) {
        alert(`✅ NFT delisted successfully! Transaction: ${result.txHash}`);
        
        // Update local state to show as not listed
        setChainNFTs(prev => prev.map(n => 
          n.id === nft.id 
            ? { ...n, isListed: false, price: undefined }
            : n
        ));
      } else {
        alert(`❌ Failed to delist NFT: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsListing(false);
    }
  };

  const handleListConfirm = async () => {
    if (!selectedNFT || !listingPrice || parseFloat(listingPrice) <= 0) {
      alert('Please enter a valid price!');
      return;
    }

    setIsListing(true);

    try {
      const result = await listNFTOnMarketplace(
        selectedNFT.contractAddress || CONTRACTS.NFT_ADDRESS,
        selectedNFT.tokenId || 0,
        listingPrice
      );

      if (result.success) {
        // Success modal
        setSuccessTxHash(result.txHash || null);
        setShowSuccessModal(true);

        // Update local state to show as listed and update counts
        setChainNFTs(prev => {
          const updated = prev.map(nft => 
            nft.id === selectedNFT.id 
              ? { ...nft, isListed: true, price: parseFloat(listingPrice) }
              : nft
          );
          const listed = updated.filter(n => n.isListed).length;
          const listedValue = updated.filter(n => n.isListed).reduce((s, n) => s + (n.price || 0), 0);
          if (onCountsUpdate) {
            onCountsUpdate(updated.length, updated.length, listed, listedValue);
          }
          return updated;
        });
        
        // Also update local store for demo mode
        listNFT(selectedNFT.id, parseFloat(listingPrice));
        
        // Notify marketplace page to refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('listing-created'));
        }

        setShowListModal(false);
        setSelectedNFT(null);
        setListingPrice('');
      } else {
        alert(`❌ Failed to list NFT: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsListing(false);
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setSelectedNFT(null);
    setListingPrice('');
  };

  // Compute displayed NFTs by filter
  const displayedNFTs = useMemo(() => {
    if (filterMode === 'listed') return myListings;
    if (filterMode === 'holding') return combinedNFTs;
    return [...combinedNFTs, ...myListings];
  }, [filterMode, combinedNFTs, myListings]);
  const isEmpty = displayedNFTs.length === 0;

  return (
    <>
      {loadingOnChain ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightBlue mx-auto mb-4"></div>
          <p className="text-gray dark:text-smokeWhite">Scanning blockchain for your NFTs...</p>
          <p className="text-sm text-gray dark:text-smokeWhite mt-2">This may take a moment</p>
        </div>
      ) : (
        <>
      {/* Filters & View toggles */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="inline-flex bg-white dark:bg-gray/20 border border-gray/30 dark:border-gray/50 rounded-lg overflow-hidden">
          <button onClick={() => setFilterMode('all')} className={`px-4 py-2 text-sm ${filterMode === 'all' ? 'bg-lightBlue text-white' : 'text-metallicBlack dark:text-smokeWhite'}`}>All</button>
          <button onClick={() => setFilterMode('listed')} className={`px-4 py-2 text-sm border-l border-gray/30 dark:border-gray/50 ${filterMode === 'listed' ? 'bg-lightBlue text-white' : 'text-metallicBlack dark:text-smokeWhite'}`}>Listed</button>
          <button onClick={() => setFilterMode('holding')} className={`px-4 py-2 text-sm border-l border-gray/30 dark:border-gray/50 ${filterMode === 'holding' ? 'bg-lightBlue text-white' : 'text-metallicBlack dark:text-smokeWhite'}`}>Holding</button>
        </div>
        <div className="inline-flex bg-white dark:bg-gray/20 border border-gray/30 dark:border-gray/50 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-lightBlue text-white' : 'text-metallicBlack dark:text-smokeWhite'}`}>Grid</button>
          <button onClick={() => setViewMode('details')} className={`px-4 py-2 text-sm border-l border-gray/30 dark:border-gray/50 ${viewMode === 'details' ? 'bg-lightBlue text-white' : 'text-metallicBlack dark:text-smokeWhite'}`}>Details</button>
        </div>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-gray dark:text-smokeWhite text-lg mb-4">
            {connected ? 'No NFTs found for this wallet yet' : "You haven't minted any NFTs yet"}
          </p>
          <motion.a
            href="/mint"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
          >
            Mint Your First NFT
          </motion.a>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {displayedNFTs.map((nft, index) => {
          const isEscrow = nft.id.includes('-escrow');
          const actionLabel = isEscrow ? 'Delist' : (nft.isListed ? undefined : 'List for Sale');
          const onAction = isEscrow ? () => handleDelistClick(nft) : (nft.isListed ? undefined : () => handleListClick(nft));
          const showPrice = isEscrow || nft.isListed;
          const showListedTag = isEscrow || nft.isListed;
          return (
            <LazyNFTCard
              key={nft.id}
              nft={nft}
              onAction={onAction}
              actionLabel={actionLabel}
              showPrice={showPrice}
              showListedTag={showListedTag}
              index={index}
            />
          );
        })}
      </motion.div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray/20 border border-gray/30 dark:border-gray/50 rounded-lg">
          <table className="min-w-full divide-y divide-gray/20 dark:divide-gray/50">
            <thead>
              <tr className="text-left text-sm text-gray dark:text-smokeWhite">
                <th className="px-4 py-3">NFT</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Contract</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/20 dark:divide-gray/50">
              {displayedNFTs.map((nft) => {
                const isEscrow = nft.id.includes('-escrow');
                return (
                  <tr key={nft.id} className="text-sm text-metallicBlack dark:text-white">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={nft.image} alt={nft.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <div className="font-medium">{nft.name}</div>
                        <div className="text-xs text-gray dark:text-smokeWhite line-clamp-1">{nft.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">#{nft.tokenId}</td>
                    <td className="px-4 py-3 text-xs break-all">{nft.contractAddress}</td>
                    <td className="px-4 py-3">{isEscrow ? 'Listed (Escrow)' : 'Holding'}</td>
                    <td className="px-4 py-3">{(nft.price ?? 0).toString()} {isEscrow ? 'AVAX' : ''}</td>
                    <td className="px-4 py-3">
                      {isEscrow ? (
                        <button onClick={() => handleDelistClick(nft)} className="px-3 py-1 rounded bg-silver hover:bg-gray text-black">Delist</button>
                      ) : (
                        <button onClick={() => handleListClick(nft)} className="px-3 py-1 rounded bg-lightBlue hover:bg-blue text-white">List</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* My Listings (Escrow) - removed per request; listed items visible via filter */}
      </>
      )}

      {/* List NFT Modal */}
      <AnimatePresence>
        {showListModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-metallicBlack rounded-xl p-8 max-w-md w-full border border-gray/30 dark:border-gray/50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-metallicBlack dark:text-white">List NFT for Sale</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray dark:text-smokeWhite hover:text-metallicBlack transition-colors"
                  disabled={isListing}
                >
                  <X size={24} />
                </button>
              </div>

              {selectedNFT && (
                <div className="mb-6 p-4 bg-smokeWhite dark:bg-gray/10 rounded-lg border border-gray/20 dark:border-gray/50">
                  <p className="text-sm text-gray dark:text-smokeWhite mb-1">Listing NFT:</p>
                  <p className="text-lg font-semibold text-metallicBlack dark:text-white">{selectedNFT.name}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-metallicBlack dark:text-smokeWhite font-semibold mb-2">
                  Price (AVAX)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="Enter price in AVAX"
                  disabled={isListing}
                  className="w-full px-4 py-3 border border-gray/30 dark:border-gray/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue bg-white dark:bg-gray/10 text-metallicBlack dark:text-white placeholder:text-gray/60 dark:placeholder:text-gray/50"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: isListing ? 1 : 1.05 }}
                  whileTap={{ scale: isListing ? 1 : 0.95 }}
                  onClick={handleCloseModal}
                  disabled={isListing}
                  className="flex-1 bg-silver text-black px-6 py-3 rounded-lg hover:bg-gray transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: isListing ? 1 : 1.05 }}
                  whileTap={{ scale: isListing ? 1 : 0.95 }}
                  onClick={handleListConfirm}
                  disabled={isListing}
                  className="flex-1 bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isListing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Listing...
                    </>
                  ) : (
                    'List NFT'
                  )}
                </motion.button>
              </div>

              <p className="text-xs text-gray dark:text-smokeWhite mt-4 text-center">
                This will require 2 transactions: approval + listing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-metallicBlack rounded-xl p-8 max-w-md w-full border border-gray/30 dark:border-gray/50 shadow-2xl"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-metallicBlack dark:text-white mb-2">Listing Created</h3>
                <p className="text-gray dark:text-smokeWhite">Your NFT was listed successfully.</p>
              </div>
              {successTxHash && (
                <div className="mb-4 p-3 rounded-lg bg-smokeWhite dark:bg-gray/10 border border-gray/20 dark:border-gray/50">
                  <p className="text-sm text-gray dark:text-smokeWhite mb-1">Transaction:</p>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${successTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lightBlue hover:text-blue break-all"
                  >
                    {successTxHash}
                  </a>
                </div>
              )}
              <div className="flex gap-3">
                <motion.a
                  href="/explore"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 text-center bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
                >
                  View Marketplace
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-silver text-black px-6 py-3 rounded-lg hover:bg-gray transition-colors font-medium"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
