import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  type Address,
  decodeFunctionData,
  formatUnits,
  getAddress,
  type Hex,
} from "viem";
import { TRANSFER_ABI } from "../../../resources/abis/erc-20";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";

type DecodedTokenTransferTx = {
  recipient: Address;
  tokenAddress: Address;
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

  return (
    <div>
      <h1>Token Transfer</h1>
      <p>Recipient: {decodedTx?.recipient}</p>
      <p>Token Address: {decodedTx?.tokenAddress}</p>
      <p>Amount: {formatUnits(decodedTx.amount, Number(decimals))}</p>

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
        <TransactionButton />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
