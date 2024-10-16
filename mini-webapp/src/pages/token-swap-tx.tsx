import { decompressTextWithPako } from "resources/utils/text-compression";
import { MAINNET_PAYMASTER_URL, WHATSAPP_BOT_LINK } from "~/constants/strings";
import React, { type ComponentProps } from "react";
import Head from "next/head";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getTokenBySymbolAndChainId } from "~/resources/tokens";
import Image from "next/image";
import Logo from "~/assets/logo.svg";
import { TokenRow } from "@coinbase/onchainkit/token";
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
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import {
  encodeFunctionData,
  fromHex,
  getAddress,
  type Hex,
  parseUnits,
} from "viem";
import { prettifyNumber } from "resources/utils/number-formatting";
import { ALLOWANCE_APPROVAL_ABI } from "resources/abis/erc-20";
import { currentChain } from "~/wagmi";
import { env } from "~/env";
import { sendTransferTransactionHash } from "~/data/adapters/userAdapter";

type TokenSwapTxPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

type Call = Required<ComponentProps<typeof Transaction>>["calls"][number];

export default function TokenSwapTxPage({
  decodedParams,
}: TokenSwapTxPageProps) {
  const account = useAccount();

  if (!decodedParams) {
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

  const {
    fromAmount,
    toAmount,
    slippage,
    fromTokenSymbol,
    toTokenSymbol,
    to,
    data,
    signingToken,
    value,
    approvalAddress,
  } = decodedParams;

  const [fromToken, toToken] = [
    getTokenBySymbolAndChainId(fromTokenSymbol, currentChain.id),
    getTokenBySymbolAndChainId(toTokenSymbol, currentChain.id),
  ];

  const allowanceCallData =
    fromToken && fromToken.address !== "" && approvalAddress
      ? encodeFunctionData({
          abi: ALLOWANCE_APPROVAL_ABI,
          functionName: "approve",
          args: [
            getAddress(approvalAddress),
            parseUnits(fromAmount, fromToken.decimals),
          ],
        })
      : undefined;

  const calls: Call[] = [];

  if (allowanceCallData) {
    calls.push({
      to: getAddress(fromToken?.address ?? ""),
      data: allowanceCallData,
    });
  }

  calls.push({
    to: getAddress(to),
    data: data as Hex,
    value: fromHex(value ? (value as Hex) : "0x0", "bigint"),
  });

  return (
    <>
      <Head>
        <title>Azza DeFi</title>
        <meta name="description" content="Azza DeFi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`bg-az-primary-green min-h-screen flex items-center`}>
        <section
          className={
            "bg-white rounded-2xl p-8 lg:p-10 shadow-lg max-w-[560px] w-full flex-1 flex flex-col gap-8 mx-auto"
          }
        >
          <div className={"flex justify-center"}>
            <Image src={Logo as string} alt="logo" />
          </div>

          <div className={"flex flex-col gap-6"}>
            <h1 className={"text-center w-fit font-subj mx-auto text-2xl"}>
              Swap Summary
            </h1>
            <div className={"flex flex-col gap-5"}>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>Swap:</h3>
                {fromToken && (
                  <TokenRow
                    token={fromToken}
                    amount={prettifyNumber(Number(fromAmount), 6)}
                    className={"rounded-xl w-full px-4 bg-red-200/60"}
                  />
                )}
              </div>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>To:</h3>
                {toToken && (
                  <TokenRow
                    token={toToken}
                    amount={prettifyNumber(Number(toAmount), 6)}
                    className={"rounded-xl w-full px-4 bg-green-200/60"}
                  />
                )}
              </div>
              <div className={"flex items-center gap-3"}>
                <h3 className={"font-medium"}>Slippage:</h3>
                <p>{slippage * 100}%</p>
              </div>
            </div>
          </div>

          {account?.isConnected ? (
            <>
              <Transaction
                calls={calls}
                onSuccess={(response) => {
                  const targetReceipt = response.transactionReceipts[0];

                  if (targetReceipt) {
                    sendTransferTransactionHash(
                      targetReceipt?.transactionHash,
                      signingToken,
                    )
                      .then((response) => {
                        console.log(response);
                      })
                      .catch((error) => {
                        console.log("Failed to send transaction hash", error);
                      });
                  }
                }}
                onError={(e) => {
                  console.log("Error", e);
                }}
                onStatus={(status) => {
                  console.log("Status", status);
                }}
                capabilities={{
                  paymasterService: {
                    url: `${MAINNET_PAYMASTER_URL}/${env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`,
                  },
                }}
              >
                <TransactionButton text={"Confirm Swap"} />
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
            </>
          ) : (
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
            </Wallet>
          )}
        </section>
      </div>
    </>
  );
}

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const {
    sit,
    data,
    to,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    value,
    approvalAddress,
  } = context.query;

  const invalidParams = [
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    sit,
    data,
    to,
  ].filter((item) => !item);

  if (invalidParams.length > 0) {
    return {
      props: {
        decodedParams: null,
      },
    };
  }

  const decodedSIT = decodeURIComponent(sit as string);
  const decodedData = decodeURIComponent(data as string);

  return {
    props: {
      decodedParams: {
        signingToken: decompressTextWithPako(decodedSIT),
        data: decompressTextWithPako(decodedData),
        to: to as string,
        toAmount: decodeURIComponent(toAmount as string),
        fromAmount: decodeURIComponent(fromAmount as string),
        fromTokenSymbol: fromToken as string,
        toTokenSymbol: toToken as string,
        slippage: parseFloat(slippage as string),
        value: value ? (value as string) : null,
        approvalAddress: approvalAddress ? (approvalAddress as string) : null,
      },
    },
  };
};
