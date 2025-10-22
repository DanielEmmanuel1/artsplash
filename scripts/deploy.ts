import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Starting deployment to Avalanche...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "AVAX\n");

  // Deployment parameters
  const ADMIN_ADDRESS = deployer.address; // Admin will be the deployer
  const ROYALTY_RECEIVER = deployer.address; // Can be changed later
  const ROYALTY_BPS = 250; // 2.5% royalty
  const PLATFORM_FEE_BPS = 250; // 2.5% platform fee
  const FEE_RECIPIENT = deployer.address; // Platform fee recipient

  console.log("📋 Deployment Configuration:");
  console.log("   Admin Address:", ADMIN_ADDRESS);
  console.log("   Royalty Receiver:", ROYALTY_RECEIVER);
  console.log("   Royalty BPS:", ROYALTY_BPS, "(", ROYALTY_BPS / 100, "%)");
  console.log("   Platform Fee BPS:", PLATFORM_FEE_BPS, "(", PLATFORM_FEE_BPS / 100, "%)");
  console.log("   Fee Recipient:", FEE_RECIPIENT);
  console.log();

  // Deploy NFT Contract
  console.log("🎨 Deploying ArtisticSplashNFT...");
  const ArtisticSplashNFT = await ethers.getContractFactory("ArtisticSplashNFT");
  const nft = await ArtisticSplashNFT.deploy(
    ADMIN_ADDRESS,
    ROYALTY_RECEIVER,
    ROYALTY_BPS
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  
  console.log("✅ ArtisticSplashNFT deployed to:", nftAddress);
  console.log();

  // Deploy Marketplace Contract
  console.log("🏪 Deploying ArtisticSplashMarketplace...");
  const ArtisticSplashMarketplace = await ethers.getContractFactory("ArtisticSplashMarketplace");
  const marketplace = await ArtisticSplashMarketplace.deploy(
    PLATFORM_FEE_BPS,
    FEE_RECIPIENT
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  
  console.log("✅ ArtisticSplashMarketplace deployed to:", marketplaceAddress);
  console.log();

  // Grant MINTER_ROLE to deployer (already has it, but showing how to grant to marketplace if needed)
  console.log("🔑 Configuring roles...");
  const MINTER_ROLE = await nft.MINTER_ROLE();
  
  // Optional: Grant MINTER_ROLE to marketplace contract
  // Uncomment if you want the marketplace to mint NFTs directly
  // const grantTx = await nft.grantRole(MINTER_ROLE, marketplaceAddress);
  // await grantTx.wait();
  // console.log("✅ MINTER_ROLE granted to marketplace contract");
  
  console.log("✅ Deployer has MINTER_ROLE by default");
  console.log();

  // Verification info
  console.log("📄 Deployment Summary:");
  console.log("=" .repeat(60));
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log();
  console.log("ArtisticSplashNFT:");
  console.log("  Address:", nftAddress);
  console.log("  Name: Artistic Splash");
  console.log("  Symbol: ARTS");
  console.log();
  console.log("ArtisticSplashMarketplace:");
  console.log("  Address:", marketplaceAddress);
  console.log("  Platform Fee:", PLATFORM_FEE_BPS / 100, "%");
  console.log();
  console.log("=" .repeat(60));
  console.log();

  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      ArtisticSplashNFT: {
        address: nftAddress,
        deployer: deployer.address,
        constructorArgs: [ADMIN_ADDRESS, ROYALTY_RECEIVER, ROYALTY_BPS]
      },
      ArtisticSplashMarketplace: {
        address: marketplaceAddress,
        deployer: deployer.address,
        constructorArgs: [PLATFORM_FEE_BPS, FEE_RECIPIENT]
      }
    }
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/deployment-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  console.log();

  // Snowtrace verification instructions
  console.log("🔍 To verify contracts on Snowtrace, run:");
  console.log();
  console.log(`npx hardhat verify --network fuji ${nftAddress} "${ADMIN_ADDRESS}" "${ROYALTY_RECEIVER}" ${ROYALTY_BPS}`);
  console.log();
  console.log(`npx hardhat verify --network fuji ${marketplaceAddress} ${PLATFORM_FEE_BPS} "${FEE_RECIPIENT}"`);
  console.log();

  console.log("✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

