import { z } from 'zod';

////////////////////////////////
// Schema Definitions
////////////////////////////////
export const phoneNumberParamsSchema = z.object({
    userPhoneNumber: z.string(),
    businessPhoneNumberId: z.string(),
});

////////////////////////////////
// Inferred Type definitions
////////////////////////////////
export type PhoneNumberParams = z.infer<typeof phoneNumberParamsSchema>;
