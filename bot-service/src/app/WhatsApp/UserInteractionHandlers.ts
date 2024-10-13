import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import {
    SUPPORTED_TOKENS,
    SupportedChain,
    SupportedToken,
    supportedTokenSchema,
    Url,
} from '@/schemas/schemas.base';
import {
    CREATE_NEW_USER_WALLET_CTA_TEXT,
    POWERED_BY_COINBASE_TEXT,
    SIGN_IN_TOKEN_URL_PARAM,
} from '@/constants/strings';
import { appConfig } from '@/constants/config';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import UserManagementService from '@/app/UserManagment/UserManagementService';
import { User, UserBeneficiary } from '@/xata';
import Web3Library from '@/app/AzzaDeFi/Web3Library';
import { Address, getAddress, parseUnits } from 'viem';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import { getPublicClient } from '@/resources/viem/clients';
import { getTokenAddress } from '@/resources/tokens';
import { prettifyNumber } from '@/utils/number-formatting';
import {
    AddBeneficiaryAction,
    GetBalanceAction,
    SendTokenToAddressOrBaseNameAction,
    SendTokenToBeneficiaryAction,
    SwapTokensAction,
} from '@/app/WhatsApp/TextContexts/contextSchema';
import { WhatsAppCtaUrlButtonMessage } from '@/app/WhatsApp/app.whatsapp.types';
import LiFiIntegrationLibrary from '@/app/LiFi/LiFiIntegrationLibrary';

