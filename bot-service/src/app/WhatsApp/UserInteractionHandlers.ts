import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import { Url } from '@/schemas/schemas.base';
import {
    CREATE_NEW_USER_WALLET_CTA_TEXT,
    POWERED_BY_COINBASE_TEXT,
    SIGN_IN_TOKEN_URL_PARAM,
} from '@/constants/strings';
import { appConfig } from '@/constants/config';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import UserManagementService from '@/app/UserManagment/UserManagementService';

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
            bodyText: `Hello ${userDisplayName}, welcome to our ${appConfig.APP_NAME} bot!`,
            ctaUrl: `${miniAppUrl}?${SIGN_IN_TOKEN_URL_PARAM}=${signInToken}`,
            ctaText: CREATE_NEW_USER_WALLET_CTA_TEXT,
            headerText: 'Welcome',
            footerText: POWERED_BY_COINBASE_TEXT,
        });

        await WhatsAppBotApi.sendWhatsappMessage(phoneNumberParams.businessPhoneNumberId, message);
    }
}

export default UserInteractionHandlers;
