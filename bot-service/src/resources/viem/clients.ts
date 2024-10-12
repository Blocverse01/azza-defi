import { Chain, createPublicClient, http, PublicClient } from 'viem';

const publicClients = new Map<string, PublicClient>();

export const getPublicClient = (chain: Chain, rpcUrl: string): PublicClient => {
    if (!publicClients.has(rpcUrl)) {
        publicClients.set(
            rpcUrl,
            createPublicClient({
                transport: http(rpcUrl),
                chain,
            })
        );
    }

    return publicClients.get(rpcUrl) as PublicClient;
};
