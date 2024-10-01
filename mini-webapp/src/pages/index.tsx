import Head from 'next/head';

import { useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { APP_NAME } from '~/constants/strings';
import { useRouter } from 'next/router';
import { saveUserWalletAddress } from '~/data/adapters/userAdapter';

export default function Home() {
  const router = useRouter();

  const signInToken = router.query.sit as string;

  async function connectAccount(signInToken: string) {
    const coinbaseWalletSDK  = new CoinbaseWalletSDK({
      appName: APP_NAME as string,
      appChainIds: [8453]
    });

    const provider = coinbaseWalletSDK.makeWeb3Provider({options: 'smartWalletOnly'});
    const addresses = await provider.request({method: 'eth_requestAccounts'}) as string[];

    const indexZeroAddress = addresses[0];

    if(indexZeroAddress) {
      const response = await saveUserWalletAddress(signInToken,indexZeroAddress);

      if(response.saved) {
        console.log('Wallet address saved');
      } else {
        console.log('Failed to save wallet address');
      }

      alert(response.message)
    }
  }

  useEffect(() => {
    if (signInToken) {
      console.log('Sign in token:', signInToken);
      void connectAccount(signInToken);
    }
  }, [signInToken]);

  return (
    <>
      <Head>
        <title>Azza DeFi</title>
        <meta name="description" content="Azza DeFi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
}
