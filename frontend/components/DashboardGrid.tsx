'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type NFT as StoreNFT } from '@/lib/store';
import NFTCard from './NFTCard';
import { X } from 'lucide-react';
import { useWallet } from '@/lib/wallet/useWallet';
import { useReadContract } from 'wagmi';
import { readContract, getPublicClient } from 'wagmi/actions';
import { CONTRACTS, NFT_ABI, areContractsDeployed } from '@/lib/contracts';
import { wagmiConfig } from '@/lib/wallet/config';
import { getNFTMetadata } from '@/lib/mint';
import { ipfsToHttp } from '@/lib/ipfs';

interface DashboardGridProps {
  onCountsUpdate?: (total: number, owned: number) => void;
}

export default function DashboardGrid({ onCountsUpdate }: DashboardGridProps) {
  const { userNFTs, listNFT } = useStore();
  const { connected, address } = useWallet();
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFTId, setSelectedNFTId] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [chainNFTs, setChainNFTs] = useState<StoreNFT[]>([]);
  const [loadingOnChain, setLoadingOnChain] = useState(false);

  useEffect(() => {
    const fetchOwnedOnChain = async () => {
      try {
        if (!connected || !address || !areContractsDeployed()) {
          setChainNFTs([]);
          setLoadingOnChain(false);
          return;
        }
        
        setLoadingOnChain(true);
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

        // Now verify current ownership and fetch metadata
        const nfts: StoreNFT[] = [];
        
        for (const [key, { contract, tokenId }] of nftMap.entries()) {
          try {
            // Check if we still own it
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
            
            nfts.push({
              id: `${contract}-${tokenId}`,
              name: meta?.name || `Token #${tokenId}`,
              description: meta?.description || '',
              image: imageUrl,
              isListed: false,
              owner: address as string,
              createdAt: new Date(),
              tokenId: Number(tokenId),
              contractAddress: contract,
            } as StoreNFT);

            console.log(`✨ Added: ${meta?.name || `Token #${tokenId}`}`);
          } catch (err) {
            console.warn(`⚠️  Error checking ${contract}:${tokenId}:`, err);
          }
        }

        console.log(`🎉 Final result: ${nfts.length} Artistic Splash NFTs`);
        setChainNFTs(nfts);
        
        // Update parent component with counts
        if (onCountsUpdate) {
          onCountsUpdate(nfts.length, nfts.length);
        }
      } catch (e) {
        console.error('Error fetching on-chain NFTs:', e);
        setChainNFTs([]);
        if (onCountsUpdate) {
          onCountsUpdate(0, 0);
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

  const handleListClick = (nftId: string) => {
    setSelectedNFTId(nftId);
    setShowListModal(true);
  };

  const handleListConfirm = () => {
    if (selectedNFTId && listingPrice && parseFloat(listingPrice) > 0) {
      listNFT(selectedNFTId, parseFloat(listingPrice));
      setShowListModal(false);
      setSelectedNFTId(null);
      setListingPrice('');
    } else {
      alert('Please enter a valid price!');
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setSelectedNFTId(null);
    setListingPrice('');
  };

  if (loadingOnChain) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightBlue mx-auto mb-4"></div>
        <p className="text-gray dark:text-smokeWhite">Scanning blockchain for your NFTs...</p>
        <p className="text-sm text-gray dark:text-smokeWhite mt-2">This may take a moment</p>
      </div>
    );
  }

  if (combinedNFTs.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {combinedNFTs.map((nft, index) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NFTCard
              nft={nft}
              onAction={nft.isListed ? undefined : handleListClick}
              actionLabel={nft.isListed ? undefined : 'List for Sale'}
              showPrice={nft.isListed}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* List NFT Modal */}
      <AnimatePresence>
        {showListModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-md w-full border border-gray/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-metallicBlack">List NFT for Sale</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray hover:text-metallicBlack transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-metallicBlack font-semibold mb-2">
                  Price (AVAX)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="Enter price in AVAX"
                  className="w-full px-4 py-3 border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  className="flex-1 bg-silver text-black px-6 py-3 rounded-lg hover:bg-gray transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleListConfirm}
                  className="flex-1 bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
                >
                  List NFT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

