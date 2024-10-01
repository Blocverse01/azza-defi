import { Url } from '@/schemas/schemas.base';

export enum WhatsAppMessageType {
    TEXT = 'text',
    STICKER = 'sticker',
    INTERACTIVE = 'interactive',
    // Add more message types here as needed (e.g., IMAGE, VIDEO, AUDIO, etc.)
}

interface WhatsAppMessageBase {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string; // Replace with actual phone number type
}

export interface WhatsAppInteractiveButton {
    type: 'reply';
    reply: {
        id: string;
        title: string;
    };
}

export interface WhatsAppInteractiveMessage extends WhatsAppMessageBase {
    type: 'interactive';
    interactive: {
        type: 'button' | 'list' | 'flow';
        body: {
            text: string;
        };
        header?: {
            type: string;
            text: string;
        };
        footer?: {
            text: string;
        };
        action: {
            buttons?: WhatsAppInteractiveButton[];
            button?: string;
            sections?: Array<{
                rows: Array<{
                    id: string;
                    title: string;
                    description?: string;
                }>;
            }>;
            name?: string;
            parameters?: {
                flow_message_version: string;
                flow_token: string;
                flow_id: string;
                flow_cta: string;
                flow_action: 'navigate' | 'data_exchange';
                mode?: 'draft' | 'published';
                flow_action_payload: {
                    screen: string;
                    data: Record<string, unknown>;
                };
            };
        };
    };
}

export interface WhatsAppCtaUrlButtonMessage extends WhatsAppMessageBase {
    type: 'interactive';
    interactive: {
        type: 'cta_url';
        body: {
            text: string;
        };
        header?: {
            type: string;
            text: string;
        };
        footer?: {
            text: string;
        };
        action: {
            name: 'cta_url';
            parameters: {
                display_text: string;
                url: Url;
            };
        };
    };
}

export interface WhatsAppTextMessage extends WhatsAppMessageBase {
    type: WhatsAppMessageType.TEXT;
    text: {
        preview_url: boolean;
        body: string;
    };
}

export type Message = {
    id: string;
    type: string;
    from: string;
    text: {
        body: string;
    };
    interactive: {
        type: 'button_reply' | 'list_reply' | 'nfm_reply';
        list_reply?: {
            id: string;
            title: string;
            description: string;
        };
        button_reply?: {
            id: string;
            title: string;
        };
        nfm_reply?: {
            name: 'flow';
            response_json: string;
        };
    };
};

export interface WebhookRequestBody {
    entry: [
        {
            changes: [
                {
                    value: {
                        metadata: {
                            phone_number_id: string;
                        };
                        messages: [Message];
                        contacts: [
                            {
                                profile: {
                                    name: string;
                                };
                            },
                        ];
                    };
                },
            ];
        },
    ];
}
