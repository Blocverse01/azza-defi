import { type Token } from "@coinbase/onchainkit/token";
import { base, baseSepolia } from "wagmi/chains";

export const SUPPORTED_TOKENS: Array<Token> = [
  {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    chainId: baseSepolia.id,
    decimals: 6,
    image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    name: "USD Coin",
    symbol: "USDC",
  },
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chainId: base.id,
    decimals: 6,
    image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    name: "USD Coin",
    symbol: "USDC",
  },
  {
    address: "",
    chainId: base.id,
    decimals: 18,
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    name: "Ethereum",
    symbol: "ETH",
  },
  {
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    chainId: base.id,
    decimals: 6,
    image: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    name: "Tether USD",
    symbol: "USDT",
  },
  {
    address: "0x22c0DB4CC9B339E34956A5699E5E95dC0E00c800",
    chainId: baseSepolia.id,
    decimals: 6,
    image: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    name: "Tether USD",
    symbol: "USDT",
  },
  {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    chainId: base.id,
    decimals: 18,
    image: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    name: "Dai Stablecoin",
    symbol: "DAI",
  },
  {
    address: "0xE6F6e27c0BF1a4841E3F09d03D7D31Da8eAd0a27",
    chainId: baseSepolia.id,
    decimals: 18,
    image: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    name: "Dai Stablecoin",
    symbol: "DAI",
  },
];

export const getTokenByAddress = (address: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(
    (token) =>
      token.address.toLocaleLowerCase() === address.toLocaleLowerCase(),
  );
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(
    (token) => token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase(),
  );
};

export const getTokenBySymbolAndChainId = (symbol: string, chainId: number) => {
  return SUPPORTED_TOKENS.find(
    (token) =>
      token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase() &&
      token.chainId === chainId,
  );
};
