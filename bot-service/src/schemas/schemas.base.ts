import { z } from 'zod';

////////////////////////////////
// Schema Definitions
////////////////////////////////
export const supportedChainSchema = z.enum(['Base']);
export const web3EnvironmentSchema = z.enum(['mainnet', 'testnet']);
export const urlSchema = z
    .custom<`http://${string}` | `https://${string}`>()
    .refine((data) => z.string().url().safeParse(data).success, {
        message: 'Invalid URL',
    });
export const baseNameSchema = z
    .custom<`${string}.base.eth`>()
    .refine((data) => data.endsWith('.base.eth'), {
        message: 'Invalid Base Name',
    });
export const SUPPORTED_TOKENS = ['ETH', 'USDC', 'USDT', 'DAI'] as const;
export const supportedTokenSchema = z.enum(SUPPORTED_TOKENS);

////////////////////////////////
// Inferred Type definitions
////////////////////////////////
export type SupportedChain = z.infer<typeof supportedChainSchema>;
export type Web3Environment = z.infer<typeof web3EnvironmentSchema>;
export type Url = z.infer<typeof urlSchema>;
export type SupportedToken = z.infer<typeof supportedTokenSchema>;
export type BaseName = z.infer<typeof baseNameSchema>;
