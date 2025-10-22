# 🎨 Artistic Splash - NFT Marketplace Frontend

A beautiful, modern NFT marketplace built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Upload, mint, and trade digital art on the Avalanche blockchain.

## 🚀 Features

- **Wallet Connection**: Mock wallet connection with address display
- **NFT Minting**: Upload images (PNG/JPEG) and create NFTs
- **Marketplace**: Browse and explore NFTs from all creators
- **User Dashboard**: Manage your NFT collection and listings
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Smooth Animations**: Beautiful transitions and interactions powered by Framer Motion
- **Modern UI**: Clean, professional design with custom color scheme

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (body), Dancing Script (logo)

## 🎨 Design System

### Color Palette

- **White**: `#ffffff` - Primary background
- **Smoke White**: `#f5f5f5` - Secondary background
- **Blue**: `#1e3a8a` - Dark blue for headings
- **Light Blue**: `#3b82f6` - Primary action color
- **Metallic Black**: `#1a1a1a` - Text color
- **Silver**: `#c0c0c0` - Secondary buttons
- **Gray**: `#6b7280` - Subtext

### Typography

- **Logo**: Dancing Script (cursive)
- **Body**: Inter
- **Headings**: Bold, dark blue

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page with hero section
│   ├── explore/
│   │   └── page.tsx          # NFT marketplace/gallery
│   ├── mint/
│   │   └── page.tsx          # NFT minting page
│   ├── dashboard/
│   │   └── page.tsx          # User dashboard
│   ├── layout.tsx            # Root layout with Navbar & Footer
│   └── globals.css           # Global styles & Tailwind config
├── components/
│   ├── Navbar.tsx            # Navigation with wallet connection
│   ├── Footer.tsx            # Footer component
│   ├── NFTCard.tsx           # Reusable NFT card
│   ├── UploadForm.tsx        # Image upload and mint form
│   └── DashboardGrid.tsx     # User NFT grid with listing
├── lib/
│   └── store.ts              # Zustand store (wallet & NFT state)
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📄 Pages

### Home (`/`)
- Hero section with app title and description
- "Start Creating" CTA button
- "How It Works" feature section (Upload → Mint → Sell)
- Call-to-action section

### Explore (`/explore`)
- Grid of all available NFTs
- NFT cards with image, name, price, and owner
- Statistics dashboard (Total NFTs, Listed, Creators, Avg Price)
- "Buy" button (mock functionality)

### Mint (`/mint`)
- Image upload with drag-and-drop support
- NFT name and description input fields
- "Mint NFT" button with loading state
- Success modal with navigation to dashboard
- Minting guidelines section

### Dashboard (`/dashboard`)
- Wallet connection check
- User statistics (Total NFTs, Listed, Total Value)
- Grid of user's minted NFTs
- "List for Sale" functionality with price input modal
- Empty state with CTA to mint first NFT

## 🎯 State Management

The app uses Zustand for global state management with the following features:

- **Wallet State**: Connection status and address
- **NFT State**: User NFTs and all NFTs
- **Actions**: Connect/disconnect wallet, add NFT, list/unlist NFT

### Store Interface

```typescript
interface AppState {
  // Wallet
  isWalletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // NFTs
  userNFTs: NFT[];
  allNFTs: NFT[];
  addNFT: (nft) => void;
  listNFT: (id, price) => void;
  unlistNFT: (id) => void;
}
```

## 🎭 Components

### Navbar
- Logo with gradient text effect
- Navigation links (Home, Explore, Mint, Dashboard)
- Active page indicator
- Connect/Disconnect wallet button
- Mobile-responsive navigation

### NFTCard
- Image display with Next.js Image optimization
- NFT name, description, price
- Owner address
- Action button (customizable)
- Listed status badge

### UploadForm
- Image upload with preview
- Form validation
- Loading state during minting
- Success modal with navigation

### DashboardGrid
- Responsive NFT grid
- List for sale modal
- Empty state handling
- Per-NFT status display

## 🎨 Animations

All animations are powered by Framer Motion:

- **Page transitions**: Fade-in and slide-up effects
- **Button interactions**: Scale on hover and tap
- **Card hover effects**: Lift and shadow
- **Loading states**: Spinner animations
- **Modals**: Scale and fade transitions
- **Background elements**: Floating gradient orbs

## 📱 Responsive Design

- **Mobile**: Single column layout, stacked navigation
- **Tablet**: 2-column NFT grid
- **Desktop**: 3-column NFT grid, full navigation bar

## 🔮 Future Enhancements

This is currently a **mock frontend** ready for blockchain integration:

1. **Smart Contract Integration**
   - Connect to Avalanche network
   - Real wallet connection (MetaMask, etc.)
   - Actual NFT minting via smart contracts
   - Real marketplace transactions

2. **Additional Features**
   - NFT search and filters
   - User profiles
   - Transaction history
   - Favorites/watchlist
   - Bidding system
   - Collection pages

3. **Performance**
   - Image optimization with IPFS
   - Lazy loading
   - Infinite scroll
   - Caching strategies

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project as a template for your own NFT marketplace.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
