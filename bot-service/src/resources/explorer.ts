import { SupportedChain, Url, Web3Environment } from '@/schemas/schemas.base';

const FALL_BACK_EXPLORER_URLS: {
    [key in SupportedChain]: {
        [key in Web3Environment]: Url;
    };
} = {
    Base: {
        testnet: 'https://sepolia.basescan.org',
        mainnet: 'https://basescan.org',
    },
};

export const getTransactionExplorerUrl = (
    txHash: string,
    chain: SupportedChain,
    environment = 'mainnet' as Web3Environment
) => {
    const explorerUrl = FALL_BACK_EXPLORER_URLS[chain][environment];

    return `${explorerUrl}/tx/${txHash}` as Url;
};
