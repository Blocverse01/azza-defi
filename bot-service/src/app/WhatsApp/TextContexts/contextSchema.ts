import { z } from 'zod';

export const findTransactionParamsSchema = z.object({
    transactionHash: z.string(),
});

export const possibleActionsSchema = z.object({
    action: z.enum(['find_transaction']),
    // Add other possible params schema using schema.or()
    params: findTransactionParamsSchema,
});

export type PossibleActions = z.infer<typeof possibleActionsSchema>;
