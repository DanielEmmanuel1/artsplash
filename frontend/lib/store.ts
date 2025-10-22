import { create } from 'zustand';

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  owner: string;
  isListed: boolean;
  createdAt: Date;
  tokenId?: number;
  txHash?: string;
}

interface AppState {
  // Wallet state
  isWalletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // NFT state
  userNFTs: NFT[];
  allNFTs: NFT[];
  addNFT: (nft: Omit<NFT, 'id' | 'createdAt' | 'owner'>) => void;
  listNFT: (id: string, price: number) => void;
  unlistNFT: (id: string) => void;
}

// Mock wallet address generator
const generateMockAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Mock NFTs data
const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Sunset Dreams',
    description: 'A beautiful sunset over the mountains',
    image: 'https://picsum.photos/seed/nft1/400/400',
    price: 2.5,
    owner: '0xABC...123',
    isListed: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Ocean Waves',
    description: 'Calming waves on a tropical beach',
    image: 'https://picsum.photos/seed/nft2/400/400',
    price: 1.8,
    owner: '0xDEF...456',
    isListed: true,
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'Mountain Peak',
    description: 'Majestic snow-covered mountain peak',
    image: 'https://picsum.photos/seed/nft3/400/400',
    price: 3.2,
    owner: '0xGHI...789',
    isListed: true,
    createdAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    name: 'Forest Path',
    description: 'A peaceful path through an autumn forest',
    image: 'https://picsum.photos/seed/nft4/400/400',
    price: 2.0,
    owner: '0xJKL...012',
    isListed: true,
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    name: 'City Lights',
    description: 'Vibrant city skyline at night',
    image: 'https://picsum.photos/seed/nft5/400/400',
    price: 4.5,
    owner: '0xMNO...345',
    isListed: true,
    createdAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    name: 'Desert Dunes',
    description: 'Golden sand dunes at sunset',
    image: 'https://picsum.photos/seed/nft6/400/400',
    price: 2.2,
    owner: '0xPQR...678',
    isListed: true,
    createdAt: new Date('2024-01-20'),
  },
];

export const useStore = create<AppState>((set) => ({
  // Initial state
  isWalletConnected: false,
  walletAddress: null,
  userNFTs: [],
  allNFTs: mockNFTs,

  // Wallet actions
  connectWallet: () => {
    const mockAddress = generateMockAddress();
    set({
      isWalletConnected: true,
      walletAddress: mockAddress,
    });
  },

  disconnectWallet: () => {
    set({
      isWalletConnected: false,
      walletAddress: null,
    });
  },

  // NFT actions
  addNFT: (nft) => {
    set((state) => {
      const newNFT: NFT = {
        ...nft,
        id: `nft-${Date.now()}`,
        owner: state.walletAddress || 'Unknown',
        createdAt: new Date(),
      };
      return {
        userNFTs: [...state.userNFTs, newNFT],
        allNFTs: [...state.allNFTs, newNFT],
      };
    });
  },

  listNFT: (id, price) => {
    set((state) => ({
      userNFTs: state.userNFTs.map((nft) =>
        nft.id === id ? { ...nft, isListed: true, price } : nft
      ),
      allNFTs: state.allNFTs.map((nft) =>
        nft.id === id ? { ...nft, isListed: true, price } : nft
      ),
    }));
  },

  unlistNFT: (id) => {
    set((state) => ({
      userNFTs: state.userNFTs.map((nft) =>
        nft.id === id ? { ...nft, isListed: false, price: undefined } : nft
      ),
      allNFTs: state.allNFTs.map((nft) =>
        nft.id === id ? { ...nft, isListed: false, price: undefined } : nft
      ),
    }));
  },
}));

