import { z } from 'zod';

///////////////////////////////
// Schema Definitions
///////////////////////////////
export const getQuoteRequestParamsSchema = z.object({
    fromChain: z.string().or(z.number()),
    toChain: z.string().or(z.number()),
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string(),
    fromAddress: z.string(),
});

///////////////////////////////
// Inferred Type definitions
///////////////////////////////
export type GetQuoteRequestParams = z.infer<typeof getQuoteRequestParamsSchema>;
