import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  type Address as AddressType,
  decodeFunctionData,
  formatUnits,
  getAddress,
  type Hex,
} from "viem";
import { TRANSFER_ABI } from "resources/abis/erc-20";
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
import { TokenRow } from "@coinbase/onchainkit/token";
import { getTokenByAddress } from "~/resources/tokens";
import {
  Address,
  Avatar,
  Badge,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";

type DecodedTokenTransferTx = {
  recipient: AddressType;
  tokenAddress: AddressType;
  amount: bigint;
};

export default function TokenTransferTxPage() {
  const router = useRouter();

  const { sit, to, data, decimals } = router.query as Record<string, string>;

  const [decodedTx, setDecodedTx] = useState<DecodedTokenTransferTx | null>(
    null,
  );

  useEffect(() => {
    if (!to || !data || !decimals) {
      return;
    }

    const decodedData = decodeFunctionData({
      abi: TRANSFER_ABI,
      data: data as Hex,
    });

    if (!decodedData) {
      return;
    }

    console.log(decodedData.args, to);

    const [recipient, amount] = decodedData.args;

    setDecodedTx({
      recipient: recipient,
      tokenAddress: getAddress(to),
      amount,
    });
  }, [to, data, decimals]);

  if (!decodedTx) {
    return <div>Loading...</div>;
  }

  const token = getTokenByAddress(decodedTx.tokenAddress);

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
          <div className={"flex flex-col gap-5"}>
            <h1 className={"text-center w-fit font-subj mx-auto text-2xl"}>
              Token Transfer Summary
            </h1>
            <div className={"flex flex-col gap-3"}>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>Send:</h3>
                {token && (
                  <TokenRow
                    token={token}
                    amount={formatUnits(decodedTx.amount, Number(decimals))}
                    className={"rounded-xl px-4 bg-red-200/60"}
                  />
                )}
              </div>
              <div className={"flex flex-col gap-1"}>
                <h3 className={"font-medium"}>To:</h3>
                <Identity
                  address={decodedTx.recipient}
                  className={"rounded-xl"}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <Avatar>
                    <Badge className={"bg-ock-success"} />
                  </Avatar>
                  <Name className="text-orange-600" />
                  <Address
                    address={decodedTx.recipient}
                    className="text-gray-500 font-bold"
                    isSliced={false}
                  />
                </Identity>
              </div>
            </div>
          </div>

          <Transaction
            contracts={[
              {
                abi: TRANSFER_ABI,
                address: decodedTx.tokenAddress,
                functionName: "transfer",
                args: [decodedTx.recipient, decodedTx.amount],
              },
            ]}
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
        </div>
      </div>
    </>
  );
}