class UserInteractionHandlers {
    public static async handleFirstTimeUserInteraction(
        phoneNumberParams: PhoneNumberParams,
        userDisplayName: string,
        miniAppUrl: Url
    ) {
        const signInToken = await UserManagementService.createUserSignInToken(
            phoneNumberParams.userPhoneNumber,
            userDisplayName
        );

        const message = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
            recipient: phoneNumberParams.userPhoneNumber,
            bodyText: `Hello ${userDisplayName}, welcome to the ${appConfig.APP_NAME} bot!`,
            ctaUrl: `${miniAppUrl}?${SIGN_IN_TOKEN_URL_PARAM}=${signInToken}`,
            ctaText: CREATE_NEW_USER_WALLET_CTA_TEXT,
            headerText: 'Welcome',
            footerText: POWERED_BY_COINBASE_TEXT,
        });

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
    }

    public static async handleBalanceRequestInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User,
        interactionParams: GetBalanceAction['params'],
        network: SupportedChain
    ) {
        const walletAddress = user.smartWalletAddress as Address;
        const networkConfig = getAppDefaultEvmConfig(network, appConfig.APP_WEB3_ENVIRONMENT);
        const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);

        const filteredTokens =
            interactionParams.tokens?.filter((token) => token !== '<token>') ?? [];

        const tokens = filteredTokens.length > 0 ? filteredTokens : SUPPORTED_TOKENS;

        await WhatsAppBotApi.sendWhatsappMessage(
            phoneNumberParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                '🔍 Checking your ' + `${tokens.length > 1 ? 'balances' : 'balance'}` + ' ...'
            )
        );

        const balancePromises = tokens.map(async (token) => {
            const tokenValidation = supportedTokenSchema.safeParse(token.toUpperCase());
            if (!tokenValidation.success) return [token, null];

            if (token === 'ETH') {
                const balance = await Web3Library.getNativeBalance(publicClient, walletAddress);

                return [token, balance];
            }

            const tokenAddress = getTokenAddress(
                tokenValidation.data,
                appConfig.APP_WEB3_ENVIRONMENT
            );
            if (!tokenAddress) return [token, null];

            const balance = await Web3Library.getHumanReadableTokenBalance(
                publicClient,
                tokenAddress,
                walletAddress
            );
            return [token, balance];
        });

        const balances = await Promise.all(balancePromises);
        const balancesMap: Record<string, null | number> = Object.fromEntries(balances);

        const responseMessage = UserInteractionHandlers.getBalanceResponseMessage(balancesMap, [
            ...tokens,
        ]);

        const message = MessageGenerators.generateTextMessage(
            phoneNumberParams.userPhoneNumber,
            responseMessage
        );

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
    }

    public static async handleRequestForWalletAddressInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User
    ) {
        const message = MessageGenerators.generateTextMessage(
            phoneNumberParams.userPhoneNumber,
            `Your wallet address is: *${user.smartWalletAddress}*\n\nYou can copy your wallet address by copying this message below 👇`
        );
        const walletAddressMessage = MessageGenerators.generateTextMessage(
            phoneNumberParams.userPhoneNumber,
            user.smartWalletAddress
        );

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
        await WhatsAppBotApi.sendWhatsappMessage(
            phoneNumberParams.businessPhoneNumberId,
            walletAddressMessage
        );
    }

    public static async handleSendTokenToBeneficiaryInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User,
        interactionParams: SendTokenToBeneficiaryAction['params'],
        network: SupportedChain
    ) {
        const { beneficiaryName, token, amount } = interactionParams;

        await WhatsAppBotApi.sendWhatsappMessage(
            phoneNumberParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `🔍 Searching for beneficiary with the name *_${beneficiaryName}_* ...`
            )
        );
        const possibleBeneficiaries = await UserManagementService.searchUserBeneficiariesByName(
            user,
            beneficiaryName,
            appConfig.FEATURE_FLAG.ENABLE_BENEFICIARY_FUZZY_SEARCH
        );

        if (possibleBeneficiaries.length === 0) {
            const messageText = `No beneficiary found with the name *_${beneficiaryName}_*\n\nTo add *_${beneficiaryName}_* as a beneficiary, send a message like this:\n\nAdd *${beneficiaryName}* as beneficiary, basename _or_ wallet address: *jane.base.eth _or_ 0x0B675A788539...*`;

            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                messageText
            );

            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );

            return;
        }

        if (possibleBeneficiaries.length > 1) {
            const messageBody = `Multiple beneficiaries found with the name *_${beneficiaryName}_*.\n\nPlease select from this list to specify the beneficiary you want to send to.`;
            const message = MessageGenerators.generateInteractiveListMessage({
                recipient: phoneNumberParams.userPhoneNumber,
                bodyText: messageBody,
                listItems: possibleBeneficiaries.map((beneficiary) => ({
                    id: `send_to|${beneficiary.id}|${token}|${amount}`,
                    title: beneficiary.displayName,
                    description: `${beneficiary.baseName ?? beneficiary.walletAddress}`,
                })),
                headerText: 'Multiple Beneficiaries Found',
                actionButtonText: 'Select Beneficiary',
            });

            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );

            return;
        }

        const tokenValidation = supportedTokenSchema.safeParse(token.toUpperCase());

        if (!tokenValidation.success) {
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `Token ${token} is not supported right now, supported tokens are: ${SUPPORTED_TOKENS.join(', ')}`
            );
            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        const recipient = possibleBeneficiaries[0];

        await this.sendTokenToRecipient(
            phoneNumberParams,
            recipient,
            tokenValidation.data,
            amount,
            network
        );
    }

    public static async handleSendToBasenameOrAddressInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User,
        interactionParams: SendTokenToAddressOrBaseNameAction['params'],
        network: SupportedChain
    ) {
        const { addressOrBaseName, token, amount } = interactionParams;

        const tokenValidation = supportedTokenSchema.safeParse(token.toUpperCase());

        if (!tokenValidation.success) {
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `Token ${token} is not supported right now, supported tokens are: ${SUPPORTED_TOKENS.join(', ')}`
            );
            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        await this.sendTokenToRecipient(
            phoneNumberParams,
            addressOrBaseName,
            tokenValidation.data,
            amount,
            network
        );
    }

    public static async sendTokenToRecipient(
        phoneNumberParams: PhoneNumberParams,
        recipient: Omit<UserBeneficiary, 'user'> | string,
        token: SupportedToken,
        amount: string,
        network: SupportedChain
    ) {
        const tokenAddress = getTokenAddress(token, appConfig.APP_WEB3_ENVIRONMENT);

        if (!tokenAddress && token !== 'ETH') {
            throw new Error(`Dev Error: Token ${token} not found in token list`);
        }

        const [networkConfig, mainnetNetworkConfig] = [
            getAppDefaultEvmConfig(network, appConfig.APP_WEB3_ENVIRONMENT),
            getAppDefaultEvmConfig(network, 'mainnet'),
        ];
        const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);
        const mainnetPublicClient = getPublicClient(
            mainnetNetworkConfig.viemChain,
            mainnetNetworkConfig.rpcUrl
        );

        const recipientAddress =
            typeof recipient === 'string'
                ? recipient
                : (recipient.walletAddress ?? recipient.baseName);
        const recipientDisplayName =
            typeof recipient === 'string' ? undefined : recipient.displayName;

        if (!recipientAddress) {
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `Recipient should be a wallet address or base name`
            );
            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        const resolvedRecipientAddress = recipientAddress.endsWith('.base.eth')
            ? await Web3Library.resolveBaseNameToAddress(mainnetPublicClient, recipientAddress!)
            : getAddress(recipientAddress!); // Resolve base name with mainnet client

        if (!resolvedRecipientAddress) {
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `Recipient wallet address could not be resolved`
            );
            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        const signingToken = await UserManagementService.generateSignInToken(
            phoneNumberParams.userPhoneNumber
        );
        const transactionSummaryMessageText =
            this.getTransferToBeneficiaryTransactionSummaryMessage(
                token,
                resolvedRecipientAddress,
                recipientDisplayName,
                amount
            );

        let message: WhatsAppCtaUrlButtonMessage;

        if (tokenAddress) {
            const tokenDecimals = await Web3Library.getTokenDecimals(publicClient, tokenAddress);

            const encodedData = Web3Library.encodeTransferTokenFunctionCall(
                Number(amount),
                resolvedRecipientAddress,
                tokenDecimals
            );

            message = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
                recipient: phoneNumberParams.userPhoneNumber,
                bodyText: transactionSummaryMessageText,
                ctaUrl: `${appConfig.MINI_APP_URL}/token-transfer-tx?data=${encodedData}&to=${tokenAddress}&sit=${signingToken}&decimals=${tokenDecimals}`,
                ctaText: 'Confirm Transaction',
                headerText: 'Transaction Summary\n\n',
                footerText: POWERED_BY_COINBASE_TEXT,
            });
        } else {
            message = MessageGenerators.generateInteractiveCtaUrlButtonMessage({
                recipient: phoneNumberParams.userPhoneNumber,
                bodyText: transactionSummaryMessageText,
                ctaUrl: `${appConfig.MINI_APP_URL}/native-transfer-tx?to=${recipientAddress}&sit=${signingToken}&amount=${amount}`,
                ctaText: 'Confirm Transaction',
                headerText: 'Transaction Summary\n\n',
                footerText: POWERED_BY_COINBASE_TEXT,
            });
        }

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
    }

    public static async handleSwapTokensInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User,
        interactionParams: SwapTokensAction['params'],
        network: SupportedChain
    ) {
        if (!user.smartWalletAddress) {
            throw new Error('User does not have a smart wallet address');
        }

        const { fromToken, toToken, amount } = interactionParams;

        const fromTokenValidation = supportedTokenSchema.safeParse(fromToken.toUpperCase());
        const toTokenValidation = supportedTokenSchema.safeParse(toToken.toUpperCase());

        if (!fromTokenValidation.success || !toTokenValidation.success) {
            const unsupportedTokens = [];
            if (!fromTokenValidation.success) unsupportedTokens.push(fromToken);
            if (!toTokenValidation.success) unsupportedTokens.push(toToken);
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `Token ${unsupportedTokens.join(' or ')} is not supported right now, supported tokens are: ${SUPPORTED_TOKENS.join(', ')}`
            );
            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        const fromTokenAddress = getTokenAddress(
            fromTokenValidation.data,
            appConfig.APP_WEB3_ENVIRONMENT
        );
        const toTokenAddress = getTokenAddress(
            toTokenValidation.data,
            appConfig.APP_WEB3_ENVIRONMENT
        );

        const networkConfig = getAppDefaultEvmConfig(network, appConfig.APP_WEB3_ENVIRONMENT);
        const publicClient = Web3Library.getPublicClient(networkConfig);

        if (!fromTokenAddress || !toTokenAddress) {
            throw new Error(`Dev Error: Token ${fromToken} or ${toToken} not found in token list`);
        }

        const fromTokenDecimals = await Web3Library.getTokenDecimals(
            publicClient,
            fromTokenAddress
        );

        const quote = await LiFiIntegrationLibrary.getQuotes({
            fromAmount: parseUnits(amount, fromTokenDecimals).toString(),
            fromToken: fromTokenAddress,
            fromChain: networkConfig.viemChain.id,
            fromAddress: user.smartWalletAddress!,
            toChain: networkConfig.viemChain.id,
            toToken: toTokenAddress,
        });

        console.log(quote);
    }

    public static async handleAddBeneficiaryInteraction(
        phoneNumberParams: PhoneNumberParams,
        user: User,
        interactionParams: AddBeneficiaryAction['params']
    ) {
        await WhatsAppBotApi.sendWhatsappMessage(
            phoneNumberParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `🔍 Adding beneficiary *_${interactionParams.name}_* ...`
            )
        );

        const { beneficiary, isExisting } = await UserManagementService.createUserBeneficiary(
            user,
            {
                displayName: interactionParams.name,
                addressOrBaseName: interactionParams.addressOrBaseName,
            }
        );

        if (isExisting) {
            const message = MessageGenerators.generateTextMessage(
                phoneNumberParams.userPhoneNumber,
                `🎉 A Beneficiary *_${beneficiary.displayName}_* already exists with the same address or base name!\n\n*Name:* ${beneficiary.displayName}\n*Base Name/Address:* ${beneficiary.walletAddress ?? beneficiary.baseName}`
            );

            await WhatsAppBotApi.sendWhatsappMessage(
                phoneNumberParams.businessPhoneNumberId,
                message
            );
            return;
        }

        const messageBody = `🎉 Beneficiary *_${interactionParams.name}_* added successfully!`;

        const message = MessageGenerators.generateTextMessage(
            phoneNumberParams.userPhoneNumber,
            messageBody
        );

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
    }

    private static getTransferToBeneficiaryTransactionSummaryMessage(
        token: SupportedToken,
        recipient: string,
        beneficiaryName: string | undefined,
        amount: string
    ) {
        return [
            `⏩ _Send_ *_${token}_* ${beneficiaryName ? 'to *_' + beneficiaryName.trim() + '_*' : ''}\n`,
            `Amount: *${amount} ${token}*`,
            `Recipient: *${recipient}* ${beneficiaryName?.trim() ? '✅' : ''}`,
        ].join('\n');
    }

    private static getBalanceResponseMessage(
        balances: Record<string, null | number>,
        tokens: string[]
    ) {
        if (tokens.length === 1) {
            const token = tokens[0];
            const balance = balances[token];
            if (balance === null)
                return `${token} is not supported right now, supported tokens are: ${SUPPORTED_TOKENS.join(', ')}`;
            return `💰Your ${token} balance is: *${prettifyNumber(balance, 6)} ${token}*`;
        }

        const supportedTokens = tokens.filter((token) => balances[token] !== null);
        const unsupportedTokens = tokens.filter((token) => balances[token] === null);

        const supportedTokensBalances = supportedTokens.map(
            (token) => `${token}: *${prettifyNumber(balances[token]!, 6)} ${token}*`
        );
        const unsupportedTokensMessage =
            unsupportedTokens.length > 0
                ? `*_${unsupportedTokens.join(', ')} are not supported tokens yet_*`
                : '';

        return [
            '💰📖 Here are your token balances:',
            supportedTokensBalances.join('\n'),
            unsupportedTokensMessage,
        ].join('\n\n');
    }
}

export default UserInteractionHandlers;
