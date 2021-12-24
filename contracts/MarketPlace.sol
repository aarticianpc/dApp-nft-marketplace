// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Security againsts the transaction for multiple requests
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract MarketPlace is ReentrancyGuard {
    using Counters for Counters.Counter;

    // To store tokenIds
    Counters.Counter private _tokenIds;
    // To store sold tokenIds
    Counters.Counter private _tokensSold;

    // determine owner for the transact
    // charge a listing fee
    address payable owner;

    // basic listing price
    // deployed to polygon matic API and we can use ether & matic token same way.
    uint256 listingPrice = 0.045 ether;

    // Set the owner
    constructor() {
        owner = payable(msg.sender);
    }

    // Struct to hold information about token
    struct MarketToken {
        uint256 itemId;
        address nftContractAddress;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // mapping of market token
    mapping(uint256 => MarketToken) private idToMarketToken;

    // Event for marketPlace token minting
    event MarketTokenMinted(
        uint256 indexed itemId,
        address indexed nftContractAddress,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // get the listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // 1. create a market item to put it up for a sale
    // 2. create a market sale for buying & selling between parties

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        // nonReentrant is a modifier to prevent reentry attack
        require(price > 0, "Error: Require atlease one wei");
        require(
            msg.value == listingPrice,
            "Error: price must be equal to listing price"
        );

        _tokenIds.increment();
        uint256 itemId = _tokenIds.current();
        // putting it up for sale
        idToMarketToken[itemId] = MarketToken(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        // NFT transaction
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketTokenMinted(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // function to conduct transactions and market sales
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketToken[itemId].price;
        uint256 tokenId = idToMarketToken[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price");

        // transfer amount to the seller
        idToMarketToken[itemId].seller.transfer(msg.value);

        // Transfer the token from contract address to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketToken[itemId].owner = payable(msg.sender);
        idToMarketToken[itemId].sold = true;
        _tokensSold.increment();

        payable(owner).transfer(listingPrice);
    }

    // function to fetchMarketItems - minting, buying & selling
    // returns unsold items

    function fetchMarketItems() public view returns (MarketToken[] memory) {
        uint256 itemsCount = _tokenIds.current();
        uint256 unsoldItemCount = itemsCount - _tokensSold.current();
        uint256 currentIndex = 0;

        // Looping over the no of items created
        // If number has not been sold populate the mapping
        MarketToken[] memory items = new MarketToken[](unsoldItemCount);
        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketToken[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // return nfts that are purchased

    function fetchMyNFTs() public view returns (MarketToken[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        // a second counter for each individual user
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].owner == address(msg.sender)) {
                itemCount += 1;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].owner == address(msg.sender)) {
                uint256 currentId = idToMarketToken[i + 1].itemId;

                // current array
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // function for returning an array of minted nfts
    function fetchItemsCreated() public view returns (MarketToken[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        // a second counter for each individual user
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].seller == address(msg.sender)) {
                itemCount += 1;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].seller == address(msg.sender)) {
                uint256 currentId = idToMarketToken[i + 1].itemId;

                // current array
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}
