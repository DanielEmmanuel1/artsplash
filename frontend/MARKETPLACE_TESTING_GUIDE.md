# 🧪 Marketplace Testing Guide

This guide will help you test all the NFT marketplace functionalities.

## Prerequisites

Before testing, ensure:
1. ✅ Smart contracts are deployed (NFT + Marketplace)
2. ✅ Contract addresses are set in `.env.local`
3. ✅ Wallet is connected to Avalanche Fuji Testnet
4. ✅ Wallet has some AVAX for gas fees
5. ✅ At least one NFT is minted

## 🎯 Test Flows

### 1. Minting NFTs

**Purpose**: Create NFTs to test with

**Steps**:
1. Navigate to `/mint` page
2. Fill in NFT details:
   - Name
   - Description
   - Upload image
3. Click "Mint NFT" button
4. Approve transaction in wallet
5. Wait for confirmation

**Expected Result**:
- ✅ Success message with transaction hash
- ✅ NFT appears in Dashboard

**Demo Mode (Contracts Not Deployed)**:
- NFT is added to local storage only
- No blockchain interaction

---

### 2. Listing NFTs for Sale

**Purpose**: List owned NFTs on the marketplace

**Steps**:
1. Navigate to `/dashboard` page
2. Find an unlisted NFT
3. Click "List for Sale" button
4. Enter price in AVAX (e.g., 0.1)
5. Click "List NFT"
6. **Transaction 1**: Approve marketplace to transfer NFT
   - Approve in wallet
7. **Transaction 2**: List NFT on marketplace
   - Approve in wallet
8. Wait for confirmations

**Expected Result**:
- ✅ Success message with transaction hash
- ✅ NFT shows "Listed" tag in Dashboard
- ✅ NFT appears in `/explore` marketplace
- ✅ Price is displayed

**Console Logs**:
```
📝 Step 1: Approving marketplace to transfer NFT...
⏳ Waiting for approval transaction: 0x...
✅ Approval confirmed!
📝 Step 2: Listing NFT on marketplace...
⏳ Waiting for listing transaction: 0x...
✅ NFT listed successfully!
```

**What Happens on Blockchain**:
- NFT approval is granted to marketplace contract
- Marketplace contract records the listing (price + seller)
- NFT remains in your wallet (not transferred yet)

---

### 3. Buying NFTs from Marketplace

**Purpose**: Purchase listed NFTs

**Steps**:
1. Navigate to `/explore` page
2. Browse available listings
3. Click "Buy Now" on an NFT
4. Confirm purchase in popup
5. Approve transaction in wallet (with AVAX payment)
6. Wait for confirmation

**Expected Result**:
- ✅ Success message with transaction hash
- ✅ NFT disappears from `/explore`
- ✅ NFT appears in your `/dashboard`
- ✅ AVAX is deducted from buyer
- ✅ AVAX is sent to seller
- ✅ Seller's NFT count decreases
- ✅ Buyer's NFT count increases

**Console Logs**:
```
🛒 Buying NFT...
⏳ Waiting for purchase transaction: 0x...
✅ NFT purchased successfully!
```

**What Happens on Blockchain**:
- Marketplace transfers NFT from seller to buyer
- Payment (in AVAX) is transferred to seller
- Listing is removed from marketplace

---

### 4. Delisting NFTs

**Purpose**: Remove NFTs from marketplace

**Steps**:
1. Navigate to `/dashboard` page
2. Find a listed NFT (has "Listed" tag)
3. Click "Delist" button
4. Confirm in popup
5. Approve transaction in wallet
6. Wait for confirmation

**Expected Result**:
- ✅ Success message with transaction hash
- ✅ "Listed" tag is removed
- ✅ NFT disappears from `/explore` marketplace
- ✅ NFT remains in your wallet
- ✅ "List for Sale" button appears again

**Console Logs**:
```
❌ Canceling listing...
⏳ Waiting for cancellation transaction: 0x...
✅ Listing canceled successfully!
```

**What Happens on Blockchain**:
- Marketplace removes the listing
- NFT approval for marketplace is revoked
- NFT stays in original owner's wallet

---

### 5. Viewing Dashboard Stats

**Purpose**: Verify on-chain data accuracy

**Steps**:
1. Navigate to `/dashboard` page
2. Check the stats cards:
   - **Wallet Balance**: Your AVAX balance
   - **Total Minted**: All Artistic Splash NFTs ever minted
   - **My NFTs**: NFTs you own
   - **Listed for Sale**: Your listed NFTs
   - **Total Value**: Combined listing value

**Expected Result**:
- ✅ Stats update after minting
- ✅ Stats update after buying
- ✅ Stats update after listing/delisting
- ✅ "On-Chain" indicator shown when contracts deployed

