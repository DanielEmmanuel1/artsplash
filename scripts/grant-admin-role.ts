import { ethers } from "ethers";
import * as dotenv from "dotenv";
import ArtisticSplashNFTArtifact from "../artifacts/contracts/ArtisticSplashNFT.sol/ArtisticSplashNFT.json";

dotenv.config();

async function main() {
  console.log("👑 Granting ADMIN_ROLE to user...");

  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  const USER_WALLET_ADDRESS = process.env.USER_WALLET_ADDRESS; // Your wallet address

  if (!PRIVATE_KEY || !FUJI_RPC_URL || !NFT_CONTRACT_ADDRESS || !USER_WALLET_ADDRESS) {
    console.error("❌ Error: Missing environment variables. Ensure PRIVATE_KEY, FUJI_RPC_URL, NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, and USER_WALLET_ADDRESS are set in .env");
    return;
  }

  const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
  const adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📝 Admin account:", adminWallet.address);
  console.log("🎯 Granting role to:", USER_WALLET_ADDRESS);

  const nftContract = new ethers.Contract(
    NFT_CONTRACT_ADDRESS,
    ArtisticSplashNFTArtifact.abi,
    adminWallet
  );

  // DEFAULT_ADMIN_ROLE is 0x0000000000000000000000000000000000000000000000000000000000000000
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const hasAdminRole = await nftContract.hasRole(DEFAULT_ADMIN_ROLE, USER_WALLET_ADDRESS);

  if (hasAdminRole) {
    console.log(`✅ ${USER_WALLET_ADDRESS} already has ADMIN_ROLE.`);
    return;
  }

  console.log(`🔄 Granting ADMIN_ROLE to: ${USER_WALLET_ADDRESS}`);
  const tx = await nftContract.grantRole(DEFAULT_ADMIN_ROLE, USER_WALLET_ADDRESS);
  console.log("⏳ Transaction submitted:", tx.hash);
  await tx.wait();
  console.log("✅ ADMIN_ROLE granted successfully!");

  console.log(`🎉 You now have admin privileges with address: ${USER_WALLET_ADDRESS}`);
  console.log(`🔗 View transaction: https://testnet.snowtrace.io/tx/${tx.hash}`);
}

main().catch((error) => {
  console.error("❌ Failed to grant ADMIN_ROLE:", error);
  process.exitCode = 1;
});
