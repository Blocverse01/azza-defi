import { z } from 'zod';
import 'dotenv/config';

const notEmptyStringSchema = (variableName: string) =>
    z.string().refine((val) => val.trim() !== '', {
        message: `Please set ${variableName} in .env`,
        path: [variableName],
    });

const envSchema = z.object({
    PORT: z.coerce.number().default(5123),
});

const env = envSchema.parse(process.env);

export default env;
