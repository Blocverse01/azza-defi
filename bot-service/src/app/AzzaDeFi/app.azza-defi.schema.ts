import { z } from 'zod';

////////////////////////////
// Schema Definitions
////////////////////////////
export const tokenMetadataSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    id: z.string(),
    decimals: z.coerce.number(),
});


////////////////////////////
// Inferred Type definitions
////////////////////////////
export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;