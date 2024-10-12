import Head from "next/head";

import { useRouter } from "next/router";
import { saveUserWalletAddress } from "~/data/adapters/userAdapter";
import { useAccount, useConnect } from "wagmi";
import { useCallback } from "react";
import { type Address } from "viem";

export default function Home() {
  const router = useRouter();

  const signInToken = router.query.sit as string;

  const { connectors, connectAsync } = useConnect();
  const signedInAccount = useAccount();

  async function syncWalletWithSignInToken(
    signInToken: string,
    walletAddress: string,
  ) {
    if (!signInToken) {
      alert("Invalid sign in token");
    }

    if (!walletAddress) {
      alert("Invalid wallet address");
    }

    const response = await saveUserWalletAddress(signInToken, walletAddress);

    if (response.saved) {
      console.log("Wallet address saved");
    } else {
      console.log("Failed to save wallet address");
    }

    alert(response.message);
  }

  const createWallet = useCallback(async () => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK",
    );

    if (!signInToken) {
      alert("You need a sign in token to connect your wallet");
    }

    let walletAddress: Address;

    if (coinbaseWalletConnector) {
      if (
        signedInAccount?.address &&
        signedInAccount.connector?.uid === coinbaseWalletConnector.uid
      ) {
        walletAddress = signedInAccount.address;
      } else {
        const data = await connectAsync({ connector: coinbaseWalletConnector });
        walletAddress = data.accounts[0];
      }

      await syncWalletWithSignInToken(signInToken, walletAddress);
    }
  }, [connectors, connectAsync, signInToken, signedInAccount]);

  return (
    <>
      <Head>
        <title>Azza DeFi</title>
        <meta name="description" content="Azza DeFi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={"py-6 px-8 min-h-[400px] flex items-center justify-center"}
      >
        <button onClick={() => createWallet()}>Connect Your Wallet</button>
      </div>
    </>
  );
}