**Console Logs**:
```
🔍 Scanning ALL ERC721 transfers to your wallet: 0x...
📊 Current block: 12345678
📥 Scanning last 50k blocks...
✅ Found X transfers
🎯 Found Y unique NFTs transferred to you
✨ Added: Token Name (Listed for 0.1 AVAX)
🎉 Final result: Z Artistic Splash NFTs
```

---

### 6. Lazy Loading

**Purpose**: Test performance with many NFTs

**Steps**:
1. Navigate to `/explore` or `/dashboard`
2. Scroll down through NFT grid
3. Observe loading behavior

**Expected Result**:
- ✅ NFTs load as you scroll
- ✅ Skeleton placeholders shown initially
- ✅ Smooth animation when NFT becomes visible
- ✅ Better performance with large collections

---

### 7. Refresh Marketplace

**Purpose**: Sync with latest blockchain state

**Steps**:
1. Navigate to `/explore` page
2. Click "🔄 Refresh Listings" button
3. Wait for scan to complete

**Expected Result**:
- ✅ Loading spinner shown
- ✅ New listings appear
- ✅ Sold/delisted NFTs removed
- ✅ Updated stats

---

## 🔍 Debugging Tips

### Check Console Logs

Open browser DevTools (F12) and check Console for:
- Transaction hashes
- Blockchain scanning progress
- Error messages
- State updates

### Verify on Block Explorer

1. Copy transaction hash from success message
2. Visit: `https://testnet.snowtrace.io/tx/[YOUR_TX_HASH]`
3. Verify:
   - Transaction succeeded
   - Events emitted (Transfer, ItemListed, ItemSold, ItemCanceled)
   - Gas used

### Common Issues

**"Contracts not deployed"**
- Check `.env.local` has valid contract addresses
- Restart dev server after updating `.env.local`

**"Insufficient funds"**
- Get testnet AVAX from: https://faucet.avax.network/

**"User rejected transaction"**
- User canceled in wallet popup
- Try again

**"Execution reverted"**
- Check contract requirements (e.g., price > 0, not already listed)
- Verify NFT ownership

**NFTs not appearing in Dashboard**
- Wait for blockchain scan to complete
- Check console for errors
- Verify NFT is from Artistic Splash contract

**Listing takes 2 transactions**
- This is expected: approval + listing
- Don't close browser until both complete

---

## ✅ Test Checklist

Use this checklist to verify all functionality:

### Minting
- [ ] Mint NFT with image upload
- [ ] See NFT in Dashboard
- [ ] Stats update (Total Minted, My NFTs)

### Listing
- [ ] List NFT with price
- [ ] Approve transactions (2 txs)
- [ ] See "Listed" tag in Dashboard
- [ ] NFT appears in Explore page
- [ ] Listed count increases

### Buying
- [ ] Buy NFT from Explore page
- [ ] NFT transfers to buyer
- [ ] AVAX payment sent to seller
- [ ] NFT disappears from Explore
- [ ] NFT appears in buyer's Dashboard

### Delisting
- [ ] Delist NFT from Dashboard
- [ ] "Listed" tag removed
- [ ] NFT removed from Explore
- [ ] Can list again

### UI/UX
- [ ] Lazy loading works
- [ ] Loading spinners shown
- [ ] Error messages clear
- [ ] Dark mode works
- [ ] Mobile responsive

### Stats
- [ ] Wallet Balance accurate
- [ ] Total Minted correct
- [ ] My NFTs correct
- [ ] Listed count correct
- [ ] Total Value accurate

---

## 🚀 Performance Testing

Test with large datasets:

1. **Mint 20+ NFTs**
2. **List 10+ NFTs**
3. **Navigate to Explore**
   - Should load quickly
   - Lazy loading kicks in
4. **Navigate to Dashboard**
   - Scan completes in <30s
   - All NFTs displayed

---

## 📊 Expected Gas Costs (Fuji Testnet)

Approximate gas costs:
- **Mint NFT**: ~0.001 AVAX
- **Approve Marketplace**: ~0.0005 AVAX
- **List NFT**: ~0.001 AVAX
- **Buy NFT**: ~0.001 AVAX + listing price
- **Delist NFT**: ~0.0005 AVAX

---

## 🎉 Success Criteria

All tests pass when:
1. ✅ All transactions confirm on blockchain
2. ✅ UI updates reflect blockchain state
3. ✅ No console errors
4. ✅ Stats are accurate
5. ✅ NFTs display correctly
6. ✅ Buying/selling works end-to-end
7. ✅ Lazy loading improves performance

---

## 📝 Reporting Issues

If you find bugs, report with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Console logs
5. Transaction hashes
6. Screenshots

---

Happy Testing! 🚀

