// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    // counters to keep track of tokenIds
    Counters.Counter private _tokenIds;

    // contract address
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("AarticianpcNFT", "ARTNFT") {
        contractAddress = marketplaceAddress;
    }

    // minting function
    function mintToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        // minting tokens
        _mint(msg.sender, newTokenId);
        // set the token URI: id & URL
        _setTokenURI(newTokenId, tokenURI);

        // give the marketplace the approval to transact between users
        setApprovalForAll(contractAddress, true);

        // mint the token and sell it for sale - return the id to do so
        return newTokenId;
    }
}
