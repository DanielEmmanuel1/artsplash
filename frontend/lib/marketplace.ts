/**
 * Marketplace Utilities
 * Functions for listing, buying, and managing NFTs on the marketplace
 */

import { writeContract, waitForTransactionReceipt, readContract, getPublicClient, simulateContract, getAccount } from 'wagmi/actions';
import { wagmiConfig } from './wallet/config';
import { parseEther } from 'viem';
import { CONTRACTS, NFT_ABI, MARKETPLACE_ABI, areContractsDeployed } from './contracts';
import { getNFTMetadata } from './mint';
import { ipfsToHttp } from './ipfs';

export interface MarketplaceListing {
  nftContract: string;
  tokenId: number;
  price: string; // in AVAX
  seller: string;
  // NFT metadata
  name?: string;
  description?: string;
  image?: string;
}

/**
 * List an NFT on the marketplace
 * The marketplace uses an ESCROW system - it transfers the NFT to itself
 * Steps:
 * 1. Approve marketplace contract to transfer NFT
 * 2. Call listItem which transfers NFT to marketplace for escrow
 */
export async function listNFT(
  nftContract: string,
  tokenId: number,
  priceInAvax: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!areContractsDeployed()) {
      return { success: false, error: 'Contracts not deployed. Please deploy contracts first.' };
    }

    // Validate inputs
    if (!nftContract || nftContract === '0x0000000000000000000000000000000000000000') {
      return { success: false, error: 'Invalid NFT contract address' };
    }

    if (tokenId === undefined || tokenId === null) {
      return { success: false, error: 'Invalid token ID' };
    }

    const price = parseFloat(priceInAvax);
    if (isNaN(price) || price <= 0) {
      return { success: false, error: 'Price must be greater than 0' };
    }

    console.log('📝 Listing Details:');
    console.log('  - NFT Contract:', nftContract);
    console.log('  - Token ID:', tokenId);
    console.log('  - Price:', priceInAvax, 'AVAX');
    console.log('  - Marketplace:', CONTRACTS.MARKETPLACE_ADDRESS);
    console.log('  - ✅ Marketplace supports ANY NFT contract!');

    // Verify we still own the NFT
    console.log('\n🔍 Verifying NFT ownership...');
    let currentOwner: string;
    try {
      currentOwner = await readContract(wagmiConfig, {
        address: nftContract as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      }) as string;
      console.log('Current owner:', currentOwner);
    } catch (error: unknown) {
      const e = error as { message?: string };
      console.error('❌ Failed to verify ownership:', e?.message);
      return {
        success: false,
        error: 'Cannot verify NFT ownership. The NFT contract may not exist on this network.\n\n' +
               'This usually means:\n' +
               '• This NFT was minted with an old/deleted contract\n' +
               '• The contract was deployed on a different network\n\n' +
               '💡 Solution: Mint a fresh NFT from the /mint page using the current contract.'
      };
    }

    // Get the connected wallet address
    const account = getAccount(wagmiConfig);
    const connectedAddress = account.address;
    
    console.log('Connected wallet:', connectedAddress);
    console.log('NFT owner:', currentOwner);
    
    // Check if we actually own it
    if (!connectedAddress || String(currentOwner).toLowerCase() !== String(connectedAddress).toLowerCase()) {
      console.error('❌ Ownership mismatch!');
      return {
        success: false,
        error: `You don't own this NFT!\n\n` +
               `Owner: ${currentOwner}\n` +
               `Your wallet: ${connectedAddress}\n\n` +
               `This NFT might have been:\n` +
               `• Sold or transferred\n` +
               `• Listed on another marketplace\n` +
               `• In escrow elsewhere\n\n` +
               `Please refresh the dashboard to see your current NFTs.`
      };
    }
    console.log('✅ Ownership confirmed!');

    console.log('\n📝 Step 1: Approving marketplace to transfer NFTs...');
    console.log('   Using setApprovalForAll (more reliable than individual approve)');
    console.log('⚠️  Please approve the transaction in your wallet...');
    
    // Step 1: Use setApprovalForAll instead of approve (more reliable)
    // First simulate to avoid wallet/provider estimation bugs
    try {
      const { request } = await simulateContract(wagmiConfig, {
        address: nftContract as `0x${string}`,
        abi: [
          {
            inputs: [
              { internalType: 'address', name: 'operator', type: 'address' },
              { internalType: 'bool', name: 'approved', type: 'bool' },
            ],
            name: 'setApprovalForAll',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const,
        functionName: 'setApprovalForAll',
        args: [CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`, true],
        account: connectedAddress as `0x${string}`,
      });

      const approveTxHash = await writeContract(wagmiConfig, request);
      console.log('⏳ Waiting for approval transaction:', approveTxHash);
      await waitForTransactionReceipt(wagmiConfig, { hash: approveTxHash });
      console.log('✅ setApprovalForAll confirmed! Marketplace can now transfer ALL your NFTs from this contract.');
      console.log('   (This is more gas-efficient and you won\'t need to approve again for future listings)');
    } catch (approveAllErr: unknown) {
      const errMsg = (approveAllErr as { shortMessage?: string; message?: string })?.shortMessage || (approveAllErr as { message?: string })?.message || String(approveAllErr);
      console.warn('⚠️ setApprovalForAll failed, falling back to approve(tokenId)...', errMsg);
      // Fallback: approve specific token
      const { request } = await simulateContract(wagmiConfig, {
        address: nftContract as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`, BigInt(tokenId)],
        account: connectedAddress as `0x${string}`,
      });
      const approveTxHash = await writeContract(wagmiConfig, request);
      console.log('⏳ Waiting for approval transaction:', approveTxHash);
      await waitForTransactionReceipt(wagmiConfig, { hash: approveTxHash });
      console.log('✅ Approval confirmed for token', tokenId);
    }

    // Check if already listed
    console.log('\n🔍 Checking if already listed...');
    const existingListing = await getListing(nftContract, tokenId);
    if (existingListing) {
      console.error('❌ NFT is already listed!');
      return {
        success: false,
        error: `This NFT is already listed for ${existingListing.price} AVAX by ${existingListing.seller}.\n\nIf you want to change the price, delist it first.`
      };
    }
    console.log('✅ Not listed yet - OK to proceed');

    // Step 2: List on marketplace (this will transfer NFT to marketplace for escrow)
    console.log('\n📝 Step 2: Listing NFT on marketplace (NFT will be held in escrow)...');
    console.log('⚠️  Please approve the transaction in your wallet...');
    const priceInWei = parseEther(priceInAvax);
    
    console.log('\n🔍 Final check - calling listItem with:');
    console.log('  - NFT:', nftContract);
    console.log('  - Token ID:', tokenId);
    console.log('  - Price (wei):', priceInWei.toString());
    console.log('  - Price (AVAX):', priceInAvax);
    
    // Simulate listItem first, then write with the simulated request
    const listSim = await simulateContract(wagmiConfig, {
      address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'listItem',
      args: [nftContract as `0x${string}`, BigInt(tokenId), priceInWei],
      account: connectedAddress as `0x${string}`,
    });
    const listTxHash = await writeContract(wagmiConfig, listSim.request);

    console.log('⏳ Waiting for listing transaction:', listTxHash);
    await waitForTransactionReceipt(wagmiConfig, { hash: listTxHash });
    console.log('✅ NFT listed successfully!');
    console.log('✅ NFT is now in marketplace escrow until sold or delisted');

    return { success: true, txHash: listTxHash };
  } catch (error: unknown) {
    console.error('❌ Error listing NFT:', error);
    
    // Handle specific error types
    let errorMessage = 'Failed to list NFT';
    
    const err = error as { message?: string; shortMessage?: string };
    if (err.message?.includes('User rejected') || err.message?.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (err.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for gas fees';
    } else if (err.message?.includes('Unable to get transaction hash')) {
      errorMessage = 'Transaction failed. Please check:\n• Your wallet is connected\n• You own this NFT\n• You have enough AVAX for gas\n• The NFT contract is valid';
    } else if (err.shortMessage) {
      errorMessage = err.shortMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Buy an NFT from the marketplace
 */
export async function buyNFT(
  nftContract: string,
  tokenId: number,
  priceInAvax: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!areContractsDeployed()) {
      return { success: false, error: 'Contracts not deployed' };
    }

    console.log('🛒 Buying NFT...');
    const priceInWei = parseEther(priceInAvax);
    
    const txHash = await writeContract(wagmiConfig, {
      address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'buyItem',
      args: [nftContract as `0x${string}`, BigInt(tokenId)],
      value: priceInWei,
    });

    console.log('⏳ Waiting for purchase transaction:', txHash);
    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
    console.log('✅ NFT purchased successfully!');

    return { success: true, txHash };
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.error('❌ Error buying NFT:', e);
    return { success: false, error: e?.message || 'Failed to buy NFT' };
  }
}

/**
 * Cancel/delist an NFT from the marketplace
 */
export async function cancelListing(
  nftContract: string,
  tokenId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!areContractsDeployed()) {
      return { success: false, error: 'Contracts not deployed' };
    }

    console.log('❌ Canceling listing...');
    
    const txHash = await writeContract(wagmiConfig, {
      address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'cancelListing',
      args: [nftContract as `0x${string}`, BigInt(tokenId)],
    });

    console.log('⏳ Waiting for cancellation transaction:', txHash);
    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
    console.log('✅ Listing canceled successfully!');

    return { success: true, txHash };
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.error('❌ Error canceling listing:', e);
    return { success: false, error: e?.message || 'Failed to cancel listing' };
  }
}

