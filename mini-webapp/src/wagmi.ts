import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { APP_NAME } from "~/constants/strings";
import { appConfig } from "~/constants/appConfig";

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    coinbaseWallet({ appName: APP_NAME, preference: "smartWalletOnly" }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
});

export const currentChain =
  appConfig.APP_WEB3_ENVIRONMENT === "testnet" ? baseSepolia : base;

export const capabilities = {
  paymasterService: {
    [baseSepolia.id]: {
      url: `http://localhost:3000/api/paymaster`,
    },
    [base.id]: {
      url: `http://localhost:3000/api/paymaster`,
    },
  },
};

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
