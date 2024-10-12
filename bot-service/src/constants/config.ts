import { APP_NAME } from '@/constants/strings';
import { SupportedChain, Url, Web3Environment } from '@/schemas/schemas.base';
import env from '@/constants/env';

export const appConfig = {
    APP_NAME,
    MINI_APP_URL: env.MINI_WEB_APP_URL as Url,
    APP_NETWORK: 'Base' as SupportedChain,
    APP_WEB3_ENVIRONMENT: 'testnet' as Web3Environment,
    FEATURE_FLAG: {
        ENABLE_BENEFICIARY_FUZZY_SEARCH: false,
    },
};
