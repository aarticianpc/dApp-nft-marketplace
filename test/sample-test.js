const { expect } = require("chai");
const { ethers } = require("hardhat");
const { list } = require("postcss");

describe("MarketPlace", function () {
  it("Should mint and trade NFTs", async function () {
    // MarketPlace Contract
    const MarketPlace = await ethers.getContractFactory("MarketPlace");
    const market = await MarketPlace.deploy();
    await market.deployed();
    const marketContractAddress = market.address;

    // NFT contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketContractAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    // Get listing price
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    // Demo price
    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    // test for minting
    await nft.mintToken('https-t1')
    await nft.mintToken('https-t2')

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice });

    // Test for different address from different users - test accounts
    // return an array of however many addresses
    const [_, buyerAddress] = await ethers.getSigners();

    // Create a market sale with address, id and price
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {
      value: auctionPrice
    });

    let items = await market.fetchMarketItems();

    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }));
    console.log('items', items);
  });
});
