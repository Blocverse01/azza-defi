import { SupportedChain } from '@/schemas/schemas.base';
import UserManagementService from '@/app/UserManagment/UserManagementService';
import Web3Library from '@/app/AzzaDeFi/Web3Library';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import { appConfig } from '@/constants/config';
import { formatUnits, getAddress } from 'viem';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import env from '@/constants/env';
import { getTransactionExplorerUrl } from '@/resources/explorer';

class UserInfoTransportService {
    public static async receiveSuccessfulTokenTransferTransactionHashResponse(
        transactionHash: string,
        signInToken: string,
        network: SupportedChain
    ) {
        // The following logic assumes that the user has one passkey-based wallet linked to their Azza profile.
        // A more complex case would involve the user messaging the bot from the same WhatsApp number but with different devices (so different passkeys).
        // While this is a valid use case, it is not supported in this implementation.
        // Also, while there are better ways to ensure the integrity of the source of the message, we are simply going to rely on the sign-in token.

        const decodedToken = UserManagementService.decodeSignInToken(signInToken);

        if (decodedToken.expiry < new Date()) {
            throw new Error('Expired sign-in token');
        }

        const networkConfig = getAppDefaultEvmConfig(network, appConfig.APP_WEB3_ENVIRONMENT);
        const nativeToken = networkConfig.viemChain.nativeCurrency;
        const publicClient = Web3Library.getPublicClient(networkConfig);

        const [user, transaction, transactionReceipt] = await Promise.all([
            UserManagementService.getUserByPhoneNumber(decodedToken.userIdentity),
            Web3Library.getTransaction(publicClient, transactionHash),
            Web3Library.getTransactionReceipt(publicClient, transactionHash),
        ]);

        if (!user) {
            throw new Error('User not found');
        }

        if (!transaction || !transactionReceipt) {
            throw new Error('Transaction not found');
        }

        const erc20TokenTransferLogs = Web3Library.filterTokenTransfers(transactionReceipt.logs);

        const tokenTransfers = await Web3Library.decodeTokenTransfers(
            erc20TokenTransferLogs,
            publicClient
        );
        const transactionValue = formatUnits(transaction.value, nativeToken.decimals);

        const targetTransfer = tokenTransfers.find(
            (transfer) =>
                transfer.from.toLocaleLowerCase() ===
                getAddress(user.smartWalletAddress!).toLocaleLowerCase()
        );

        const transactionActivities: Array<{
            from: string;
            to: string;
            value: string;
            asset: string;
        }> = [];

        if (targetTransfer) {
            transactionActivities.push({
                from: targetTransfer.from,
                to: targetTransfer.to,
                value: targetTransfer.formattedAmount,
                asset: targetTransfer.tokenMetadata.symbol,
            });
        }

        if (transactionValue !== '0') {
            transactionActivities.push({
                from: transaction.from,
                to: transaction.to!,
                value: transactionValue,
                asset: nativeToken.symbol,
            });
        }

        if (transactionActivities.length === 0) {
            return;
        }

        const message = this.generateTransactionMessage(transactionActivities, transactionHash);

        const whatsAppMessage = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
            recipient: user.phoneNumber!,
            bodyText: message,
            headerText: '🎉 Transaction Confirmed',
            ctaText: 'View on Explorer',
            ctaUrl: getTransactionExplorerUrl(
                transactionHash,
                network,
                appConfig.APP_WEB3_ENVIRONMENT
            ),
        });

        await WhatsAppBotApi.sendWhatsappMessage(env.WA_BUSINESS_NUMBER_ID, whatsAppMessage);
    }

    private static generateTransactionMessage(
        transactionActivities: Array<{
            from: string;
            to: string;
            value: string;
            asset: string;
        }>,
        transactionHash: string
    ) {
        let messages = transactionActivities.map((activity) => {
            return `You sent ${activity.value} ${activity.asset} to ${activity.to}`;
        });

        if (messages.length > 1) {
            messages = messages.map((message, index) => {
                return `${index + 1}. ${message}`;
            });
        }

        return `🆔 Transaction hash: ${transactionHash}\n\n📖 Summary:\n${messages.join('\n')}`;
    }
}

export default UserInfoTransportService;
