import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';
import { User } from '@/xata';
import UserInteractionHandlers from '@/app/WhatsApp/UserInteractionHandlers';
import { appConfig } from '@/constants/config';

class TextContextActionHandler {
    public static async handleAction(
        user: User,
        action: PossibleActions,
        whatsAppPhoneParams: PhoneNumberParams
    ) {
        switch (action.action) {
            case 'get_balance':
                await UserInteractionHandlers.handleBalanceRequestInteraction(
                    whatsAppPhoneParams,
                    user,
                    action.params,
                    appConfig.APP_NETWORK
                );
                return true;
            case 'transfer_from_wallet_to_beneficiary':
                await UserInteractionHandlers.handleSendTokenToBeneficiaryInteraction(
                    whatsAppPhoneParams,
                    user,
                    action.params,
                    appConfig.APP_NETWORK
                );
                return true;
            case 'transfer_from_wallet_to_address_or_base_name':
                await UserInteractionHandlers.handleSendToBasenameOrAddressInteraction(
                    whatsAppPhoneParams,
                    user,
                    action.params,
                    appConfig.APP_NETWORK
                );
                return true;
            case 'request_for_wallet_address':
                await UserInteractionHandlers.handleRequestForWalletAddressInteraction(
                    whatsAppPhoneParams,
                    user
                );
                return true;
            case 'add_beneficiary':
                await UserInteractionHandlers.handleAddBeneficiaryInteraction(
                    whatsAppPhoneParams,
                    user,
                    action.params
                );
                return true;
            case 'swap_tokens':
                await UserInteractionHandlers.handleSwapTokensInteraction(
                    whatsAppPhoneParams,
                    user,
                    action.params,
                    appConfig.APP_NETWORK
                );
                return true;

            default:
                return false;
        }
    }
}

export default TextContextActionHandler;
