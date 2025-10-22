# ⚡ Quick Start: Wallet Integration

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Environment

1. Create `.env.local` in the `frontend` directory:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

2. Get your WalletConnect Project ID:
   - Visit: https://cloud.walletconnect.com
   - Sign up (free)
   - Create a new project
   - Copy the Project ID

### Step 2: Test the Integration

1. Start the dev server:
```bash
npm run dev
```

2. Visit the test page:
```
http://localhost:3000/test-wallet
```

3. Test the following:
   - ✅ Click "Connect Wallet"
   - ✅ Select MetaMask or WalletConnect
   - ✅ Approve connection
   - ✅ View wallet info (address, chain)
   - ✅ Switch to Fuji Testnet
   - ✅ Open account menu (click on address)
   - ✅ Copy address, view on Snowtrace
   - ✅ Disconnect wallet

### Step 3: Use in Your Components

```typescript
import { useWallet } from '@/lib/wallet/useWallet';
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton';

export default function MyPage() {
  const { connected, address, chainId, walletClient } = useWallet();

  if (!connected) {
    return <ConnectWalletButton />;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <p>Chain: {chainId}</p>
    </div>
  );
}
```

## 📚 Full Documentation

For complete API reference, examples, and troubleshooting:
- See `WALLET_ADAPTER_README.md`
- See `WALLET_INTEGRATION_SUMMARY.md`

## 🎯 Next: Integrate with Smart Contracts

Once wallet connection is working, integrate with your NFT contracts:

```typescript
import { useWallet } from '@/lib/wallet/useWallet';
import { encodeFunctionData } from 'viem';

function MintButton() {
  const { walletClient, address } = useWallet();

  const mint = async () => {
    const data = encodeFunctionData({
      abi: YOUR_CONTRACT_ABI,
      functionName: 'mint',
      args: [address, 'ipfs://your-metadata'],
    });

    const hash = await walletClient.sendTransaction({
      to: 'YOUR_CONTRACT_ADDRESS',
      data,
    });

    console.log('Minted! TX:', hash);
  };

  return <button onClick={mint}>Mint NFT</button>;
}
```

---

**That's it!** You now have a production-ready wallet adapter integrated with Artistic Splash! 🎉

