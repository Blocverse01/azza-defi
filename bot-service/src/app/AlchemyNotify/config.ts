/**
 * @dev Webhook IDs for Alchemy Notify.
 * Docs: https://docs.alchemy.com/reference/notify-api-quickstart
 * @notice These IDs are specific to the Alchemy account hosting the webhook service.
 * @notice Do not use these IDs for other Alchemy accounts.
 * */
import { SupportedChain } from '@/schemas/schemas.base';

const WEBHOOK_IDS: {
    [key in SupportedChain]?: string;
} = {
    Base: 'wh_m2tq7i37fj4u8n5m',
};

export const getWebhookId = (network: SupportedChain) => WEBHOOK_IDS[network];
