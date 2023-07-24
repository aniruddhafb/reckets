import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers, Wallet } from "ethers";

// importing external techs
import { ThirdwebStorage } from "@thirdweb-dev/storage";

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import '@/styles/globals.css'
import '@/styles/bootstrap.min.css'
import '@/styles/style.css'
import '@/styles/responsive.css'

import '@/styles/animate.min.css'
import '@/styles/fontawsome.min.css'
import '@/styles/meanmenu.min.css'
import '@/styles/nice-select.min.css'
import '@/styles/barfiller.min.css'
import '@/styles/magnific-popup.min.css'
import '@/styles/odometer.min.css'



export default function App({ Component, pageProps }) {
  const router = useRouter();

  const storage = new ThirdwebStorage();

  const [signer, setSigner] = useState();
  const [provider, set_provider] = useState();
  const [chainIdMain, setChainIdMain] = useState();
  const [signer_address, set_signer_address] = useState("");
  const [signer_bal, set_signer_bal] = useState(0);
  const [format_signer_bal, set_format_signer_bal] = useState(0);
  const [nfts, set_nfts] = useState([]);

  const defaultCollectionAddress = "0x54aD752a6F238Ab6D674bbde887231e241fc6098";
  const marketplaceAddress = "0x315Fb6A0D6Ea560b6D87425b029052112987C6cC";

  const connectToWallet = async () => {
    if (window?.ethereum) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      set_provider(provider);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      setSigner(signer);

      const user_address = await signer.getAddress();
      set_signer_address(user_address);

      const user_balance = await signer.getBalance();
      const signerToStr = ethers.utils.formatEther(user_balance.toString());
      set_signer_bal(signerToStr);

      const formatBalance = parseFloat(signerToStr).toFixed(2);
      set_format_signer_bal(formatBalance);

      const { chainId } = await provider.getNetwork();
      setChainIdMain(chainId);
      if (chainId != 80001) {
        switchPolygonChain();
      }
    } else {
      console.log("No wallets detected");
    }
  };

  const chainSwitchReload = async () => {
    try {
      setChainIdMain();
      router.reload();
    } catch (error) {
      console.log(error);
    }
  }

  const switchPolygonChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }],
      });
      chainSwitchReload("80001");
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "Mumbai",
                nativeCurrency: {
                  name: "Polygon",
                  symbol: "MATIC",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://polygonscan.com/"],
                rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
              },
            ],
          });
          chainSwitchReload("80001");
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      connectToWallet();
    }
  }, [])

  return (
    <>
      <Navbar
        connectToWallet={connectToWallet}
        signer_address={signer_address}
      />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}
