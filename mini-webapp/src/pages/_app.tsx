import { type AppType } from "next/dist/shared/lib/utils";

import "@coinbase/onchainkit/styles.css";

import { config, currentChain } from "~/wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { env } from "~/env";
import { subjectivityFont } from "~/font/setup";
import "~/styles/globals.css";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={currentChain}
        >
          <div className={`${subjectivityFont.variable} font-inter`}>
            <Component {...pageProps} />
          </div>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MyApp;
