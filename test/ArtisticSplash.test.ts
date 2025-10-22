import { expect } from "chai";
import { ethers } from "hardhat";
import { ArtisticSplashNFT, ArtisticSplashMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Artistic Splash NFT Marketplace", function () {
  let nft: ArtisticSplashNFT;
  let marketplace: ArtisticSplashMarketplace;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let royaltyReceiver: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const ROYALTY_BPS = 250; // 2.5%
  const PLATFORM_FEE_BPS = 250; // 2.5%
  const NFT_PRICE = ethers.parseEther("1.0");
  const TOKEN_URI = "ipfs://QmTest123";

  beforeEach(async function () {
    [owner, seller, buyer, royaltyReceiver, feeRecipient] = await ethers.getSigners();

    // Deploy NFT contract
    const NFTFactory = await ethers.getContractFactory("ArtisticSplashNFT");
    nft = await NFTFactory.deploy(owner.address, royaltyReceiver.address, ROYALTY_BPS);
    await nft.waitForDeployment();

    // Deploy Marketplace contract
    const MarketplaceFactory = await ethers.getContractFactory("ArtisticSplashMarketplace");
    marketplace = await MarketplaceFactory.deploy(PLATFORM_FEE_BPS, feeRecipient.address);
    await marketplace.waitForDeployment();

    // Grant MINTER_ROLE to seller for testing
    const MINTER_ROLE = await nft.MINTER_ROLE();
    await nft.grantRole(MINTER_ROLE, seller.address);
  });

  describe("NFT Contract", function () {
    describe("Deployment", function () {
      it("Should set the correct name and symbol", async function () {
        expect(await nft.name()).to.equal("Artistic Splash");
        expect(await nft.symbol()).to.equal("ARTS");
      });

      it("Should set the correct admin and minter roles", async function () {
        const DEFAULT_ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
        const MINTER_ROLE = await nft.MINTER_ROLE();
        
        expect(await nft.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        expect(await nft.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      });

      it("Should set correct royalty info", async function () {
        const [receiver, royaltyAmount] = await nft.royaltyInfo(1, NFT_PRICE);
        expect(receiver).to.equal(royaltyReceiver.address);
        expect(royaltyAmount).to.equal((NFT_PRICE * BigInt(ROYALTY_BPS)) / BigInt(10000));
      });

      it("Should revert with zero address admin", async function () {
        const NFTFactory = await ethers.getContractFactory("ArtisticSplashNFT");
        await expect(
          NFTFactory.deploy(ethers.ZeroAddress, royaltyReceiver.address, ROYALTY_BPS)
        ).to.be.revertedWith("Admin address cannot be zero");
      });
    });

    describe("Minting", function () {
      it("Should mint NFT with correct URI", async function () {
        await expect(nft.connect(seller).safeMint(seller.address, TOKEN_URI))
          .to.emit(nft, "NFTMinted")
          .withArgs(seller.address, 1, TOKEN_URI);

        expect(await nft.ownerOf(1)).to.equal(seller.address);
        expect(await nft.tokenURI(1)).to.equal(TOKEN_URI);
        expect(await nft.totalSupply()).to.equal(1);
      });

      it("Should revert when non-minter tries to mint", async function () {
        await expect(
          nft.connect(buyer).safeMint(buyer.address, TOKEN_URI)
        ).to.be.reverted;
      });

      it("Should revert when minting to zero address", async function () {
        await expect(
          nft.connect(seller).safeMint(ethers.ZeroAddress, TOKEN_URI)
        ).to.be.revertedWith("Cannot mint to zero address");
      });

      it("Should revert when minting with empty URI", async function () {
        await expect(
          nft.connect(seller).safeMint(seller.address, "")
        ).to.be.revertedWith("URI cannot be empty");
      });

      it("Should batch mint multiple NFTs", async function () {
        const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];
        const tx = await nft.connect(seller).batchMint(seller.address, uris);
        
        expect(await nft.totalSupply()).to.equal(3);
        expect(await nft.ownerOf(1)).to.equal(seller.address);
        expect(await nft.ownerOf(2)).to.equal(seller.address);
        expect(await nft.ownerOf(3)).to.equal(seller.address);
      });
    });

    describe("Royalties", function () {
      it("Should calculate correct royalty amount", async function () {
        const salePrice = ethers.parseEther("10.0");
        const [receiver, royaltyAmount] = await nft.royaltyInfo(1, salePrice);
        
        expect(receiver).to.equal(royaltyReceiver.address);
        expect(royaltyAmount).to.equal(ethers.parseEther("0.25")); // 2.5%
      });

      it("Should allow admin to update default royalty", async function () {
        const newReceiver = buyer.address;
        const newBps = 500; // 5%
        
        await nft.setDefaultRoyalty(newReceiver, newBps);
        
        const [receiver, royaltyAmount] = await nft.royaltyInfo(1, NFT_PRICE);
        expect(receiver).to.equal(newReceiver);
        expect(royaltyAmount).to.equal((NFT_PRICE * BigInt(newBps)) / BigInt(10000));
      });

      it("Should revert when setting royalty above 100%", async function () {
        await expect(
          nft.setDefaultRoyalty(royaltyReceiver.address, 10001)
        ).to.be.revertedWith("Royalty fee too high");
      });
    });

    describe("Token Management", function () {
      beforeEach(async function () {
        await nft.connect(seller).safeMint(seller.address, TOKEN_URI);
      });

      it("Should allow owner to burn their token", async function () {
        await nft.connect(seller).burn(1);
        await expect(nft.ownerOf(1)).to.be.reverted;
      });

      it("Should revert when non-owner tries to burn", async function () {
        await expect(
          nft.connect(buyer).burn(1)
        ).to.be.revertedWith("Only owner can burn");
      });
    });
  });

  describe("Marketplace Contract", function () {
    let tokenId: number;

    beforeEach(async function () {
      // Mint an NFT to seller
      await nft.connect(seller).safeMint(seller.address, TOKEN_URI);
      tokenId = 1;
    });

    describe("Listing", function () {
      it("Should list NFT for sale", async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        
        await expect(marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE))
          .to.emit(marketplace, "Listed")
          .withArgs(await nft.getAddress(), tokenId, seller.address, NFT_PRICE);

        const listing = await marketplace.getListing(await nft.getAddress(), tokenId);
        expect(listing.seller).to.equal(seller.address);
        expect(listing.price).to.equal(NFT_PRICE);
        expect(listing.active).to.be.true;

        // NFT should be transferred to marketplace
        expect(await nft.ownerOf(tokenId)).to.equal(await marketplace.getAddress());
      });

      it("Should revert when listing with zero price", async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        
        await expect(
          marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, 0)
        ).to.be.revertedWith("Price must be greater than zero");
      });

      it("Should revert when non-owner tries to list", async function () {
        await expect(
          marketplace.connect(buyer).listItem(await nft.getAddress(), tokenId, NFT_PRICE)
        ).to.be.revertedWith("Not token owner");
      });

      it("Should revert when listing already listed item", async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        await marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE);
        
        await expect(
          marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE)
        ).to.be.revertedWith("Already listed");
      });
    });

    describe("Canceling", function () {
      beforeEach(async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        await marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE);
      });

      it("Should cancel listing and return NFT to seller", async function () {
        await expect(marketplace.connect(seller).cancelListing(await nft.getAddress(), tokenId))
          .to.emit(marketplace, "Cancelled")
          .withArgs(await nft.getAddress(), tokenId, seller.address);

        const listing = await marketplace.getListing(await nft.getAddress(), tokenId);
        expect(listing.active).to.be.false;

        // NFT should be returned to seller
        expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
      });

      it("Should revert when non-seller tries to cancel", async function () {
        await expect(
          marketplace.connect(buyer).cancelListing(await nft.getAddress(), tokenId)
        ).to.be.revertedWith("Not seller");
      });

      it("Should revert when canceling non-listed item", async function () {
        await expect(
          marketplace.connect(seller).cancelListing(await nft.getAddress(), 999)
        ).to.be.revertedWith("Not listed");
      });
    });

    describe("Buying", function () {
      beforeEach(async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        await marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE);
      });

      it("Should buy NFT and distribute funds correctly", async function () {
        const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
        const royaltyReceiverBalanceBefore = await ethers.provider.getBalance(royaltyReceiver.address);
        const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);

        const expectedRoyalty = (NFT_PRICE * BigInt(ROYALTY_BPS)) / BigInt(10000);
        const expectedPlatformFee = (NFT_PRICE * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
        const expectedSellerProceeds = NFT_PRICE - expectedRoyalty - expectedPlatformFee;

        await expect(marketplace.connect(buyer).buyItem(await nft.getAddress(), tokenId, { value: NFT_PRICE }))
          .to.emit(marketplace, "Bought");

        // Check NFT ownership
        expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);

        // Check proceeds are recorded
        expect(await marketplace.proceeds(seller.address)).to.equal(expectedSellerProceeds);
        expect(await marketplace.proceeds(royaltyReceiver.address)).to.equal(expectedRoyalty);
        expect(await marketplace.proceeds(feeRecipient.address)).to.equal(expectedPlatformFee);

        // Listing should be inactive
        const listing = await marketplace.getListing(await nft.getAddress(), tokenId);
        expect(listing.active).to.be.false;
      });

      it("Should revert when buying with incorrect price", async function () {
        await expect(
          marketplace.connect(buyer).buyItem(await nft.getAddress(), tokenId, { value: ethers.parseEther("0.5") })
        ).to.be.revertedWith("Incorrect price");
      });

      it("Should revert when seller tries to buy own NFT", async function () {
        await expect(
          marketplace.connect(seller).buyItem(await nft.getAddress(), tokenId, { value: NFT_PRICE })
        ).to.be.revertedWith("Seller cannot buy own NFT");
      });

      it("Should revert when buying non-listed item", async function () {
        await expect(
          marketplace.connect(buyer).buyItem(await nft.getAddress(), 999, { value: NFT_PRICE })
        ).to.be.revertedWith("Not listed");
      });
    });

    describe("Withdrawing Proceeds", function () {
      beforeEach(async function () {
        await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        await marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE);
        await marketplace.connect(buyer).buyItem(await nft.getAddress(), tokenId, { value: NFT_PRICE });
      });

      it("Should allow seller to withdraw proceeds", async function () {
        const proceedsBefore = await marketplace.proceeds(seller.address);
        expect(proceedsBefore).to.be.gt(0);

        const balanceBefore = await ethers.provider.getBalance(seller.address);
        const tx = await marketplace.connect(seller).withdrawProceeds();
        const receipt = await tx.wait();
        const gasCost = receipt!.gasUsed * receipt!.gasPrice;

        const balanceAfter = await ethers.provider.getBalance(seller.address);
        const proceedsAfter = await marketplace.proceeds(seller.address);

        expect(proceedsAfter).to.equal(0);
        expect(balanceAfter).to.equal(balanceBefore + proceedsBefore - gasCost);
      });

      it("Should revert when withdrawing with no proceeds", async function () {
        await expect(
          marketplace.connect(owner).withdrawProceeds()
        ).to.be.revertedWith("No proceeds to withdraw");
      });
    });

    describe("Platform Fee Management", function () {
      it("Should allow owner to update platform fee", async function () {
        const newFee = 500; // 5%
        await marketplace.setPlatformFee(newFee);
        expect(await marketplace.platformFeeBps()).to.equal(newFee);
      });

      it("Should revert when setting fee above maximum", async function () {
        await expect(
          marketplace.setPlatformFee(1001)
        ).to.be.revertedWith("Fee too high");
      });

      it("Should revert when non-owner tries to update fee", async function () {
        await expect(
          marketplace.connect(seller).setPlatformFee(500)
        ).to.be.reverted;
      });

      it("Should allow owner to update fee recipient", async function () {
        const newRecipient = seller.address;
        await marketplace.setFeeRecipient(newRecipient);
        expect(await marketplace.feeRecipient()).to.equal(newRecipient);
      });
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete marketplace flow", async function () {
      // 1. Mint NFT
      await nft.connect(seller).safeMint(seller.address, TOKEN_URI);
      const tokenId = 1;

      // 2. Approve and list
      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listItem(await nft.getAddress(), tokenId, NFT_PRICE);

      // 3. Buy
      await marketplace.connect(buyer).buyItem(await nft.getAddress(), tokenId, { value: NFT_PRICE });

      // 4. Verify ownership
      expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);

      // 5. Withdraw proceeds
      const sellerProceeds = await marketplace.proceeds(seller.address);
      expect(sellerProceeds).to.be.gt(0);
      
      await marketplace.connect(seller).withdrawProceeds();
      expect(await marketplace.proceeds(seller.address)).to.equal(0);
    });

    it("Should handle multiple listings and sales", async function () {
      // Mint multiple NFTs
      const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];
      await nft.connect(seller).batchMint(seller.address, uris);

      // List all NFTs
      for (let i = 1; i <= 3; i++) {
        await nft.connect(seller).approve(await marketplace.getAddress(), i);
        await marketplace.connect(seller).listItem(await nft.getAddress(), i, NFT_PRICE);
      }

      // Buy all NFTs
      for (let i = 1; i <= 3; i++) {
        await marketplace.connect(buyer).buyItem(await nft.getAddress(), i, { value: NFT_PRICE });
        expect(await nft.ownerOf(i)).to.equal(buyer.address);
      }

      // Verify total proceeds
      const totalExpectedProceeds = (NFT_PRICE * BigInt(3) * BigInt(10000 - ROYALTY_BPS - PLATFORM_FEE_BPS)) / BigInt(10000);
      expect(await marketplace.proceeds(seller.address)).to.equal(totalExpectedProceeds);
    });
  });
});

