# 🔐 Artistic Splash Wallet Adapter

Production-ready wallet connection system for the Artistic Splash NFT marketplace, with full support for Avalanche C-Chain (Fuji Testnet & Mainnet) and EVM-compatible wallets.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Components](#components)
- [Testing](#testing)
- [Official Documentation](#official-documentation)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **Multi-Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect
- ✅ **Avalanche Networks**: Fuji Testnet (43113) and Mainnet (43114)
- ✅ **Automatic Network Switching**: Prompts users to switch to correct network
- ✅ **TypeScript**: Fully typed for better DX
- ✅ **React Hooks**: Clean, modern React API
- ✅ **UI Components**: Pre-built, styled components
- ✅ **Error Handling**: Graceful error handling with user feedback
- ✅ **Next.js SSR**: Compatible with Next.js 13+ App Router

## 📦 Installation

The required packages are already installed. If you need to install them manually:

```bash
npm install wagmi viem @tanstack/react-query @web3modal/wagmi
```

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the `frontend` directory:

```bash
# Get a free project ID at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APP_NAME=Artistic Splash
```

### 2. Wrap Your App

The wallet provider is already integrated in `app/layout.tsx`:

```tsx
import { WalletProvider } from '@/lib/wallet/WalletProvider';
import NetworkBanner from '@/components/wallet/NetworkBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <WalletProvider>
          <NetworkBanner />
          {/* Your app content */}
        </WalletProvider>
      </body>
    </html>
  );
}
```

### 3. Use in Components

```tsx
import { useWallet } from '@/lib/wallet/useWallet';
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton';

export default function MyComponent() {
  const { connected, address, chainId, isCorrectNetwork } = useWallet();

  return (
    <div>
      <ConnectWalletButton />
      {connected && (
        <p>Connected: {address}</p>
      )}
    </div>
  );
}
```

## 📚 API Reference

### `useWallet()` Hook

The main hook for wallet interactions:

```typescript
const {
  // Connection State
  connected,      // boolean: Is wallet connected?
  connecting,     // boolean: Is connection in progress?
  address,        // string: User's wallet address (0x...)
  chainId,        // number: Current chain ID
  
  // Network Info
  isCorrectNetwork,  // boolean: Is on Avalanche?
  isAvalanche,       // boolean: Is on any Avalanche network?
  isFuji,            // boolean: Is on Fuji Testnet?
  isMainnet,         // boolean: Is on Mainnet?
  
  // Wallet Client
  walletClient,   // Viem wallet client for transactions
  
  // Actions
  connect,        // (connectorId?: string) => Promise<void>
  disconnect,     // () => void
  switchToFuji,   // () => Promise<boolean>
  switchToMainnet, // () => Promise<boolean>
  switchChain,    // (chainId: number) => Promise<boolean>
  
  // Available Connectors
  connectors,     // Connector[]: List of available wallet connectors
  
  // Errors
  error,          // Error | undefined: Connection/switch errors
} = useWallet();
```

### Helper Functions

```typescript
import { formatAddress, getExplorerAddressUrl, getExplorerTxUrl } from '@/lib/wallet/useWallet';

// Format address to 0x1234...5678
const short = formatAddress('0x1234567890abcdef...');

// Get Snowtrace URLs
const addressUrl = getExplorerAddressUrl(43113, address);
const txUrl = getExplorerTxUrl(43113, txHash);
```

## 🎨 Components

### ConnectWalletButton

Main button for wallet connection:

```tsx
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton';

<ConnectWalletButton 
  className="custom-class"  // Optional
  showFullAddress={false}    // Optional: show full address instead of truncated
/>
```

**Features:**
- Shows "Connect Wallet" when disconnected
- Shows truncated address when connected
- Opens account menu on click (when connected)
- Shows loading state during connection
- Fully styled with hover/tap animations

### WalletModal

Modal for selecting wallet connector:

```tsx
import WalletModal from '@/components/wallet/WalletModal';

<WalletModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
/>
```

**Features:**
- Lists all available wallet connectors
- Shows connector icons and descriptions
- Handles connection errors
- Link to wallet documentation

### NetworkBanner

Banner that appears when user is on wrong network:

```tsx
import NetworkBanner from '@/components/wallet/NetworkBanner';

<NetworkBanner />
```

**Features:**
- Automatically detects wrong network
- Shows current chain ID
- One-click switch to Fuji button
- Dismissible

### AccountMenu

Dropdown menu for connected account:

```tsx
import AccountMenu from '@/components/wallet/AccountMenu';

<AccountMenu 
  onClose={() => setShowMenu(false)} 
  anchorElement={buttonRef.current}  // Optional
/>
```

**Features:**
- Copy address to clipboard
- View on Snowtrace link
- Network badge (Fuji/Mainnet)
- Disconnect button
- Auto-closes on outside click

## 🧪 Testing

Visit the test page to verify all functionality:

```
http://localhost:3000/test-wallet
```

### Test Checklist

- [ ] Connect with MetaMask
- [ ] Connect with WalletConnect (QR scan)
- [ ] Connect with Coinbase Wallet
- [ ] Switch to Fuji Testnet
- [ ] Switch to Mainnet
- [ ] View wallet info (address, chain ID)
- [ ] Copy address
- [ ] View on Snowtrace
- [ ] Disconnect wallet
- [ ] Network banner appears on wrong network
- [ ] Account menu opens from navbar

## 📖 Official Documentation

This adapter was built following official documentation:

### Wagmi (Wallet Connection)
- **Main Docs**: https://wagmi.sh/react/getting-started
- **Connect Wallet Guide**: https://wagmi.sh/react/guides/connect-wallet
- **useAccount**: https://wagmi.sh/react/api/hooks/useAccount
- **useConnect**: https://wagmi.sh/react/api/hooks/useConnect
- **useSwitchChain**: https://wagmi.sh/react/api/hooks/useSwitchChain

### Viem (Ethereum Library)
- **Main Docs**: https://viem.sh/
- **Chains**: https://viem.sh/docs/chains/introduction
- **defineChain**: https://viem.sh/docs/chains/introduction#custom-chains

### Web3Modal / WalletConnect
- **Web3Modal**: https://web3modal.com/docs
- **WalletConnect Cloud**: https://cloud.walletconnect.com
- **Migration Guide**: https://docs.reown.com/appkit/upgrade/from-w3m-to-reown

### Avalanche
- **Developer Docs**: https://docs.avax.network/
- **Add Network Guide**: https://docs.avax.network/dapps/developer-toolchains/using-hardhat-with-the-avalanche-c-chain#add-avalanche-to-metamask-programmatically
- **Network Details**: https://docs.avax.network/quickstart/fuji-workflow
- **Fuji Testnet**: https://chainlist.org/chain/43113
- **C-Chain Mainnet**: https://chainlist.org/chain/43114

### React Query (Required by Wagmi)
- **Main Docs**: https://tanstack.com/query/latest/docs/framework/react/overview

## 🔧 Configuration

### Chain Configuration

Chains are configured in `lib/wallet/chains.ts`:

```typescript
import { avalancheFuji, avalancheMainnet } from '@/lib/wallet/chains';

// Use in your app
const fujiId = avalancheFuji.id;  // 43113
const fujiRpc = avalancheFuji.rpcUrls.default.http[0];
const fujiExplorer = avalancheFuji.blockExplorers.default.url;
```

### Wagmi Configuration

Wagmi config is in `lib/wallet/config.ts`. To add more chains or connectors:

```typescript
import { createConfig } from 'wagmi';
import { mainnet } from 'viem/chains';

export const wagmiConfig = createConfig({
  chains: [avalancheFuji, avalancheMainnet, mainnet], // Add more chains
  connectors: [
    // Add more connectors here
  ],
  // ...
});
```

## 🐛 Troubleshooting

### Common Issues

#### "MetaMask is not installed"
- Ensure MetaMask extension is installed in the browser
- For mobile, use WalletConnect instead

#### "WalletConnect not working"
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`
- Get a free project ID at https://cloud.walletconnect.com

#### "Wrong Network" banner keeps appearing
- Click "Switch to Fuji" button
- Or manually add Avalanche Fuji in your wallet:
  - Network Name: Avalanche Fuji Testnet
  - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
  - Chain ID: 43113
  - Symbol: AVAX
  - Explorer: https://testnet.snowtrace.io

#### "Cannot read properties of undefined"
- Ensure `WalletProvider` wraps your app in `layout.tsx`
- Check that `useWallet()` is called inside a component that's a child of `WalletProvider`

#### Hydration errors in Next.js
- The adapter is configured with `ssr: true` for Next.js compatibility
- Ensure wallet components are marked with `'use client'` directive

### Getting Help

- **Wagmi Discord**: https://wagmi.sh/discord
- **Avalanche Discord**: https://chat.avax.network/
- **GitHub Issues**: Create an issue in the project repository

## 🔒 Security Best Practices

✅ **DO:**
- Always validate user input before sending transactions
- Use environment variables for sensitive data
- Test on Fuji testnet before deploying to mainnet
- Implement proper error handling
- Show clear user feedback for all actions

❌ **DON'T:**
- Never log private keys or sensitive data
- Don't store private keys in code or environment variables
- Don't trust client-side data without validation
- Don't skip user confirmations for transactions

## 📝 Example: Sending a Transaction

```typescript
import { useWallet } from '@/lib/wallet/useWallet';
import { parseEther } from 'viem';

function MyComponent() {
  const { walletClient, address } = useWallet();

  const sendTransaction = async () => {
    if (!walletClient) return;

    try {
      const hash = await walletClient.sendTransaction({
        to: '0x...',
        value: parseEther('0.01'),
      });
      
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={sendTransaction}>
      Send 0.01 AVAX
    </button>
  );
}
```

## 📝 Example: Calling a Smart Contract

```typescript
import { useWallet } from '@/lib/wallet/useWallet';
import { encodeFunctionData } from 'viem';

function MintNFT() {
  const { walletClient, address } = useWallet();

  const mintNFT = async (tokenURI: string) => {
    if (!walletClient || !address) return;

    const contractAddress = '0x...'; // Your NFT contract
    const abi = [/* Your contract ABI */];

    try {
      // Encode the function call
      const data = encodeFunctionData({
        abi,
        functionName: 'mint',
        args: [address, tokenURI],
      });

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: contractAddress,
        data,
      });

      console.log('Mint transaction:', hash);
      return hash;
    } catch (error) {
      console.error('Minting failed:', error);
      throw error;
    }
  };

  return (
    <button onClick={() => mintNFT('ipfs://...')}>
      Mint NFT
    </button>
  );
}
```

## 🎉 Next Steps

1. **Test Everything**: Visit `/test-wallet` and verify all functionality
2. **Get WalletConnect ID**: Sign up at https://cloud.walletconnect.com
3. **Add to .env.local**: Set your `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. **Integrate with Minting**: Update the mint page to use real wallet adapter
5. **Connect Smart Contracts**: Integrate your Hardhat contracts
6. **Deploy**: Test on Fuji, then deploy to mainnet

## 📄 License

MIT License - Part of the Artistic Splash NFT Marketplace

---

**Built with ❤️ using Wagmi, Viem, and Next.js**

For questions or issues, please refer to the official documentation links above or create an issue in the repository.

