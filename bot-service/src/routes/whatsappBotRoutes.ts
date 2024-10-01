import express from 'express';
import WhatsAppWebhookController from '@/app/WhatsApp/WhatsAppWebhookController';

const whatsappBotRoutes = express.Router();

whatsappBotRoutes
    .post('/messages/webhook', WhatsAppWebhookController.receiveMessageWebhook)
    .get('/messages/webhook', WhatsAppWebhookController.messageWebhookSetupVerification);

export default whatsappBotRoutes;
