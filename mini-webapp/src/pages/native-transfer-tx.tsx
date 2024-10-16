import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  type Address as AddressType,
  formatUnits,
  getAddress,
  parseUnits,
} from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
} from "@coinbase/onchainkit/transaction";
import Head from "next/head";
import Logo from "../assets/logo.svg";
import Image from "next/image";
import { getTokenBySymbol } from "~/resources/tokens";
import {
  Address,
  Avatar,
  Badge,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import { WHATSAPP_BOT_LINK } from "~/constants/strings";
import { sendTransferTransactionHash } from "~/data/adapters/userAdapter";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { TokenRow } from "@coinbase/onchainkit/token";

type DecodedTokenTransferTx = {
  recipient: AddressType;
  amount: bigint;
};

export default function NativeTransferTxPage() {
  const router = useRouter();

  const { sit, to, amount } = router.query as Record<string, string>;

  const [decodedTx, setDecodedTx] = useState<DecodedTokenTransferTx | null>(
    null,
  );

  const account = useAccount();

  useEffect(() => {
    if (!to || !amount) {
      return;
    }

    setDecodedTx({
      recipient: getAddress(to),
      amount: parseUnits(amount, 18),
    });
  }, [to, amount]);

  if (!decodedTx) {
    return <div>Loading...</div>;
  }

  const token = getTokenBySymbol("ETH");

  if (!sit || !token) {
    return (
      <div
        className={"bg-az-primary-green min-h-screen w-full flex items-center"}
      >
        <div
          className={
            "bg-white rounded-2xl p-8 lg:p-10 shadow-lg w-full max-w-[560px] flex flex-col gap-8 mx-auto"
          }
        >
          <div className={"flex flex-col items-center gap-4"}>
            <p className={"text-center text-az-primary-black"}>
              The URL you visited is malformed. Please message the bot before
              attempting to visit the URL again.
            </p>
            <a
              href={WHATSAPP_BOT_LINK}
              className={"text-center text-az-primary-blue underline-none"}
            >
              Go back to the bot.
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Azza DeFi</title>
        <meta name="description" content="Azza DeFi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`bg-az-primary-green min-h-screen flex items-center`}>
        <div
          className={
            "bg-white rounded-2xl p-8 lg:p-10 shadow-lg max-w-[560px] flex flex-col gap-8 mx-auto"
          }
        >
          <div className={"flex justify-center"}>
            <Image src={Logo as string} alt="logo" />
          </div>
          <div className={"flex flex-col gap-6"}>
            <h1 className={"text-center w-fit font-subj mx-auto text-2xl"}>
              ETH Transfer Summary
            </h1>
            <div className={"flex flex-col gap-5"}>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>Send:</h3>
                {token && (
                  <TokenRow
                    token={token}
                    amount={formatUnits(decodedTx.amount, 18)}
                    className={"rounded-xl px-4 bg-red-200/60"}
                  />
                )}
              </div>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>To:</h3>
                <Identity
                  address={decodedTx.recipient}
                  className={"rounded-xl hidden sm:flex"}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <Avatar>
                    <Badge className={"bg-ock-success"} />
                  </Avatar>
                  <Name className="text-blue-600" />
                  <Address
                    address={decodedTx.recipient}
                    className="text-gray-500 font-bold"
                    isSliced={false}
                  />
                </Identity>
                <Identity
                  address={decodedTx.recipient}
                  className={"rounded-xl sm:hidden"}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <Avatar>
                    <Badge className={"bg-ock-success"} />
                  </Avatar>
                  <Name className="text-blue-600" />
                  <Address
                    address={decodedTx.recipient}
                    className="text-gray-500 font-bold"
                    isSliced={true}
                  />
                </Identity>
              </div>
            </div>
          </div>

          {account?.isConnected ? (
            <Transaction
              calls={[
                {
                  to: decodedTx.recipient,
                  value: decodedTx.amount,
                },
              ]}
              onSuccess={(response) => {
                const targetReceipt = response.transactionReceipts[0];

                if (targetReceipt) {
                  sendTransferTransactionHash(
                    targetReceipt?.transactionHash,
                    sit,
                  )
                    .then((response) => {
                      console.log(response);
                    })
                    .catch((error) => {
                      console.log("Failed to send transaction hash", error);
                    });
                }
              }}
            >
              <TransactionButton text={"Confirm Transfer"} />
              <TransactionSponsor />
              <TransactionToast>
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
            </Wallet>
          )}
        </div>
      </div>
    </>
  );
}
