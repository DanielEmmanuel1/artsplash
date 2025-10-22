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
  console.log("🔑 Granting MINTER_ROLE...\n");

  // Setup provider and wallet
  const RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📝 Admin account:", wallet.address);

  // NFT contract address (from deployment)
  const NFT_ADDRESS = "0x0B10F687A19eCcb4Af9E39F20C6503eD9e6eD138";
  
  // Address to grant MINTER_ROLE to (your wallet)
  const MINTER_ADDRESS = "0xd17b3a5Ec474E2475e95A2C178d6785CAF3A47ba";

  // Connect to the contract
  const nft = new ethers.Contract(
    NFT_ADDRESS,
    ArtisticSplashNFTArtifact.abi,
    wallet
  );

  // Get MINTER_ROLE
  const MINTER_ROLE = await nft.MINTER_ROLE();
  console.log("MINTER_ROLE hash:", MINTER_ROLE);
  console.log();

  // Check if address already has role
  const hasRole = await nft.hasRole(MINTER_ROLE, MINTER_ADDRESS);
  
  if (hasRole) {
    console.log("✅", MINTER_ADDRESS, "already has MINTER_ROLE");
    return;
  }

  console.log("🔄 Granting MINTER_ROLE to:", MINTER_ADDRESS);
  const tx = await nft.grantRole(MINTER_ROLE, MINTER_ADDRESS);
  
  console.log("⏳ Transaction submitted:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  await tx.wait();
  
  console.log("✅ MINTER_ROLE granted successfully!");
  console.log();
  console.log("🎉 You can now mint NFTs with address:", MINTER_ADDRESS);
  console.log("🔗 View transaction:", `https://testnet.snowtrace.io/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  });

