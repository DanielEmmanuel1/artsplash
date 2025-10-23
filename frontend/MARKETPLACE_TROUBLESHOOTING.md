# 🔧 Marketplace Troubleshooting Guide

## Common Error: "Unable to get transaction hash" when listing NFT

### Problem
When trying to list an NFT, you get this error:
```
❌ Error listing NFT: ContractFunctionExecutionError: The contract function "approve" reverted
Unable to get transaction hash
```

### Root Cause
This error most commonly occurs due to:
1. **Gas estimation failure** - The transaction can't estimate gas properly
2. **Old/invalid contract** - The NFT contract doesn't exist or doesn't have proper ERC721 functions
3. **Not the owner** - You don't actually own the NFT anymore
4. **Already listed** - The NFT is already listed on the marketplace

**IMPORTANT**: The marketplace DOES support NFTs from ANY contract address! The contract address difference is usually NOT the problem.

### Solution Options

#### Option 1: Mint New NFTs with Current Contract (Recommended)
1. Check your current contract address in `.env.local`:
   ```
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourCurrentContract...
   ```

2. Mint a fresh NFT using the `/mint` page
3. The new NFT will use the current contract address
4. You can now list this NFT successfully

#### Option 2: Update Environment to Match NFT Contract
If you want to list NFTs from the old contract:

1. Find the contract address of your existing NFT (check console logs in Dashboard)
2. Update `.env.local`:
   ```
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xOldContractAddress...
   ```
3. Restart dev server: `npm run dev`
4. Try listing again

#### Option 3: Deploy Marketplace for Old Contract
If you need both contracts to work:

1. You'll need to deploy a new marketplace contract
2. Or update the old NFT contract to work with the current marketplace

### How to Check NFT Contract Address

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Dashboard
4. Look for logs like:
   ```
   ✨ Added: Your NFT Name
   Contract: 0x...
   Token ID: 1
   ```

4. Compare this contract address with your `.env.local`

### Prevention
To avoid this in the future:
- Don't redeploy contracts unless necessary
- If you must redeploy, document the new addresses
- Consider using a contract factory pattern for production

### Still Having Issues?

Check these:
1. ✅ Wallet connected?
2. ✅ On correct network (Fuji Testnet)?
3. ✅ Have AVAX for gas?
4. ✅ Actually own the NFT?
5. ✅ NFT contract matches `.env.local`?

### Debug Checklist

Run these checks in browser console:

```javascript
// Check current config
console.log('NFT Contract:', process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
console.log('Marketplace:', process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS);

// When you see the error, check which contract it's trying to use
// It will be in the error message under "address:"
```

---

## Error: "Transaction rejected by user"

### Cause
You clicked "Reject" in your wallet popup

### Solution
Try again and click "Approve" in your wallet

---

## Error: "Insufficient funds for gas fees"

### Cause
Not enough AVAX in wallet for gas

### Solution
Get free testnet AVAX from: https://faucet.avax.network/

---

## Listing Requires 2 Transactions

This is **NORMAL** and expected:

1. **Transaction 1**: Approve marketplace to transfer your NFT
   - This is a security feature
   - Marketplace can't touch your NFT without approval
   
2. **Transaction 2**: List the NFT on marketplace
   - Records price and listing in marketplace contract

**Important**: Don't close the browser or refresh until BOTH transactions complete!

---

## NFT Shows in Dashboard But Can't List

### Possible Causes

1. **Wrong Contract**: NFT is from different contract than configured
   - See "Option 1" above

2. **Already Listed**: NFT might already be listed
   - Check if it has "Listed" tag
   - Try delisting first

3. **Not Owner**: You don't actually own this NFT
   - Check on blockchain explorer
   - Someone might have bought it

---

## Need More Help?

1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy all error messages
4. Check the transaction on Snowtrace:
   - https://testnet.snowtrace.io/address/[YOUR_WALLET]
5. Look for failed transactions

---

## Quick Reference

### Current Deployment
Check `.env.local` for your current contract addresses:
```bash
cat .env.local | grep CONTRACT
```

### Verify on Blockchain
Visit Snowtrace to verify contracts exist:
- NFT: https://testnet.snowtrace.io/address/[NFT_ADDRESS]
- Marketplace: https://testnet.snowtrace.io/address/[MARKETPLACE_ADDRESS]

### Start Fresh
If everything is broken:
1. Delete `.env.local` contract addresses
2. Redeploy contracts: `npm run deploy:fuji` (in root directory)
3. Update `.env.local` with new addresses
4. Restart dev server
5. Mint fresh NFTs

---

Happy listing! 🚀

