import { SupportedChain, Web3Environment } from '@/schemas/schemas.base';
import { Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { ANKR_BASE_MAINNET_RPC_URL, ANKR_BASE_SEPOLIA_RPC_URL } from '@/constants/strings';

export type EvmNode = 'ankr-base-mainnet' | 'ankr-base-sepolia';

export type EvmNetworkConfig = {
    rpcUrl: string;
    key: EvmNode;
    network: SupportedChain;
    viemChain: Chain;
};

export const ankrBaseMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_BASE_MAINNET_RPC_URL,
    key: 'ankr-base-mainnet',
    network: 'Base',
    viemChain: base,
};
export const ankrBaseSepolia: EvmNetworkConfig = {
    rpcUrl: ANKR_BASE_SEPOLIA_RPC_URL,
    key: 'ankr-base-sepolia',
    network: 'Base',
    viemChain: baseSepolia,
};

const APP_DEFAULT_EVM_NETWORK_CONFIGS: Record<
    SupportedChain,
    Record<Web3Environment, EvmNetworkConfig>
> = {
    Base: {
        mainnet: ankrBaseMainnet,
        testnet: ankrBaseSepolia,
    },
};

export const getAppDefaultEvmConfig = (
    network: SupportedChain,
    environment: Web3Environment
): EvmNetworkConfig => {
    return APP_DEFAULT_EVM_NETWORK_CONFIGS[network][environment];
};
