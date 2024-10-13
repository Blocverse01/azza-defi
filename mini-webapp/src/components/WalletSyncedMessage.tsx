import React, { type FC } from "react";
import walletCreatedImage from "~/assets/wallet-created-image.png";
import Image from "next/image";
import {
  Address,
  Avatar,
  Badge,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import { type Address as AddressType } from "viem";

type WalletSyncedMessageProps = {
  displayName: string;
  address: AddressType;
  whatsappBotLink: string;
};

const WalletSyncedMessage: FC<WalletSyncedMessageProps> = ({
  displayName,
  address,
  whatsappBotLink,
}) => {
  return (
    <div
      className={
        "bg-white max-w-[390px] mx-auto rounded-2xl flex flex-col items-center gap-8 px-5 py-10"
      }
    >
      <Image src={walletCreatedImage} alt="Wallet Created" />
      <div className={"flex gap-4 text-center items-center flex-col"}>
        <p className={"text-az-primary-black"}>Hi, {displayName}.</p>
        <p className={"text-az-primary-black"}>
          You’ve successfully created a wallet on the AZZA WhatsApp bot.
        </p>
        <Identity
          address={address}
          className={"rounded-xl"}
          schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
        >
          <Avatar>
            <Badge className={"bg-ock-success"} />
          </Avatar>
          <Name className="text-orange-600" />
          <Address address={address} className="text-gray-500 font-bold" />
        </Identity>
      </div>
      <a
        href={whatsappBotLink}
        className={
          "bg-az-primary-green rounded-xl underline-none text-white text-xl py-2.5 px-4 bg underline text-center"
        }
      >
        Go to WhatsApp Bot
      </a>
    </div>
  );
};

export default WalletSyncedMessage;
