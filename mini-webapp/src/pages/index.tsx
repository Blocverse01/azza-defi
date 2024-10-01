import Head from 'next/head';

import { useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { APP_NAME } from '~/constants/strings';

export default function Home() {
  async function connectAccount() {
    const coinbaseWalletSDK  = new CoinbaseWalletSDK({
      appName: APP_NAME as string,
      appChainIds: [8453]
    });

    const provider = coinbaseWalletSDK.makeWeb3Provider({options: 'smartWalletOnly'});
    const addresses = await provider.request({method: 'eth_requestAccounts'});

    console.log('Connected accounts:', addresses);
  }

  useEffect(() => {
    void connectAccount();
  }, []);

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
