import { ethers } from "ethers";
import * as dotenv from "dotenv";
import ArtisticSplashNFTArtifact from "../artifacts/contracts/ArtisticSplashNFT.sol/ArtisticSplashNFT.json";

dotenv.config();

async function main() {
  console.log("🔍 Checking role hashes and permissions...");

  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  const USER_WALLET_ADDRESS = process.env.USER_WALLET_ADDRESS;

  if (!PRIVATE_KEY || !FUJI_RPC_URL || !NFT_CONTRACT_ADDRESS || !USER_WALLET_ADDRESS) {
    console.error("❌ Missing environment variables");
    return;
  }

  const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const nftContract = new ethers.Contract(
    NFT_CONTRACT_ADDRESS,
    ArtisticSplashNFTArtifact.abi,
    wallet
  );

  // Calculate role hashes
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  console.log("📋 Role Hashes:");
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  console.log("MINTER_ROLE:", MINTER_ROLE);

  // Check roles for deployer
  console.log("\n👤 Deployer (Admin) Role Check:");
  const deployerHasAdmin = await nftContract.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
  const deployerHasMinter = await nftContract.hasRole(MINTER_ROLE, wallet.address);
  console.log("Has ADMIN_ROLE:", deployerHasAdmin);
  console.log("Has MINTER_ROLE:", deployerHasMinter);

  // Check roles for user
  console.log("\n👤 User Role Check:");
  const userHasAdmin = await nftContract.hasRole(DEFAULT_ADMIN_ROLE, USER_WALLET_ADDRESS);
  const userHasMinter = await nftContract.hasRole(MINTER_ROLE, USER_WALLET_ADDRESS);
  console.log("Has ADMIN_ROLE:", userHasAdmin);
  console.log("Has MINTER_ROLE:", userHasMinter);

  // Test with a random address
  const randomAddress = "0x1234567890123456789012345678901234567890";
  console.log("\n👤 Random Address Role Check:");
  const randomHasAdmin = await nftContract.hasRole(DEFAULT_ADMIN_ROLE, randomAddress);
  const randomHasMinter = await nftContract.hasRole(MINTER_ROLE, randomAddress);
  console.log("Has ADMIN_ROLE:", randomHasAdmin);
  console.log("Has MINTER_ROLE:", randomHasMinter);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
