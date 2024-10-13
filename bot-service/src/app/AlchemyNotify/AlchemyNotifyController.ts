import {
    AlchemyAddressActivityWebhookEvent,
    AlchemyRequest,
    type AlchemyWebhookEvent,
    isValidSignatureForAlchemyRequest,
} from '@/app/AlchemyNotify/webhookUtils';
import { type Request, type Response } from 'express';
import { BAD_REQUEST, OK } from '@/constants/status-codes';
import AlchemyNotifyService from '@/app/AlchemyNotify/AlchemyNotifyService';
import { handleRequestError } from '@/utils/logging';
import logger from '@/resources/logger';
import { SupportedChain } from '@/schemas/schemas.base';

class AlchemyNotifyController {
    private static async receiveNotification(req: Request, res: Response, network: SupportedChain) {
        try {
            const payload = req.body as AlchemyWebhookEvent;

            if (payload.type === 'ADDRESS_ACTIVITY') {
                await AlchemyNotifyService.handleAddressActivityNotification(
                    payload as AlchemyAddressActivityWebhookEvent,
                    network
                );
            }
        } catch (error) {
            handleRequestError(error, res, true);
        }
    }

    public static async notificationHandler(req: Request, res: Response) {
        const { network } = req.params;

        const isValidNetwork = AlchemyNotifyService.SUPPORTED_CHAINS.includes(
            network as SupportedChain
        );

        if (!isValidNetwork) {
            return res.sendStatus(BAD_REQUEST);
        }

        res.sendStatus(OK);

        const networkAsSupportedChain = network as SupportedChain;
        const signingKey = AlchemyNotifyService.signingKeys[networkAsSupportedChain];

        if (!signingKey) {
            void logger.error('Signature validation failed, signing key missing!');
            return;
        }

        const requestAsAlchemyRequest = req as AlchemyRequest;

        if (!isValidSignatureForAlchemyRequest(requestAsAlchemyRequest, signingKey)) {
            void logger.error('Signature validation failed, unauthorized!', {
                alchemy: requestAsAlchemyRequest.alchemy,
                typeofRawBody: typeof requestAsAlchemyRequest.alchemy.rawBody,
            });
            return;
        }

        await AlchemyNotifyController.receiveNotification(req, res, networkAsSupportedChain);
    }
}

export default AlchemyNotifyController;