/**
 * Get listing details from marketplace
 * Returns Listing struct: { seller: address, price: uint256, active: bool }
 */
export async function getListing(
  nftContract: string,
  tokenId: number
): Promise<{ price: string; seller: string } | null> {
  try {
    if (!areContractsDeployed()) {
      return null;
    }

    const result = await readContract(wagmiConfig, {
      address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'getListing',
      args: [nftContract as `0x${string}`, BigInt(tokenId)],
    });

    if (!result) return null;

    // Result is a struct: { seller, price, active }
    const listing = result as { seller: string; price: bigint; active: boolean };
    
    // If not active or price is 0, it's not listed
    if (!listing.active || listing.price === BigInt(0)) return null;

    return {
      price: (Number(listing.price) / 1e18).toString(), // Convert wei to AVAX
      seller: listing.seller,
    };
  } catch (error) {
    console.warn('Error getting listing:', error);
    return null;
  }
}

/**
 * Scan all marketplace listings from blockchain events
 */
export async function scanMarketplaceListings(): Promise<MarketplaceListing[]> {
  try {
    if (!areContractsDeployed()) {
      console.log('⚠️  Contracts not deployed, returning empty listings');
      return [];
    }

    console.log('🔍 Scanning marketplace for all listings...');

    const client = getPublicClient(wagmiConfig);
    if (!client) {
      console.error('❌ No public client available');
      return [];
    }

    // Get current block
    const currentBlock = await client.getBlockNumber();
    console.log(`📊 Current block: ${currentBlock}`);

    // Scan last 50k blocks for Listed events
    const blocksToScan = BigInt(50000);
    const startBlock = currentBlock > blocksToScan ? currentBlock - blocksToScan : BigInt(0);
    const chunkSize = BigInt(2000);

    const allListedEvents: Array<{ topics: string[]; data?: string }> = [];

    // Scan in chunks
    for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
      const toBlock = fromBlock + chunkSize - BigInt(1) > currentBlock ? currentBlock : fromBlock + chunkSize - BigInt(1);

      try {
        const logs = await client.getLogs({
          address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Listed',
            inputs: [
              { type: 'address', indexed: true, name: 'nft' },
              { type: 'uint256', indexed: true, name: 'tokenId' },
              { type: 'address', indexed: true, name: 'seller' },
              { type: 'uint256', indexed: false, name: 'price' },
            ],
          },
          fromBlock,
          toBlock,
        });

        if (logs.length > 0) {
          console.log(`  ✅ Found ${logs.length} listings in blocks ${fromBlock}-${toBlock}`);
          allListedEvents.push(...logs);
        }
      } catch (chunkError: unknown) {
        const ce = chunkError as { message?: string };
        console.warn(`⚠️  Error scanning blocks ${fromBlock}-${toBlock}:`, ce?.message);
      }
    }

    console.log(`📥 Total: Found ${allListedEvents.length} Listed events`);

    // Build map of listings
    const listingsMap = new Map<string, MarketplaceListing>();

    for (const log of allListedEvents) {
      // topics: [Listed(nft, tokenId, seller, price)]
      const nftContract = log.topics[1];
      const tokenIdHex = log.topics[2];
      const seller = log.topics[3];

      if (!seller || !nftContract || !tokenIdHex) continue;

      const tokenId = Number(BigInt(tokenIdHex));
      const sellerAddress = `0x${seller.slice(26)}` // Remove padding
      const nftContractAddress = `0x${nftContract.slice(26)}`; // Remove padding
      
      // Get price from data field
      let price = '0';
      if (log.data && log.data !== '0x') {
        const priceInWei = BigInt(log.data);
        price = (Number(priceInWei) / 1e18).toString();
      }

      const key = `${nftContractAddress}-${tokenId}`;
      
      listingsMap.set(key, {
        nftContract: nftContractAddress,
        tokenId,
        price,
        seller: sellerAddress,
      });
    }

    // Now verify each listing is still active and fetch metadata
    const activeListings: MarketplaceListing[] = [];

    for (const [key, listing] of listingsMap.entries()) {
      try {
        // Check if still listed
        const currentListing = await getListing(listing.nftContract, listing.tokenId);
        
        if (!currentListing) {
          console.log(`  ⏭️  Skipping ${key} - no longer listed`);
          continue;
        }

        // Fetch token URI
        const uri = await readContract(wagmiConfig, {
          address: listing.nftContract as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'tokenURI',
          args: [BigInt(listing.tokenId)],
        }).catch(() => undefined);

        if (uri && typeof uri === 'string') {
          const meta = await getNFTMetadata(uri);
          listing.name = meta?.name || `Token #${listing.tokenId}`;
          listing.description = meta?.description || '';
          listing.image = meta?.image ? ipfsToHttp(meta.image) : '/vercel.svg';
        }

        // Use current listing data (in case price changed)
        listing.price = currentListing.price;
        listing.seller = currentListing.seller;

        activeListings.push(listing);
        console.log(`  ✨ Active listing: ${listing.name} - ${listing.price} AVAX`);
      } catch (err: unknown) {
        console.warn(`  ⚠️  Error verifying ${key}:`, (err as { message?: string })?.message || err);
      }
    }

    console.log(`🎉 Total active listings: ${activeListings.length}`);
    return activeListings;
  } catch (error) {
    console.error('❌ Error scanning marketplace listings:', error);
    return [];
  }
}

