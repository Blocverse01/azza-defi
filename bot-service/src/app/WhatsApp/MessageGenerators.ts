import {
    WhatsAppCtaUrlButtonMessage,
    WhatsAppInteractiveMessage,
    WhatsAppMessageType,
    WhatsAppTextMessage,
} from './app.whatsapp.types';
import { Url } from '@/schemas/schemas.base';

type GenerateInteractiveListMessageParams = {
    listItems: Array<{
        title: string;
        description: string;
        id: string;
    }>;
    bodyText: string;
    headerText: string;
    actionButtonText: string;
    recipient: string;
};
type GenerateInteractiveButtonMessageParams = {
    recipient: string;
    bodyText: string;
    replyButtons: Array<{
        id: string;
        title: string;
    }>;
};

type GenerateInteractiveCtaUrlButtonMessageParams = {
    recipient: string;
    bodyText: string;
    ctaUrl: Url;
    ctaText: string;
    headerText?: string;
    footerText?: string;
};

class MessageGenerators {
    public static generateInteractiveListMessage(params: GenerateInteractiveListMessageParams) {
        const { listItems, actionButtonText, bodyText, recipient, headerText } = params;

        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: WhatsAppMessageType.INTERACTIVE,
            interactive: {
                type: 'list',
                body: {
                    text: bodyText,
                },
                header: {
                    type: 'text',
                    text: headerText,
                },
                action: {
                    button: actionButtonText,
                    sections: [
                        {
                            rows: listItems,
                        },
                    ],
                },
            },
        } satisfies WhatsAppInteractiveMessage;
    }

    public static generateTextMessage(recipient: string, text: string) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: WhatsAppMessageType.TEXT,
            text: {
                preview_url: true,
                body: text,
            },
        } satisfies WhatsAppTextMessage;
    }

    public static generateInteractiveCtaUrlButtonMessage(
        params: GenerateInteractiveCtaUrlButtonMessageParams
    ) {
        const { recipient, bodyText, ctaUrl, ctaText, headerText, footerText } = params;

        const headerObject = headerText ? { header: { type: 'text', text: headerText } } : {};
        const footerObject = footerText ? { footer: { text: footerText } } : {};

        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: WhatsAppMessageType.INTERACTIVE,
            interactive: {
                type: 'cta_url',
                body: {
                    text: bodyText,
                },
                ...headerObject,
                ...footerObject,
                action: {
                    name: 'cta_url',
                    parameters: {
                        url: ctaUrl,
                        display_text: ctaText,
                    },
                },
            },
        } satisfies WhatsAppCtaUrlButtonMessage;
    }

    public static generateInteractiveButtonMessage(params: GenerateInteractiveButtonMessageParams) {
        const { recipient, replyButtons, bodyText } = params;

        return {
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: bodyText,
                },
                action: {
                    buttons: replyButtons.map((replyButton) => ({
                        type: 'reply',
                        reply: replyButton,
                    })),
                },
            },
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
        } satisfies WhatsAppInteractiveMessage;
    }
}

export default MessageGenerators;
