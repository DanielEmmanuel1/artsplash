/**
 * NFT Minting Utilities
 * Handles the complete minting flow: IPFS upload → metadata → blockchain mint
 */

import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata, ipfsToHttp } from './ipfs';
import { CONTRACTS, NFT_ABI, areContractsDeployed } from './contracts';
import { type WalletClient, type PublicClient } from 'viem';
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from './wallet/config';

export interface MintStatus {
  stage: 'uploading' | 'creating-metadata' | 'minting' | 'complete' | 'error';
  message: string;
  txHash?: string;
  tokenId?: number;
  error?: string;
}

export interface MintResult {
  success: boolean;
  tokenId?: number;
  txHash?: string;
  imageHash?: string;
  metadataHash?: string;
  error?: string;
}

/**
 * Complete NFT minting flow
 * @param file - Image file to mint as NFT
 * @param name - NFT name
 * @param description - NFT description
 * @param creator - Creator's wallet address
 * @param onStatusChange - Callback for status updates
 * @returns Mint result
 */
export async function mintNFT(
  file: File,
  name: string,
  description: string,
  creator: string,
  onStatusChange?: (status: MintStatus) => void
): Promise<MintResult> {
  try {
    // Check if contracts are deployed
    if (!areContractsDeployed()) {
      throw new Error(
        'Smart contracts not deployed yet. Please deploy contracts to Fuji testnet first. See CONTRACTS_SETUP.md for instructions.'
      );
    }

    // Step 1: Upload image to IPFS
    onStatusChange?.({
      stage: 'uploading',
      message: 'Uploading image to IPFS...',
    });

    const imageHash = await uploadImageToIPFS(file);
    console.log('📦 Image uploaded to IPFS:', imageHash);

    // Step 2: Create and upload metadata
    onStatusChange?.({
      stage: 'creating-metadata',
      message: 'Creating NFT metadata...',
    });

    const metadata = createNFTMetadata(name, description, imageHash, creator);
    const metadataHash = await uploadMetadataToIPFS(metadata);
    const metadataURI = `ipfs://${metadataHash}`;
    
    console.log('📦 Metadata uploaded to IPFS:', metadataHash);
    console.log('📄 Metadata URI:', metadataURI);

    // Step 3: Mint NFT on blockchain
    onStatusChange?.({
      stage: 'minting',
      message: 'Minting NFT on Avalanche... Please confirm in your wallet',
    });

    console.log('🔄 Attempting to mint with URI:', metadataURI);
    console.log('🔄 Minting to address:', creator);
    console.log('🔄 Contract address:', CONTRACTS.NFT_ADDRESS);
    
    const txHash = await writeContract(wagmiConfig, {
      address: CONTRACTS.NFT_ADDRESS as `0x${string}`,
      abi: NFT_ABI,
      functionName: 'publicMint',
      args: [metadataURI],
      value: 0n, // Free mint for now
    });

    console.log('⛓️ Transaction submitted:', txHash);

    onStatusChange?.({
      stage: 'minting',
      message: 'Waiting for transaction confirmation...',
      txHash,
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: txHash,
    });

    if (receipt.status === 'success') {
      // Parse tokenId from logs
      const tokenId = parseTokenIdFromReceipt(receipt);

      onStatusChange?.({
        stage: 'complete',
        message: 'NFT minted successfully!',
        txHash,
        tokenId,
      });

      return {
        success: true,
        tokenId,
        txHash,
        imageHash,
        metadataHash,
      };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error: any) {
    console.error('Minting error:', error);
    
    onStatusChange?.({
      stage: 'error',
      message: 'Minting failed',
      error: error.message || 'Unknown error',
    });

    return {
      success: false,
      error: error.message || 'Minting failed',
    };
  }
}

/**
 * Parse tokenId from transaction receipt logs
 */
function parseTokenIdFromReceipt(receipt: any): number | undefined {
  try {
    // Look for NFTMinted event in logs
    const mintedEvent = receipt.logs?.find((log: any) => {
      // NFTMinted event signature
      return log.topics?.[0] === '0x...' // You'll need the actual event signature
    });

    if (mintedEvent) {
      // Parse tokenId from event data
      const tokenId = parseInt(mintedEvent.topics[2], 16);
      return tokenId;
    }

    // Fallback: Get current supply and return that
    return undefined;
  } catch (error) {
    console.error('Error parsing tokenId:', error);
    return undefined;
  }
}

/**
 * Get NFT metadata from IPFS
 * @param tokenURI - Token URI (ipfs://...)
 * @returns Metadata object
 */
export async function getNFTMetadata(tokenURI: string): Promise<any> {
  try {
    const httpUrl = ipfsToHttp(tokenURI);
    const response = await fetch(httpUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

/**
 * Validates all requirements before minting
 * @returns Validation result
 */
export function validateMintRequirements(
  file: File | null,
  name: string,
  description: string,
  connected: boolean
): { valid: boolean; error?: string } {
  if (!connected) {
    return {
      valid: false,
      error: 'Please connect your wallet first',
    };
  }

  if (!file) {
    return {
      valid: false,
      error: 'Please select an image file',
    };
  }

  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Please enter an NFT name',
    };
  }

  if (!description || description.trim().length === 0) {
    return {
      valid: false,
      error: 'Please enter a description',
    };
  }

  if (!areContractsDeployed()) {
    return {
      valid: false,
      error: 'Smart contracts not deployed yet. Please check CONTRACTS_SETUP.md',
    };
  }

  return { valid: true };
}

/**
 * Estimate gas cost for minting
 * @returns Estimated cost in AVAX
 */
export async function estimateMintCost(): Promise<string> {
  // Typical minting cost on Avalanche is very low
  // This is a rough estimate - actual cost will be shown in wallet
  return '~0.01 AVAX';
}

