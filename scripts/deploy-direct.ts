import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load compiled contract artifacts
const ArtisticSplashNFTArtifact = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/ArtisticSplashNFT.sol/ArtisticSplashNFT.json"),
    "utf-8"
  )
);

const ArtisticSplashMarketplaceArtifact = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/ArtisticSplashMarketplace.sol/ArtisticSplashMarketplace.json"),
    "utf-8"
  )
);

dotenv.config();

async function main() {
  console.log("🚀 Starting deployment to Avalanche Fuji...\n");

  // Setup provider and wallet
  const RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📝 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "AVAX\n");

  if (balance === 0n) {
    throw new Error("Account has no AVAX for gas fees!");
  }

  // Deployment parameters
  const ADMIN_ADDRESS = wallet.address;
  const ROYALTY_RECEIVER = wallet.address;
  const ROYALTY_BPS = 250; // 2.5% royalty
  const PLATFORM_FEE_BPS = 250; // 2.5% platform fee
  const FEE_RECIPIENT = wallet.address;

  console.log("🔧 Deployment Configuration:");
  console.log("   Admin:", ADMIN_ADDRESS);
  console.log("   Royalty Receiver:", ROYALTY_RECEIVER);
  console.log("   Royalty BPS:", ROYALTY_BPS, "(", ROYALTY_BPS / 100, "%)");
  console.log("   Platform Fee BPS:", PLATFORM_FEE_BPS, "(", PLATFORM_FEE_BPS / 100, "%)");
  console.log("   Fee Recipient:", FEE_RECIPIENT);
  console.log();

  // Deploy NFT Contract
  console.log("🎨 Deploying ArtisticSplashNFT...");
  const nftFactory = new ethers.ContractFactory(
    ArtisticSplashNFTArtifact.abi,
    ArtisticSplashNFTArtifact.bytecode,
    wallet
  );
  
  const nft = await nftFactory.deploy(
    ADMIN_ADDRESS,
    ROYALTY_RECEIVER,
    ROYALTY_BPS
  );
  
  console.log("⏳ Waiting for deployment transaction...");
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  
  console.log("✅ ArtisticSplashNFT deployed to:", nftAddress);
  console.log();

  // Deploy Marketplace Contract
  console.log("🏪 Deploying ArtisticSplashMarketplace...");
  const marketplaceFactory = new ethers.ContractFactory(
    ArtisticSplashMarketplaceArtifact.abi,
    ArtisticSplashMarketplaceArtifact.bytecode,
    wallet
  );
  
  const marketplace = await marketplaceFactory.deploy(
    PLATFORM_FEE_BPS,
    FEE_RECIPIENT
  );
  
  console.log("⏳ Waiting for deployment transaction...");
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  
  console.log("✅ ArtisticSplashMarketplace deployed to:", marketplaceAddress);
  console.log();

  // Grant MINTER_ROLE to deployer
  console.log("🔑 Setting up roles...");
  const MINTER_ROLE = await nft.MINTER_ROLE();
  const hasMinterRole = await nft.hasRole(MINTER_ROLE, wallet.address);
  
  if (!hasMinterRole) {
    console.log("⏳ Granting MINTER_ROLE to deployer...");
    const tx = await nft.grantRole(MINTER_ROLE, wallet.address);
    await tx.wait();
    console.log("✅ Granted MINTER_ROLE to deployer");
  } else {
    console.log("✅ Deployer already has MINTER_ROLE");
  }
  console.log();

  // Get network info
  const network = await provider.getNetwork();

  // Verification info
  console.log("📄 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Network: Fuji Testnet");
  console.log("Chain ID:", network.chainId);
  console.log();
  console.log("ArtisticSplashNFT:");
  console.log("  Address:", nftAddress);
  console.log("  Name: Artistic Splash");
  console.log("  Symbol: ARTS");
  console.log();
  console.log("ArtisticSplashMarketplace:");
  console.log("  Address:", marketplaceAddress);
  console.log("=".repeat(60));
  console.log();

  // Save deployment addresses to file
  const deploymentInfo = {
    network: "fuji",
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      ArtisticSplashNFT: {
        address: nftAddress,
        deployer: wallet.address,
        royaltyBps: ROYALTY_BPS,
        royaltyReceiver: ROYALTY_RECEIVER,
      },
      ArtisticSplashMarketplace: {
        address: marketplaceAddress,
        deployer: wallet.address,
        platformFeeBps: PLATFORM_FEE_BPS,
        feeRecipient: FEE_RECIPIENT,
      },
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to file
  const deploymentFile = path.join(deploymentsDir, `fuji-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log();

  console.log("🎉 Deployment Complete!");
  console.log();
  console.log("📋 Next Steps:");
  console.log("1. Add these addresses to frontend/.env.local:");
  console.log(`   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${nftAddress}`);
  console.log(`   NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`);
  console.log();
  console.log("2. Restart your frontend dev server:");
  console.log("   cd frontend && npm run dev");
  console.log();
  console.log("3. Verify contracts on Snowtrace:");
  console.log(`   https://testnet.snowtrace.io/address/${nftAddress}`);
  console.log(`   https://testnet.snowtrace.io/address/${marketplaceAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  });

