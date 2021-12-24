import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-violet-800 to-fuchsia-800 py-6">
        <div className="container mx-auto">
          <div className="flex justify-between">
            <span className="text-white text">NFT MarketPlace</span>
            <div className="flex flex-row align-middle justify-between">
              <Link href="/">
                <a className="text-white px-4 cursor-pointer hover:underline">Main marketplace</a>
              </Link>
              <Link href="/mint-item">
                <a className="text-white px-4 cursor-pointer hover:underline">Mint Tokens</a>
              </Link>
              <Link href="/my-nfts">
                <a className="text-white px-4 cursor-pointer hover:underline">My NFTs</a>
              </Link>
              <Link href="/account-dashboard">
                <a className="text-white pl-4 cursor-pointer hover:underline">Account Dashboard</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;