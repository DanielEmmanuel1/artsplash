// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArtisticSplashMarketplace
 * @dev Decentralized marketplace for buying and selling NFTs with royalty support
 * @notice Users can list NFTs for sale, buy listed NFTs, and cancel their listings
 */
contract ArtisticSplashMarketplace is ReentrancyGuard, IERC721Receiver, Ownable {
    
    /// @dev Listing structure for each NFT
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    /// @dev Mapping from NFT contract address => token ID => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    /// @dev Mapping to track seller proceeds available for withdrawal
    mapping(address => uint256) public proceeds;
    
    /// @dev Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFeeBps;
    
    /// @dev Maximum platform fee (10% = 1000 bps)
    uint256 public constant MAX_PLATFORM_FEE = 1000;
    
    /// @dev Address to receive platform fees
    address public feeRecipient;

    // Events
    event Listed(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event Bought(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 royaltyAmount,
        uint256 platformFee
    );
    
    event Cancelled(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event ProceedsWithdrawn(address indexed seller, uint256 amount);
    
    event PlatformFeeUpdated(uint256 newFeeBps);
    
    event FeeRecipientUpdated(address indexed newRecipient);

    /**
     * @dev Constructor initializes the marketplace with fee settings
     * @param _platformFeeBps Initial platform fee in basis points
     * @param _feeRecipient Address to receive platform fees
     */
    constructor(uint256 _platformFeeBps, address _feeRecipient) Ownable(msg.sender) {
        require(_platformFeeBps <= MAX_PLATFORM_FEE, "Fee too high");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        platformFeeBps = _platformFeeBps;
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Lists an NFT for sale in the marketplace
     * @param nft Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Sale price in wei
     */
    function listItem(address nft, uint256 tokenId, uint256 price)
        external
        nonReentrant
    {
        require(price > 0, "Price must be greater than zero");
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!listings[nft][tokenId].active, "Already listed");
        
        // Transfer NFT to marketplace for escrow
        IERC721(nft).safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Create listing
        listings[nft][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit Listed(nft, tokenId, msg.sender, price);
    }

    /**
     * @dev Cancels an active listing and returns the NFT to seller
     * @param nft Address of the NFT contract
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(address nft, uint256 tokenId)
        external
        nonReentrant
    {
        Listing memory listing = listings[nft][tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        // Delete listing
        delete listings[nft][tokenId];
        
        // Return NFT to seller
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit Cancelled(nft, tokenId, msg.sender);
    }

    /**
     * @dev Buys a listed NFT
     * @param nft Address of the NFT contract
     * @param tokenId Token ID to buy
     */
    function buyItem(address nft, uint256 tokenId)
        external
        payable
        nonReentrant
    {
        Listing memory listing = listings[nft][tokenId];
        require(listing.active, "Not listed");
        require(msg.value == listing.price, "Incorrect price");
        require(msg.sender != listing.seller, "Seller cannot buy own NFT");
        
        // Delete listing before transfers (CEI pattern)
        delete listings[nft][tokenId];
        
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        
        // Handle royalties if ERC2981 is supported
        (royaltyReceiver, royaltyAmount) = _handleRoyalty(nft, tokenId, msg.value);
        
        // Calculate seller proceeds
        uint256 sellerProceeds = msg.value - royaltyAmount - platformFee;
        
        // Update proceeds balances (pull payment pattern)
        proceeds[listing.seller] += sellerProceeds;
        
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            proceeds[royaltyReceiver] += royaltyAmount;
        }
        
        if (platformFee > 0) {
            proceeds[feeRecipient] += platformFee;
        }
        
        // Transfer NFT to buyer
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit Bought(
            nft,
            tokenId,
            msg.sender,
            listing.seller,
            msg.value,
            royaltyAmount,
            platformFee
        );
    }

    /**
     * @dev Withdraws accumulated proceeds for the caller
     */
    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds to withdraw");
        
        // Reset proceeds before transfer (CEI pattern)
        proceeds[msg.sender] = 0;
        
        // Transfer proceeds
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Updates the platform fee (only owner)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_PLATFORM_FEE, "Fee too high");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @dev Updates the fee recipient address (only owner)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @dev Gets listing details
     * @param nft Address of the NFT contract
     * @param tokenId Token ID
     * @return Listing details
     */
    function getListing(address nft, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return listings[nft][tokenId];
    }

    /**
     * @dev Internal function to handle royalty calculations
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param salePrice Sale price
     * @return receiver Royalty receiver address
     * @return royaltyAmount Royalty amount in wei
     */
    function _handleRoyalty(address nft, uint256 tokenId, uint256 salePrice)
        internal
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        // Check if contract supports ERC2981
        try IERC165(nft).supportsInterface(type(IERC2981).interfaceId) returns (bool supported) {
            if (supported) {
                try IERC2981(nft).royaltyInfo(tokenId, salePrice) returns (
                    address _receiver,
                    uint256 _royaltyAmount
                ) {
                    // Validate royalty amount is reasonable
                    if (_royaltyAmount <= salePrice && _receiver != address(0)) {
                        return (_receiver, _royaltyAmount);
                    }
                } catch {
                    // Royalty query failed, return no royalty
                    return (address(0), 0);
                }
            }
        } catch {
            // Interface check failed, return no royalty
            return (address(0), 0);
        }
        
        return (address(0), 0);
    }

    /**
     * @dev Required to receive ERC721 tokens via safeTransferFrom
     */
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @dev Emergency function to rescue stuck tokens (only owner)
     * @param nft NFT contract address
     * @param tokenId Token ID to rescue
     * @param to Address to send the token to
     */
    function rescueToken(address nft, uint256 tokenId, address to)
        external
        onlyOwner
    {
        require(!listings[nft][tokenId].active, "Cannot rescue listed token");
        IERC721(nft).safeTransferFrom(address(this), to, tokenId);
    }
}

