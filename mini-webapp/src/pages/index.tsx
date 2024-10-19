import Head from "next/head";
import { Info, LogoSm, WhatsappIcon3 } from "~/assets";
import React, { useCallback, useState } from "react";
import Logo from "../assets/logo.svg";
import Image from "next/image";
import Faq from "../components/Faq";

import {
  getUserDisplayName,
  saveUserWalletAddress,
} from "~/data/adapters/userAdapter";
import { useAccount, useConnect } from "wagmi";
import { type Address } from "viem";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import WalletSyncedMessage from "~/components/WalletSyncedMessage";
import { WHATSAPP_BOT_LINK } from "~/constants/strings";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function Home({ userDisplayName, signInToken }: PageProps) {
  const { connectors, connectAsync } = useConnect();
  const signedInAccount = useAccount();

  const [syncedWalletAddress, setSyncedWalletAddress] =
    useState<Address | null>();

  async function syncWalletWithSignInToken(
    signInToken: string,
    walletAddress: string
  ) {
    if (!signInToken) {
      alert("Invalid sign in token");
      return;
    }

    const response = await saveUserWalletAddress(signInToken, walletAddress);

    if (response.saved) {
      setSyncedWalletAddress(walletAddress as Address);
      console.log("Wallet address saved");
    } else {
      console.log("Failed to save wallet address");
    }

    alert(response.message);
  }

  const createWallet = useCallback(async () => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK"
    );

    if (!signInToken) {
      alert("You need a sign in token to connect your wallet");
      return;
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
        <meta name='description' content='Azza DeFi' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className={`bg-az-primary-green`}>
        <section
          className={
            "relative hero-background mt text-white py-4 px-6 md:px-[120px] "
          }
        >
          <Image src={Logo as string} alt='logo' />
          <div
            className={
              "flex relative z-10 mt-[43px] flex-col max-w-[845px] mx-auto space-y-[32px] md:space-y-[44px]"
            }
          >
            <div className={"flex justify-center space-x-3 items-center "}>
              <WhatsappIcon3 />
              <p>{">>>>>>>>>>>>>"}</p>
              <LogoSm />
            </div>

            {!syncedWalletAddress ? (
              <>
                <p className='font-subj leading-[28px] md:leading-[54px] uppercase text-center text-[32px] md:text-[56px]'>
                  You&apos;re about to{" "}
                  <span className={" text-az-primary-yellow "}>
                    create a wallet
                  </span>{" "}
                  on{" "}
                  <span className={" text-az-secondary-green-1 "}>
                    Azza DeFi{" "}
                  </span>
                </p>
                <p
                  className={
                    "max-w-[485px] md:text-[20px] leading-[24px] md:leading-[28px] text-center mx-auto"
                  }
                >
                  Hi, {userDisplayName}. Kindly click on the button below to
                  continue creating a wallet on AZZA DeFi.
                </p>

                <button
                  className={
                    "bg-white py-[10px] px-[16px] rounded-[10px] text-black w-fit  mx-auto"
                  }
                  onClick={() => createWallet()}
                >
                  Create a Wallet
                </button>
              </>
            ) : (
              <WalletSyncedMessage
                address={syncedWalletAddress}
                displayName={userDisplayName ?? ""}
                whatsappBotLink={WHATSAPP_BOT_LINK}
              />
            )}
          </div>
          <div
            className={
              " max-w-[600px] mx-auto mt-[135px]  flex space-x-4 text-black bg-az-secondary-green-1 p-5 rounded-t-[20px]  "
            }
          >
            <Info />
            <div className={" flex flex-col space-y-[3px]"}>
              <p className={"uppercase font-subj text-[24px] font-[800px] "}>
                What is Azza DeFi?
              </p>
              <p className={"text-[20px]"}>
                Azza DeFi is a Whatsapp bot that lets you swap, buy, sell, and
                transfer crypto directly on WhatsApp. Simplify transactions with
                base names, making it easy to send and receive crypto using
                familiar identifiers.
              </p>
            </div>
          </div>
        </section>
        <section className={"mt-[87px] "}>
          <div className={"footerbg1 px-[24px]"}>
            <p
              className={
                " text-az-primary-yellow font-extrabold text-center leading-[28px] md:leading-[48px] text-[32px] md:text-[48px] "
              }
            >
              FREQUENTLY ASKED QUESTIONS
            </p>
            <Faq />
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { sit } = context.query;

  const userDisplayName = sit ? await getUserDisplayName(sit as string) : null;

  return {
    props: {
      userDisplayName,
      signInToken: sit ? (sit as string) : null,
    },
  };
};
