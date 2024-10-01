import { APP_NAME } from '@/constants/strings';
import { Url } from '@/schemas/schemas.base';

export const appConfig = {
    APP_NAME,
    AI_TEXT_CONTEXT_PARSER: {
        INPUT_CONFIG: {
            top_k: 50,
            top_p: 0.7,
            max_tokens: 80,
            min_tokens: 0,
            temperature: 0.4,
            length_penalty: 0.8,
            presence_penalty: 1,
        } as const,
        MODEL: 'meta/llama-2-13b-chat' as const,
    },
    MINI_APP_URL: 'https://azza-defi-mini-app.vercel.app' as Url,
};
