import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Load NFT contract artifact
const ArtisticSplashNFTArtifact = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/ArtisticSplashNFT.sol/ArtisticSplashNFT.json"),
    "utf-8"
  )
);

async function main() {
  console.log("🧪 Testing mint function...\n");

  // Setup provider
  const RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📝 Testing with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "AVAX");
  console.log();

  // NFT contract address
  const NFT_ADDRESS = "0x0B10F687A19eCcb4Af9E39F20C6503eD9e6eD138";
  
  // User address (the one trying to mint)
  const USER_ADDRESS = "0xd17b3a5Ec474E2475e95A2C178d6785CAF3A47ba";

  // Connect to the contract
  const nft = new ethers.Contract(
    NFT_ADDRESS,
    ArtisticSplashNFTArtifact.abi,
    wallet
  );

  // Check user balance
  console.log("🔍 Checking user address:", USER_ADDRESS);
  const userBalance = await provider.getBalance(USER_ADDRESS);
  console.log("💰 User balance:", ethers.formatEther(userBalance), "AVAX");
  console.log();

  // Check if user has MINTER_ROLE
  const MINTER_ROLE = await nft.MINTER_ROLE();
  const hasMinterRole = await nft.hasRole(MINTER_ROLE, USER_ADDRESS);
  console.log("🔑 User has MINTER_ROLE:", hasMinterRole);
  console.log();

  // Check total supply
  const totalSupply = await nft.totalSupply();
  console.log("📊 Current total supply:", totalSupply.toString());
  console.log();

  // Try to estimate gas for the mint
  const testURI = "ipfs://QmQ5WqEc75mqGXU9GjSGH7exjFJTh6RUAYwAqbyNGoLwWB";
  console.log("🧪 Testing mint with URI:", testURI);
  console.log("🧪 Minting to:", USER_ADDRESS);
  console.log();

  try {
    // Try to estimate gas (this will show the revert reason if it fails)
    const gasEstimate = await nft.safeMint.estimateGas(USER_ADDRESS, testURI);
    console.log("✅ Gas estimate successful:", gasEstimate.toString());
    console.log("💡 Transaction should work! Gas needed:", ethers.formatUnits(gasEstimate, "gwei"), "gwei");
  } catch (error: any) {
    console.error("❌ Gas estimation failed!");
    console.error("Error:", error.message);
    
    // Try to get more details
    if (error.data) {
      console.error("Error data:", error.data);
    }
    
    // Try calling statically to get revert reason
    try {
      await nft.safeMint.staticCall(USER_ADDRESS, testURI);
    } catch (staticError: any) {
      console.error("\n📋 Detailed revert reason:");
      console.error(staticError);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  });

