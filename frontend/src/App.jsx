import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import cupcake from './assets/cupcake.png';

import myEpicNft from "./utils/MyEpicNFT.json";

const TWITTER_HANDLE = 'petalsnap';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-cblyusyeof';
const TOTAL_MINT_COUNT = 500;

 
const CONTRACT_ADDRESS = "0xebEAd3cfA58Fb548caf6B49CA490463b721e7338";
  // String, hex code of the chainId of the Goerli test network
  const goerliChainId = "0x5"; 
    


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalMinted, setTotalMinted] = useState(0);
  const [isMining, setIsMining] = useState(false);
  
  
 const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("make sure you have metamask");
      return;
    } else {
      console.log("we have ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("connected to chain: ", chainId);
    if(chainId !== goerliChainId) {
      alert("you're not connected to the Goerli Test Network!");
      return;
    } else {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if(accounts.length!==0) {
      const account = accounts[0];
      console.log("found an authorised account: ", account);
      setCurrentAccount(account);

      setupEventListener();
      getTotalMinted();
      } else {
        console.log("no authorised account found");
      }
    }
   
  }

  /*
  * Implement your connectWallet method here
  */
  
 const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
        } else {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]); 

        setupEventListener();
      }
    } catch (error) {
      console.log(error);
    }
  }


  // Setup our listener.
 const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;
      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

   const getTotalMinted = async () => {
    try {
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let totalNFTMinted = await connectedContract.getTotalMinted();
        setTotalMinted(totalNFTMinted.toNumber());

      } else {
        console.log("ethereum object doesn't exist");
      }
    } catch(error) {
      console.log(error);
    }
  }
  
 const askContractToMintNft = async () => {
    
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      console.log("Going to pop wallet now to pay gas...")
      let nftTxn = await connectedContract.makeAnEpicNFT();
      setIsMining(true);
      console.log("Mining...please wait.")
      await nftTxn.wait();
      
      console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
      setIsMining(false);
      getTotalMinted();
      
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

   const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

   const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Cupcake NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <img alt="Cupcake Logo" className="cupcake" src={cupcake} /><br></br>
          <p className="sub-sub-text">{totalMinted}/{TOTAL_MINT_COUNT}</p>
          {!currentAccount ? renderNotConnectedContainer() :
          (
            <button onClick={askContractToMintNft} className="cta-button mint-button" disabled={isMining}>Mint NFT</button>
          )}
          
         
        </div>
        <div className="footer-container">
          <a href={OPENSEA_LINK} className="opensea-button" target="_blank">🌊 View Collection on OpenSea</a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`buily by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
