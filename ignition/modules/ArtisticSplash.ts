import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ArtisticSplashModule = buildModule("ArtisticSplashModule", (m) => {
  // Parameters with defaults
  const royaltyBps = m.getParameter("royaltyBps", 250n); // 2.5%
  const platformFeeBps = m.getParameter("platformFeeBps", 250n); // 2.5%
  
  // Get the deployer account
  const deployer = m.getAccount(0);
  
  // Deploy NFT Contract
  const nft = m.contract("ArtisticSplashNFT", [
    deployer, // admin
    deployer, // royalty receiver
    royaltyBps, // royalty basis points
  ]);

  // Deploy Marketplace Contract
  const marketplace = m.contract("ArtisticSplashMarketplace", [
    platformFeeBps, // platform fee basis points
    deployer, // fee recipient
  ]);

  return { nft, marketplace };
});

export default ArtisticSplashModule;

