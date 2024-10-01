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

////////////////////////////////
// Inferred Type definitions
////////////////////////////////
export type SupportedChain = z.infer<typeof supportedChainSchema>;
export type Web3Environment = z.infer<typeof web3EnvironmentSchema>;
export type Url = z.infer<typeof urlSchema>;
