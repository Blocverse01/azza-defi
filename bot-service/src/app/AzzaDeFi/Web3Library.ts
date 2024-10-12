import {
    Address,
    encodeFunctionData,
    formatEther,
    formatUnits,
    getAddress,
    parseAbiItem,
    parseUnits,
    PublicClient,
} from 'viem';
import { normalize } from 'viem/ens';
import { baseNameSchema } from '@/schemas/schemas.base';

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
}

export default Web3Library;
