import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import Web3Modal from 'web3modal';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { nftAddress, marketplaceAddress } from '../config';
import MarketPlace from '../artifacts/contracts/MarketPlace.sol/MarketPlace.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const MintItem = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });

  const router = useRouter();

  // upload file to ipfs
  async function handleOnChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(
        file, {
        progress: (prog) => console.log(`received: ${prog}`)
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file', error);
    }
  }

  // upload data to ipfs
  async function createMarketItem() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) {
      return;
    }

    // upload to ipfs
    const data = JSON.stringify({
      name, description, price, image: fileUrl
    });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log('Error while creating an market item.', error);
    }
  }

  // creates the item and list them on marketplace
  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // create the token
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.mintToken(url);
    let tx = await transaction.wait();
    console.log(tx, tx.events);
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    // list the item for sale on the marketplace
    contract = new ethers.Contract(marketplaceAddress, MarketPlace.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice
    });
    await transaction.wait();
    router.push('./')

  }

  return (
    <>
      <div className='container mx-auto'>
        <div className="flex justify-center my-5">

          <div className='w-1/2 flex flex-col'>
            <input
              type="text"
              placeholder='Assest name'
              className='mt-2 border rounded p-4'
              onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
            />
            <textarea
              placeholder='Assest description'
              className='mt-2 border rounded p-4'
              onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
            />
            <input
              type="text"
              placeholder='Assest price in eth'
              className='mt-2 border rounded p-4'
              onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
            />

            <label className="block my-2">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                onChange={handleOnChange}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100
              "/>
            </label>
            {fileUrl && (
              <div className="shrink-0">
                <img className="h-16 w-16 object-cover" src={fileUrl} alt="item" />
              </div>
            )}

            <button
              onClick={createMarketItem}
              className='
                bg-gradient-to-r from-purple-800 to-pink-600 
                text-white 
                py-4 px-12 
                drop-shadow-lg 
                rounded
                hover:from-pink-600
                hover:to-purple-800
                transition
                duration-750
                ease-in-out
              '>
              Mint NFT
            </button>


          </div>

        </div>
      </div>
    </>
  )
}

export default MintItem;