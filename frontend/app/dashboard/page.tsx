'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useWallet } from '@/lib/wallet/useWallet';
import DashboardGrid from '@/components/DashboardGrid';
import { useRouter } from 'next/navigation';
import { useBalance, useReadContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { useEffect, useState } from 'react';
import { CONTRACTS, NFT_ABI } from '@/lib/contracts';
import { wagmiConfig } from '@/lib/wallet/config';

export default function DashboardPage() {
  const { userNFTs } = useStore();
  const { connected, address } = useWallet();
  const router = useRouter();
  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
  });
  
  // Fetch total NFTs minted from blockchain
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.NFT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'totalSupply',
  });
  
  const [balanceDisplay, setBalanceDisplay] = useState('0.00');
  const [totalMinted, setTotalMinted] = useState('0');
  const [myOwnedCount, setMyOwnedCount] = useState(0);

  useEffect(() => {
    if (balance) {
      setBalanceDisplay(parseFloat(balance.formatted).toFixed(4));
    }
  }, [balance]);

  useEffect(() => {
    if (totalSupply !== undefined) {
      setTotalMinted(totalSupply.toString());
    }
  }, [totalSupply]);

  // Calculate how many NFTs the connected wallet owns (on-chain)
  useEffect(() => {
    const loadOwned = async () => {
      try {
        if (!address || totalSupply === undefined) {
          setMyOwnedCount(0);
          return;
        }
        const supply = Number(totalSupply);
        if (supply === 0) {
          setMyOwnedCount(0);
          return;
        }
        // Scan recent tokenIds (cap to first 200 tokens for performance)
        const maxScan = Math.min(supply, 200);
        const tokenIds = Array.from({ length: maxScan }, (_, i) => i + 1);
        const owners = await Promise.all(
          tokenIds.map((id) =>
            readContract(wagmiConfig, {
              address: CONTRACTS.NFT_ADDRESS as `0x${string}`,
              abi: NFT_ABI,
              functionName: 'ownerOf',
              args: [BigInt(id)],
            }).catch(() => undefined)
          )
        );
        const count = owners.reduce((acc, owner) => {
          if (!owner) return acc;
          return acc + (String(owner).toLowerCase() === String(address).toLowerCase() ? 1 : 0);
        }, 0);
        setMyOwnedCount(count);
      } catch {
        setMyOwnedCount(0);
      }
    };
    loadOwned();
  }, [address, totalSupply]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray/20 rounded-xl p-12 text-center max-w-md shadow-xl border border-transparent dark:border-gray/30"
        >
          <h2 className="text-3xl font-bold text-blue dark:text-lightBlue mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray dark:text-smokeWhite mb-8">
            Please connect your wallet to view your dashboard and manage your NFTs
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="bg-lightBlue text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors font-medium"
          >
            Go to Home
          </motion.button>
        </motion.div>
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
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-metallicBlack dark:text-white mb-4">
            My Dashboard
          </h1>
          <p className="text-gray dark:text-smokeWhite text-lg">
            Manage your NFT collection and listings
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          {/* Wallet Balance */}
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold text-lightBlue">
              {balanceDisplay}
            </p>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">AVAX</p>
          </div>
          
          {/* Total NFTs Minted (Blockchain) - NEW */}
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Total Minted</p>
            <p className="text-3xl font-bold text-green-500">
              {totalMinted}
            </p>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">On-Chain</p>
          </div>
          
          {/* My NFTs (On-Chain) */}
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">My NFTs</p>
            <p className="text-3xl font-bold text-lightBlue">
              {myOwnedCount}
            </p>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">Owned (On-Chain)</p>
          </div>
          
          {/* Listed for Sale */}
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Listed for Sale</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs.filter((nft) => nft.isListed).length}
            </p>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">Active</p>
          </div>
          
          {/* Total Value */}
          <div className="bg-white dark:bg-gray/20 rounded-lg p-6 shadow-md border border-transparent dark:border-gray/30">
            <p className="text-gray dark:text-smokeWhite text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-lightBlue">
              {userNFTs
                .filter((nft) => nft.isListed)
                .reduce((sum, nft) => sum + (nft.price || 0), 0)
                .toFixed(2)}
            </p>
            <p className="text-xs text-gray dark:text-smokeWhite mt-1">AVAX</p>
          </div>
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DashboardGrid />
        </motion.div>
      </div>
    </div>
  );
}