/**
 * Scan active marketplace listings for a specific seller (wallet)
 */
export async function scanSellerListings(sellerAddress: string): Promise<MarketplaceListing[]> {
  try {
    if (!areContractsDeployed()) return [];

    const client = getPublicClient(wagmiConfig);
    if (!client) return [];

    const currentBlock = await client.getBlockNumber();
    const blocksToScan = BigInt(50000);
    const startBlock = currentBlock > blocksToScan ? currentBlock - blocksToScan : BigInt(0);
    const chunkSize = BigInt(2000);

    const allListedEvents: Array<{ topics: string[]; data?: string }> = [];

    for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
      const toBlock = fromBlock + chunkSize - BigInt(1) > currentBlock ? currentBlock : fromBlock + chunkSize - BigInt(1);
      try {
        const logs = await client.getLogs({
          address: CONTRACTS.MARKETPLACE_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Listed',
            inputs: [
              { type: 'address', indexed: true, name: 'nft' },
              { type: 'uint256', indexed: true, name: 'tokenId' },
              { type: 'address', indexed: true, name: 'seller' },
              { type: 'uint256', indexed: false, name: 'price' },
            ],
          },
          args: { seller: sellerAddress as `0x${string}` },
          fromBlock,
          toBlock,
        });
        if (logs.length) allListedEvents.push(...logs);
      } catch (e) {
        // ignore chunk errors
      }
    }

    const listingsMap = new Map<string, MarketplaceListing>();
    for (const log of allListedEvents) {
      const nftContract = log.topics[1];
      const tokenIdHex = log.topics[2];
      const seller = log.topics[3];
      if (!seller || !nftContract || !tokenIdHex) continue;
      const tokenId = Number(BigInt(tokenIdHex));
      const sellerAddr = `0x${seller.slice(26)}`;
      const nftAddr = `0x${nftContract.slice(26)}`;
      let price = '0';
      if (log.data && log.data !== '0x') {
        const wei = BigInt(log.data);
        price = (Number(wei) / 1e18).toString();
      }
      listingsMap.set(`${nftAddr}-${tokenId}`, {
        nftContract: nftAddr,
        tokenId,
        price,
        seller: sellerAddr,
      });
    }

    const active: MarketplaceListing[] = [];
    for (const [key, l] of listingsMap.entries()) {
      const current = await getListing(l.nftContract, l.tokenId);
      if (!current) continue;
      // fetch metadata
      const uri = await readContract(wagmiConfig, {
        address: l.nftContract as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(l.tokenId)],
      }).catch(() => undefined);
      if (uri && typeof uri === 'string') {
        const meta = await getNFTMetadata(uri);
        l.name = meta?.name || `Token #${l.tokenId}`;
        l.description = meta?.description || '';
        l.image = meta?.image ? ipfsToHttp(meta.image) : '/vercel.svg';
      }
      l.price = current.price;
      l.seller = current.seller;
      active.push(l);
    }
    return active;
  } catch {
    return [];
  }
}

