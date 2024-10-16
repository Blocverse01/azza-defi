import { type AlchemyAddressActivityWebhookEvent } from '@/app/AlchemyNotify/webhookUtils';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import env from '@/constants/env';
import { BASE_URL, UPDATE_WEBHOOK_ADDRESSES } from '@/app/AlchemyNotify/endpoints';
import axios from 'axios';
import { getWebhookId } from '@/app/AlchemyNotify/config';
import { OK } from '@/constants/status-codes';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import { getAddress } from 'viem';
import { TRANSFER_EVENT_TOPIC } from '@/constants/strings';
import { SupportedChain, Url } from '@/schemas/schemas.base';
import UserManagementService from '@/app/UserManagment/UserManagementService';
import { prettifyNumber } from 'resources/utils/number-formatting';

enum AlchemyActivityCategory {
    TOKEN = 'token',
}

class AlchemyNotifyService {
    private static readonly BASE_API_URL = BASE_URL;
    public static readonly SUPPORTED_CHAINS: Array<SupportedChain> = ['Base'];

    public static async handleAddressActivityNotification(
        payload: AlchemyAddressActivityWebhookEvent,
        network: SupportedChain
    ) {
        if (payload.type !== 'ADDRESS_ACTIVITY') {
            return;
        }

        // Supports only token transfers for now
        const targetActivity = payload.event.activity.find((activity) => {
            const activityCategory = activity.category;
            const activityLog = activity.log;

            return (
                activityCategory === AlchemyActivityCategory.TOKEN &&
                activityLog.topics.includes(TRANSFER_EVENT_TOPIC)
            );
        });

        if (!targetActivity) {
            return;
        }

        const { fromAddress, toAddress, value, asset } = targetActivity;

        const [fromWalletProfiles, toWalletProfiles] = await Promise.all([
            UserManagementService.searchUsersByWalletAddress(getAddress(fromAddress)),
            UserManagementService.searchUsersByWalletAddress(getAddress(toAddress)),
        ]);

        const explorerUrl = getTransactionExplorerUrl(targetActivity.hash, network);

        if (fromWalletProfiles.length > 0) {
            // Send notification to subscribers
            const message = this.generateSentTokenMessage({
                tokenAmount: value.toString(),
                assetName: asset,
                assetNetwork: network,
                receiverAddress: toAddress,
                transactionHash: targetActivity.hash,
                concernedWalletAddress: fromAddress,
            });

            const promises = fromWalletProfiles.map(async (profile) => {
                const whatsAppMessage = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
                    recipient: profile.phoneNumber!,
                    bodyText: message,
                    ctaText: 'View on Explorer',
                    ctaUrl: explorerUrl as Url,
                });

                return WhatsAppBotApi.sendWhatsappMessage(
                    env.WA_BUSINESS_NUMBER_ID,
                    whatsAppMessage
                );
            });

            await Promise.allSettled(promises);
        }
        if (toWalletProfiles.length > 0) {
            // Send notification to subscribers
            const message = this.generateReceivedTokenMessage({
                tokenAmount: value.toString(),
                assetName: asset,
                assetNetwork: network,
                senderAddress: fromAddress,
                transactionHash: targetActivity.hash,
                concernedWalletAddress: toAddress,
            });

            const promises = toWalletProfiles.map(async (profile) => {
                const whatsAppMessage = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
                    recipient: profile.phoneNumber!,
                    bodyText: message,
                    ctaText: 'View on Explorer',
                    ctaUrl: explorerUrl as Url,
                });

                return WhatsAppBotApi.sendWhatsappMessage(
                    env.WA_BUSINESS_NUMBER_ID,
                    whatsAppMessage
                );
            });

            await Promise.allSettled(promises);
        }
    }

    public static async addWebhookAddresses(
        walletAddresses: Array<string>,
        network: SupportedChain
    ) {
        const requestUrl = `${this.BASE_API_URL}${UPDATE_WEBHOOK_ADDRESSES}`;

        const response = await axios.patch(
            requestUrl,
            {
                webhook_id: getWebhookId(network),
                addresses_to_add: walletAddresses,
                addresses_to_remove: [],
            },
            {
                headers: {
                    'X-Alchemy-Token': env.ALCHEMY_NOTIFY_FORWARDER_AUTH_TOKEN,
                },
            }
        );

        return response.status === OK;
    }

    public static get signingKeys(): Partial<Record<SupportedChain, string>> {
        return {
            Base: env.ALCHEMY_NOTIFY_FORWARDER_BASE_SIGNING_KEY,
        };
    }

    public static generateReceivedTokenMessage(params: {
        tokenAmount: string;
        assetName: string;
        assetNetwork: string;
        senderAddress: string;
        transactionHash: string;
        concernedWalletAddress: string;
    }): string {
        const {
            tokenAmount,
            assetName,
            assetNetwork,
            transactionHash,
            senderAddress,
            concernedWalletAddress,
        } = params;

        return `🔔 Crypto Deposit Notification.\n\n*Wallet:* ${concernedWalletAddress}\n\n🧾 *Summary:*\nReceived *${prettifyNumber(Number(tokenAmount), 6)} ${assetName}* on *${assetNetwork}* from ${senderAddress}\n\n🆔 *Transaction Hash:* ${transactionHash}`;
    }

    public static generateSentTokenMessage(params: {
        tokenAmount: string;
        assetName: string;
        assetNetwork: string;
        receiverAddress: string;
        transactionHash: string;
        concernedWalletAddress: string;
    }): string {
        const {
            tokenAmount,
            assetName,
            assetNetwork,
            transactionHash,
            receiverAddress,
            concernedWalletAddress,
        } = params;

        return `🔔 Crypto Withdrawal Notification.\n\n*Wallet:* ${concernedWalletAddress}\n\n🧾 *Summary:*\nSent *${prettifyNumber(Number(tokenAmount), 6)} ${assetName}* on *${assetNetwork}* to ${receiverAddress}\n\n🆔 *Transaction Hash:* ${transactionHash}`;
    }
}

export default AlchemyNotifyService;
