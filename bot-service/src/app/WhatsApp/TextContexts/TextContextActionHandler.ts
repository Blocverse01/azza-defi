import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';

class TextContextActionHandler {
    public static async handleAction(
        action: PossibleActions,
        whatsAppPhoneParams: PhoneNumberParams
    ) {
        switch (action.action) {
            default:
                return false;
        }
    }
}

export default TextContextActionHandler;
