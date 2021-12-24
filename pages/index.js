import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { useState, useEffect } from 'react';

import { nftAddress, marketplaceAddress } from '../config';
import MarketPlace from '../artifacts/contracts/MarketPlace.sol/MarketPlace.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';



export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    // provider, tokenContract, marketContract, data for our marketItems
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(marketplaceAddress, MarketPlace.abi, provider);

    const data = await marketContract.fetchMarketItems();

    setLoadingState(true);
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      // get token metadata json
      const meta = await axios.get(tokenUri);
      console.log(meta)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image || meta.data.fileUrl,
        name: meta.data.name,
        description: meta.data.description
      }
      return item;
    }));
    console.log(items);
    setNFTs(items);
    setLoadingState(false);
  }

  // function to buy NFTs

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(marketplaceAddress, MarketPlace.abi, signer);
    console.log(nft.price)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    console.log(price)
    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
      value: price
    });

    await transaction.wait();
    loadNFTs();
  }


  return (
    <div className='container mx-auto'>
      {
        (loadingState == false && nfts.length == 0) ?
          <div className='mt-4 drop-shadow-lg p-4 border-solid rounded bg-gradient-to-r from-red-800 to-pink-600'>
            <span className='text-white'>No NFTs in the marketplace</span>
          </div>
          :
          <div className='grid grid-cols-5 gap-4 my-4'>
            {
              nfts.map((nft, i) => (
                <div key={i} className='bg-white border-solid rounded-xl p-4 drop-shadow-md flex flex-col'>
                  <img src={nft.image} alt={nft.name} />
                  <span className='mt-4 font-bold text-2xl text-gray-800'>{nft.name}</span>
                  <span className='font-normal text-base text-gray-400'>{nft.description}</span>
                  <span className="font-semibold text-xl text-purple-800">{nft.price} ETH</span>
                  <button
                    onClick={() => buyNFT(nft)}
                    className="
                      font-bold
                      text-xl
                      bg-gradient-to-r to-blue-800 from-purple-800
                      mt-4 p-4
                      text-white
                      rounded-xl
                      drop-shadow-md
                      border
                      hover:from-pink-600
                      hover:to-rose-500
                      transition-all
                      duration-700
                      ">
                    Buy
                  </button>
                </div>
              ))
            }
          </div>
      }
    </div>
  )
}
