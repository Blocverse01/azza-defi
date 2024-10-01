import env from '@/constants/env';
import { logServiceError } from '@/utils/logging';
import { logSync } from '@/resources/logger';
import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';
import axios from 'axios';

class WhatsAppBotApi {
    private static readonly CLOUD_API_URL = env.WA_CLOUD_API_URL;
    private static readonly CLOUD_API_ACCESS_TOKEN = env.WA_CLOUD_ACCESS_TOKEN;

    private static getRequestConfig() {
        return {
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${this.CLOUD_API_ACCESS_TOKEN}`,
            },
        };
    }

    public static async sendWhatsappMessage(businessPhoneNumberId: string, data: object) {
        const endpoint = `${businessPhoneNumberId}/messages`;

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                data,
                requestOptions
            );
        } catch (error) {
            await logServiceError(error, 'Error sending message');
            throw error;
        }
    }

    public static async markMassageAsRead(businessPhoneNumberId: string, messageId: string) {
        const endpoint = `${businessPhoneNumberId}/messages`;
        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        };

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                data,
                requestOptions
            );

            logSync('debug', 'Message marked as read successfully:', response.data); // Handle successful response (optional)
        } catch (error) {
            await logServiceError(error, 'Error marking message as read:');
        }
    }

    public static async uploadMedia(businessPhoneNumberId: string, path: string, type: string) {
        const endpoint = `${businessPhoneNumberId}/media`;

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post<{ id: string }>(
                `${this.CLOUD_API_URL}/${endpoint}`,
                {
                    file: path,
                    type: type,
                    messaging_product: 'whatsapp',
                },
                requestOptions
            );

            logSync('debug', 'Media uploaded successfully:', response.data);

            return response.data.id;
        } catch (error) {
            await logServiceError(error, 'Error uploading media:');
        }
    }

    public static async sendImageMessage(
        phoneNumberParams: PhoneNumberParams,
        link: string,
        caption: string = ''
    ) {
        const endpoint = `${phoneNumberParams.businessPhoneNumberId}/messages`;

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: phoneNumberParams.userPhoneNumber,
                    type: 'image',
                    image: {
                        link: link,
                        caption: caption,
                    },
                },
                requestOptions
            );

            logSync('debug', 'Image message sent successfully:', response.data);
        } catch (error) {
            await logServiceError(error, 'Error sending image message:');
        }
    }

    public static async sendDocumentMessage(
        phoneNumberParams: PhoneNumberParams,
        documentParams: {
            link: string;
            filename: string;
            caption?: string;
        }
    ) {
        const endpoint = `${phoneNumberParams.businessPhoneNumberId}/messages`;

        const { caption, filename, link } = documentParams;

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: phoneNumberParams.userPhoneNumber,
                    type: 'document',
                    document: {
                        link,
                        caption,
                        filename,
                    },
                },
                requestOptions
            );

            logSync('debug', 'Document message sent successfully:', response.data);
        } catch (error) {
            await logServiceError(error, 'Error sending document message:');
        }
    }
}

export default WhatsAppBotApi;
