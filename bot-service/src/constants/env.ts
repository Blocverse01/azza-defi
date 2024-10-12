import { z } from 'zod';
import 'dotenv/config';
import { MINI_WEB_APP_LIVE_URL } from '@/constants/strings';

const notEmptyStringSchema = (variableName: string) =>
    z.string().refine((val) => val.trim() !== '', {
        message: `Please set ${variableName} in .env`,
        path: [variableName],
    });

const envSchema = z.object({
    PORT: z.coerce.number().default(5123),
    LOG_TAIL_SOURCE_TOKEN: notEmptyStringSchema('LOG_TAIL_SOURCE_TOKEN'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    WA_CLOUD_API_URL: notEmptyStringSchema('WA_CLOUD_API_URL'),
    WA_CLOUD_ACCESS_TOKEN: notEmptyStringSchema('WA_CLOUD_ACCESS_TOKEN'),
    WA_WEBHOOK_VERIFY_TOKEN: notEmptyStringSchema('WA_WEBHOOK_VERIFY_TOKEN'),
    REPLICATE_API_TOKEN: notEmptyStringSchema('REPLICATE_API_TOKEN'),
    XATA_API_KEY: notEmptyStringSchema('XATA_API_KEY'),
    USER_IDENTITY_MASK_KEY: notEmptyStringSchema('USER_IDENTITY_MASK_KEY'),
    WA_BUSINESS_NUMBER_ID: notEmptyStringSchema('WA_BUSINESS_NUMBER_ID'),
    MINI_WEB_APP_URL: z.string().default(MINI_WEB_APP_LIVE_URL),
});

const env = envSchema.parse(process.env);

export default env;
