import { Request, Response } from 'express';
import { FORBIDDEN, OK } from '@/constants/status-codes';
import { logSync } from '@/resources/logger';
import { handleRequestError } from '@/utils/logging';
import { Message, WebhookRequestBody, WhatsAppMessageType } from './app.whatsapp.types';
import env from '@/constants/env';
import BotCommandHandler from '@/app/WhatsApp/BotCommands/BotCommandHandler';
import AITextContextParser from '@/app/WhatsApp/TextContexts/AITextContextParser';
import MessageGenerators from './MessageGenerators';
import TextContextActionHandler from '@/app/WhatsApp/TextContexts/TextContextActionHandler';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import UserManagementService from '@/app/UserManagment/UserManagementService';
import UserInteractionHandlers from '@/app/WhatsApp/UserInteractionHandlers';
import { appConfig } from '@/constants/config';

class WhatsAppWebhookController {
    public static async receiveMessageWebhook(req: Request, res: Response) {
        try {
            await WhatsAppWebhookController.messageWebhookReceiptVerification(req, res);

            logSync('debug', 'Original Body Received', {
                webhookBody: req.body,
            });

            const messageParts = WhatsAppWebhookController.extractStringMessageParts(req.body);

            const { message, displayName, businessPhoneNumberId } = messageParts;

            if (message?.id) {
                await WhatsAppBotApi.markMassageAsRead(businessPhoneNumberId, message.id);
            }

            logSync('debug', 'Extracted message parts', {
                messageParts,
            });

            if (message && message.id && businessPhoneNumberId && displayName) {
                await WhatsAppWebhookController.handleUserMessage(
                    message,
                    businessPhoneNumberId,
                    displayName
                );
            } else {
                logSync('debug', 'Message object not found');
            }
        } catch (error) {
            handleRequestError(error, res, true);
        }
    }

    public static async messageWebhookReceiptVerification(req: Request, res: Response) {
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (token === env.WA_WEBHOOK_VERIFY_TOKEN) {
            // respond with 200 OK and challenge token from the request
            res.status(OK).send(challenge);
            logSync('info', 'Webhook receipt verified successfully!');
        } else {
            // respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(FORBIDDEN);
        }
    }

    public static async messageWebhookSetupVerification(req: Request, res: Response) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        // check the mode and token sent are correct
        if (mode === 'subscribe' && token === env.WA_WEBHOOK_VERIFY_TOKEN) {
            // respond with 200 OK and challenge token from the request
            res.status(200).send(challenge);
            logSync('info', 'Webhook setup verified successfully!');
        } else {
            // respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(FORBIDDEN);
        }
    }

    private static extractStringMessageParts(requestBody: WebhookRequestBody) {
        const firstEntry = requestBody.entry![0] ?? undefined;

        const firstChange = firstEntry?.changes![0];

        const firstChangeValue = firstChange?.value;

        if (!firstChangeValue) {
            logSync('info', 'Un-extracted request body', requestBody);

            return {};
        }

        if (!firstChangeValue.metadata || !firstChangeValue.metadata.phone_number_id) {
            logSync('info', 'No phone number id found in request body', {
                firstChangeValue,
            });

            return {};
        }

        const businessPhoneNumberId = firstChangeValue.metadata.phone_number_id;

        if (!firstChangeValue.messages) {
            logSync('info', 'No messages found in request body', {
                firstChangeValue,
            });

            return {};
        }

        const message = firstChangeValue.messages[0];

        const displayName = firstChangeValue.contacts[0].profile.name;

        return { businessPhoneNumberId, message, displayName };
    }

    public static async handleUserMessage(
        message: Message,
        businessPhoneNumberId: string,
        displayName: string
    ) {
        const { type, from, text } = message;

        logSync('debug', `message data type: ${typeof message}`, {
            message,
        });

        const phoneParams = { userPhoneNumber: from, businessPhoneNumberId };

        // =============== IDENTIFY USER =============== //
        const user = await UserManagementService.getUserByPhoneNumber(phoneParams.userPhoneNumber);

        //=================== NEW USER MESSAGE HANDLER ===================//
        if (!user || !user.smartWalletAddress) {
            await UserInteractionHandlers.handleFirstTimeUserInteraction(
                phoneParams,
                displayName,
                appConfig.MINI_APP_URL
            );

            return;
        }

        // ============== HANDLE TEXT MESSAGES ============== //
        if (type === WhatsAppMessageType.TEXT) {
            const botCommand = BotCommandHandler.isCommand(text.body);

            // Handle bot commands
            if (botCommand) {
                const response = await BotCommandHandler.handlePossibleCommand(
                    text.body.toLowerCase(),
                    phoneParams,
                    displayName
                );

                if (response.handled) {
                    return;
                }
            }

            // Handle text messages
            const contextOrMessageResponse = await AITextContextParser.deriveContextFromPrompt(
                text.body
            );

            if (typeof contextOrMessageResponse === 'string') {
                // Preserve new lines in response message
                const responseMessage = contextOrMessageResponse.replace(/\\n/g, '\n');

                await WhatsAppBotApi.sendWhatsappMessage(
                    businessPhoneNumberId,
                    MessageGenerators.generateTextMessage(from, responseMessage)
                );

                return;
            }

            // Handle context
            await TextContextActionHandler.handleAction(contextOrMessageResponse, phoneParams);
        }
    }
}

export default WhatsAppWebhookController;
