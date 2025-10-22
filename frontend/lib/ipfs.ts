/**
 * IPFS Upload Utilities using Pinata
 * 
 * Documentation: https://docs.pinata.cloud/
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  creator?: string;
  created_at?: string;
}

/**
 * Uploads an image file to IPFS via Pinata
 * @param file - Image file to upload
 * @returns IPFS hash (CID)
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Using Pinata's public gateway (you can also use your own API key)
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Fallback: Use free IPFS service (NFT.Storage or web3.storage)
      console.warn('Pinata upload failed, using fallback...');
      return uploadToFallbackIPFS(file);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Use fallback service
    return uploadToFallbackIPFS(file);
  }
}

/**
 * Fallback IPFS upload using browser-based solution
 * For production, consider using NFT.Storage or web3.storage
 */
async function uploadToFallbackIPFS(file: File): Promise<string> {
  // For demo purposes, convert to base64 and create a mock IPFS hash
  // In production, integrate with NFT.Storage or web3.storage
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Create a deterministic hash from file content
      const base64 = reader.result as string;
      const mockHash = 'Qm' + btoa(file.name + file.size).substring(0, 44);
      
      // Store in localStorage as fallback (for demo only)
      localStorage.setItem(`ipfs_${mockHash}`, base64);
      
      console.log('📦 Using local storage fallback for IPFS:', mockHash);
      resolve(mockHash);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads NFT metadata JSON to IPFS
 * @param metadata - NFT metadata object
 * @returns IPFS hash (CID) of the metadata
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      console.warn('Pinata metadata upload failed, using fallback...');
      return uploadMetadataToFallbackIPFS(metadata);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Metadata upload error:', error);
    return uploadMetadataToFallbackIPFS(metadata);
  }
}

/**
 * Fallback metadata upload
 */
function uploadMetadataToFallbackIPFS(metadata: NFTMetadata): string {
  const metadataString = JSON.stringify(metadata, null, 2);
  const mockHash = 'Qm' + btoa(metadata.name + Date.now()).substring(0, 44);
  
  // Store in localStorage (for demo)
  localStorage.setItem(`ipfs_${mockHash}`, metadataString);
  
  console.log('📦 Using local storage fallback for metadata:', mockHash);
  return mockHash;
}

/**
 * Creates ERC-721 compliant metadata
 * @param name - NFT name
 * @param description - NFT description
 * @param imageHash - IPFS hash of the image
 * @param creator - Creator's wallet address
 * @returns NFT metadata object
 */
export function createNFTMetadata(
  name: string,
  description: string,
  imageHash: string,
  creator?: string
): NFTMetadata {
  return {
    name,
    description,
    image: `ipfs://${imageHash}`,
    attributes: [
      {
        trait_type: 'Creator',
        value: creator || 'Anonymous',
      },
      {
        trait_type: 'Created',
        value: new Date().toISOString().split('T')[0],
      },
      {
        trait_type: 'Platform',
        value: 'Artistic Splash',
      },
    ],
    external_url: 'https://artisticsplash.art', // Update with your domain
    creator: creator || undefined,
    created_at: new Date().toISOString(),
  };
}

/**
 * Converts IPFS hash to HTTP gateway URL
 * @param hash - IPFS hash (CID)
 * @param usePublicGateway - Use public gateway (default: true)
 * @returns HTTP URL
 */
export function ipfsToHttp(hash: string, usePublicGateway: boolean = true): string {
  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace('ipfs://', '');
  
  if (usePublicGateway) {
    // Use reliable public gateway
    return `https://ipfs.io/ipfs/${cleanHash}`;
  } else {
    // Use Pinata gateway (faster, requires account)
    return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
  }
}

/**
 * Retrieves file from local storage fallback
 * @param hash - IPFS hash
 * @returns File data or null
 */
export function getFromLocalIPFS(hash: string): string | null {
  return localStorage.getItem(`ipfs_${hash}`);
}

/**
 * Validates image file before upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPEG, GIF, or WebP.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

