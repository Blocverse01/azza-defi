import { SupportedToken, Web3Environment } from '@/schemas/schemas.base';
import { Address } from 'viem';

type TokenAddressesDictionary = Partial<Record<SupportedToken, Record<Web3Environment, Address>>>;

export const TOKEN_ADDRESSES: TokenAddressesDictionary = {
    USDC: {
        mainnet: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        testnet: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    DAI: {
        mainnet: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        testnet: '0xE6F6e27c0BF1a4841E3F09d03D7D31Da8eAd0a27',
    },
    USDT: {
        mainnet: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Bridged USDT
        testnet: '0x22c0DB4CC9B339E34956A5699E5E95dC0E00c800',
    },
};

export const getTokenAddress = (
    token: SupportedToken,
    environment: Web3Environment = 'mainnet'
): Address | undefined => {
    return TOKEN_ADDRESSES[token] ? TOKEN_ADDRESSES[token][environment] : undefined;
};
