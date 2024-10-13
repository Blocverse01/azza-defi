import {
    Address,
    decodeEventLog,
    encodeFunctionData,
    formatEther,
    formatUnits,
    getAddress,
    Hex,
    Log,
    parseAbiItem,
    parseUnits,
    PublicClient,
} from 'viem';
import { normalize } from 'viem/ens';
import { baseNameSchema } from '@/schemas/schemas.base';
import { EvmNetworkConfig } from '@/resources/evm.config';
import { getPublicClient } from '@/resources/viem/clients';
import { TokenMetadata } from '@/app/AzzaDeFi/app.azza-defi.schema';
import { TRANSFER_EVENT_ABI } from '@/resources/abis/erc-20';
import { TRANSFER_EVENT_TOPIC, ZERO_DATA } from '@/constants/strings';

class Web3Library {
    public static async getRawTokenBalance(
        publicClient: PublicClient,
        tokenAddress: Address,
        walletAddress: Address
    ): Promise<bigint> {
        return await publicClient.readContract({
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            address: tokenAddress,
            args: [walletAddress],
        });
    }

    public static async getTokenDecimals(
        publicClient: PublicClient,
        tokenAddress: Address
    ): Promise<number> {
        return await publicClient.readContract({
            abi: [parseAbiItem('function decimals() view returns (uint8)')],
            functionName: 'decimals',
            address: tokenAddress,
        });
    }

    public static async getHumanReadableTokenBalance(
        publicClient: PublicClient,
        tokenAddress: Address,
        walletAddress: Address
    ): Promise<number> {
        const [rawBalance, decimals] = await Promise.all([
            this.getRawTokenBalance(publicClient, tokenAddress, walletAddress),
            this.getTokenDecimals(publicClient, tokenAddress),
        ]);

        return Number(formatUnits(rawBalance, decimals));
    }

    public static async getNativeBalance(
        publicClient: PublicClient,
        walletAddress: Address
    ): Promise<number> {
        return Number(
            formatEther(
                await publicClient.getBalance({
                    address: walletAddress,
                })
            )
        );
    }

    public static encodeTransferTokenFunctionCall(
        amount: number,
        recipient: string,
        tokenDecimals: number
    ) {
        const recipientAddress = getAddress(recipient);

        return encodeFunctionData({
            abi: [parseAbiItem('function transfer(address,uint256)')],
            functionName: 'transfer',
            args: [recipientAddress, parseUnits(amount.toString(), tokenDecimals)],
        });
    }

    public static async resolveBaseNameToAddress(publicClient: PublicClient, baseName: string) {
        const baseNameValidation = baseNameSchema.safeParse(baseName);

        if (!baseNameValidation.success) {
            throw new Error('Invalid base name');
        }

        return await publicClient.getEnsAddress({
            name: normalize(baseNameValidation.data),
            universalResolverAddress: '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD',
        });
    }

    public static async getErc20TokenMetadata(publicClient: PublicClient, tokenAddress: string) {
        const validTokenAddress = getAddress(tokenAddress);

        const [name, symbol, decimals] = await Promise.all([
            publicClient.readContract({
                abi: [parseAbiItem('function name() view returns (string)')],
                functionName: 'name',
                address: validTokenAddress,
            }),
            publicClient.readContract({
                abi: [parseAbiItem('function symbol() view returns (string)')],
                functionName: 'symbol',
                address: validTokenAddress,
            }),
            this.getTokenDecimals(publicClient, validTokenAddress),
        ]);

        return {
            id: validTokenAddress,
            name,
            symbol,
            decimals,
        };
    }

    public static async getTransactionReceipt(publicClient: PublicClient, transactionHash: string) {
        return await publicClient.getTransactionReceipt({
            hash: transactionHash as Hex,
        });
    }

    public static async getTransaction(publicClient: PublicClient, transactionHash: string) {
        return await publicClient.getTransaction({
            hash: transactionHash as Hex,
        });
    }

    public static getPublicClient(networkConfig: EvmNetworkConfig) {
        return getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);
    }

    public static filterTokenTransfers(logs: Log<bigint, number, false>[]) {
        return logs.filter((log) => {
            return (
                (log.topics as Array<Hex>).includes(TRANSFER_EVENT_TOPIC as Hex) &&
                log.data !== ZERO_DATA
            );
        });
    }

    public static async decodeTokenTransfers(
        logs: Log<bigint, number, false>[],
        publicClient: PublicClient
    ) {
        const assetTransfers = logs.map((log) => {
            const decodedLog = decodeEventLog({
                abi: TRANSFER_EVENT_ABI,
                data: log.data,
                eventName: 'Transfer',
                topics: log.topics,
            });
            return {
                from: getAddress(decodedLog.args.from),
                to: getAddress(decodedLog.args.to),
                amount: decodedLog.args.value,
                tokenAddress: log.address,
            };
        });

        const tokenAddresses = assetTransfers.map((transfer) => transfer.tokenAddress);

        const uniqueTokenAddresses = Array.from(new Set(tokenAddresses));

        const tokensMetadataPromises = uniqueTokenAddresses.map((tokenAddress) => {
            return this.getErc20TokenMetadata(publicClient, getAddress(tokenAddress));
        });

        const tokensMetadataSettlements = await Promise.allSettled(tokensMetadataPromises);

        const successfulTokensMetadata = tokensMetadataSettlements.filter((settlement) => {
            return settlement.status === 'fulfilled';
        }) as PromiseFulfilledResult<TokenMetadata | null>[];

        const successfulTokensMetadataMap = successfulTokensMetadata.reduce(
            (acc, settlement) => {
                if (settlement.value === null) return acc;
                acc[settlement.value.id.toLowerCase()] = settlement.value;
                return acc;
            },
            {} as Record<string, TokenMetadata>
        );

        return assetTransfers.map((transfer) => {
            const tokenMetadata = successfulTokensMetadataMap[transfer.tokenAddress.toLowerCase()];

            return {
                ...transfer,
                formattedAmount: formatUnits(
                    transfer.amount,
                    tokenMetadata ? tokenMetadata.decimals : 18
                ),
                tokenMetadata: successfulTokensMetadataMap[transfer.tokenAddress] ?? null,
            };
        });
    }
}

export default Web3Library;
