import { z } from 'zod';

export const saveUserWalletInputSchema = z.object({
    smartWalletAddress: z.string(),
    signInToken: z.string(),
});
