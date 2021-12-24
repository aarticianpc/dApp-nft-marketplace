import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { useState, useEffect } from 'react';

import { nftAddress, marketplaceAddress } from '../config';
import MarketPlace from '../artifacts/contracts/MarketPlace.sol/MarketPlace.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';



export default function MyAssets() {
  const [nfts, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    // provider, tokenContract, marketContract, data for our marketItems
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(marketplaceAddress, MarketPlace.abi, signer);

    const data = await marketContract.fetchMyNFTs();

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



  return (
    <div className='container mx-auto'>
      {
        (loadingState == false && nfts.length == 0) ?
          <div className='mt-4 drop-shadow-lg p-4 border-solid rounded bg-gradient-to-r from-red-800 to-pink-600'>
            <span className='text-white'>You do not hold any NFTs, buy some ;)</span>
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
                </div>
              ))
            }
          </div>
      }
    </div>
  )
}
