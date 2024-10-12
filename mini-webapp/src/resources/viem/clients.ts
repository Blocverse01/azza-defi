import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { base } from "wagmi/chains";

export const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});
