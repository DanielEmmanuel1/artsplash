// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtisticSplashNFT
 * @dev ERC721 NFT contract for Artistic Splash marketplace with royalty support
 * @notice This contract allows minting of NFTs with metadata URIs and includes ERC2981 royalty standard
 */
contract ArtisticSplashNFT is ERC721URIStorage, AccessControl, ERC2981, ReentrancyGuard {
    /// @dev Role identifier for accounts allowed to mint NFTs
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @dev Counter for token IDs
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for computing tokenURI (optional, can override per-token)
    string private _baseTokenURI;

    // Public mint controls
    uint256 public mintFeeWei = 0; // default free
    uint256 public maxPerAddress = 2; // 2 per time window
    uint256 public maxSupply = 0; // 0 = unlimited
    bool public mintPaused = false;
    uint256 public timeWindow = 2 hours; // 2 hours window
    mapping(address => uint256) public mintedBy;
    mapping(address => uint256) public lastMintTime;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event BaseURIUpdated(string baseURI);

    /**
     * @dev Constructor initializes the NFT contract with admin and royalty settings
     * @param admin Address that will have admin role (can grant/revoke roles)
     * @param royaltyReceiver Address that will receive royalty payments
     * @param royaltyBps Royalty basis points (e.g., 250 = 2.5%)
     */
    constructor(
        address admin,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721("Artistic Splash", "ARTS") {
        require(admin != address(0), "Admin address cannot be zero");
        require(royaltyReceiver != address(0), "Royalty receiver cannot be zero");
        require(royaltyBps <= 10000, "Royalty fee too high"); // Max 100%
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin); // Admin can mint by default
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
        
        _tokenIdCounter = 0;
    }

    /**
     * @notice Open public mint with time-based limits (2 per 2 hours)
     * @dev Anyone can mint when not paused and within limits
     */
    function publicMint(string calldata uri) external payable nonReentrant returns (uint256) {
        require(!mintPaused, "Minting paused");
        require(bytes(uri).length > 0, "URI cannot be empty");
        if (mintFeeWei > 0) {
            require(msg.value >= mintFeeWei, "Insufficient mint fee");
        }
        
        // Time-based minting limits
        uint256 currentTime = block.timestamp;
        if (lastMintTime[msg.sender] > 0) {
            // Check if enough time has passed to reset counter
            if (currentTime >= lastMintTime[msg.sender] + timeWindow) {
                mintedBy[msg.sender] = 0; // Reset counter
            }
        }
        
        if (maxPerAddress > 0) {
            require(mintedBy[msg.sender] < maxPerAddress, "Mint limit reached. Try again in 2 hours.");
        }
        if (maxSupply > 0) {
            require(_tokenIdCounter < maxSupply, "Max supply reached");
        }

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        mintedBy[msg.sender] += 1;
        lastMintTime[msg.sender] = currentTime;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTMinted(msg.sender, tokenId, uri);
        return tokenId;
    }

    /**
     * @notice Admin: configure public mint parameters
     */
    function configurePublicMint(
        uint256 _mintFeeWei,
        uint256 _maxPerAddress,
        uint256 _maxSupply,
        uint256 _timeWindow,
        bool _paused
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintFeeWei = _mintFeeWei;
        maxPerAddress = _maxPerAddress;
        maxSupply = _maxSupply;
        timeWindow = _timeWindow;
        mintPaused = _paused;
    }

    /**
     * @notice Admin: withdraw collected mint fees
     */
    function withdraw(address payable to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        to.transfer(bal);
    }

    /**
     * @dev Mints a new NFT with the given URI
     * @param to Address to mint the NFT to
     * @param uri Metadata URI for the NFT (IPFS hash or URL)
     * @return tokenId The ID of the newly minted token
     */
    function safeMint(address to, string memory uri) 
        public 
        onlyRole(MINTER_ROLE) 
        nonReentrant
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(to, tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs to the same address
     * @param to Address to mint the NFTs to
     * @param uris Array of metadata URIs
     * @return tokenIds Array of minted token IDs
     */
    function batchMint(address to, string[] memory uris)
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        returns (uint256[] memory)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(uris.length > 0 && uris.length <= 50, "Invalid batch size");
        
        uint256[] memory tokenIds = new uint256[](uris.length);
        
        for (uint256 i = 0; i < uris.length; i++) {
            require(bytes(uris[i]).length > 0, "URI cannot be empty");
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            tokenIds[i] = tokenId;
            emit NFTMinted(to, tokenId, uris[i]);
        }
        
        return tokenIds;
    }

    /**
     * @dev Updates the default royalty information
     * @param receiver Address that will receive royalties
     * @param feeNumerator Royalty fee in basis points (e.g., 250 = 2.5%)
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(receiver != address(0), "Royalty receiver cannot be zero");
        require(feeNumerator <= 10000, "Royalty fee too high");
        
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @dev Sets royalty information for a specific token
     * @param tokenId Token ID to set royalty for
     * @param receiver Address that will receive royalties
     * @param feeNumerator Royalty fee in basis points
     */
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(receiver != address(0), "Royalty receiver cannot be zero");
        require(feeNumerator <= 10000, "Royalty fee too high");
        
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Sets the base URI for all tokens
     * @param baseURI Base URI string
     */
    function setBaseURI(string memory baseURI) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /**
     * @dev Returns the base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Burns a token (only owner can burn their own tokens)
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner can burn");
        _burn(tokenId);
    }

    /**
     * @dev Required override for supportsInterface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

