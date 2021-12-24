import Head from "next/head";

const Meta = ({ title, keywords, description }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"></link> */}

        <title>{title}</title>
      </Head>
    </>
  );
}

Meta.defaultProps = {
  title: 'NFT Marketplace',
  keywords: 'NFT, Blockchain, Polygon, decentralized',
  description: 'NFT Marketplace: sell, buy or mint nft on NFT Marketplace running on polygon block chain'
}

export default Meta;