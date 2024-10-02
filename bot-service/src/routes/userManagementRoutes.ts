import express from 'express';
import UserManagementService from '@/app/UserManagment/UserManagementService';
import { saveUserWalletInputSchema } from '@/app/UserManagment/app.user-management.schema';
import { BAD_REQUEST } from '@/constants/status-codes';
import { handleRequestError } from '@/utils/logging';
import WhatsAppBotApi from '@/app/WhatsApp/WhatsAppBotApi';
import env from '@/constants/env';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';

const userManagementRouter = express.Router();

userManagementRouter
    .get('/:signInToken', async (req, res) => {
        const { signInToken } = req.params;

        const user = await UserManagementService.getUserBySignInToken(signInToken);

        if (!user) {
            return res.status(404).send('User not found');
        }

        return res.status(200).json({
            data: {
                displayName: user.displayName,
            },
        });
    })
    .post('/:signInToken', async (req, res) => {
        const { signInToken } = req.params;
        const { smartWalletAddress } = req.body;

        if (!signInToken) {
            return res.status(BAD_REQUEST).send('Missing signInToken');
        }

        try {
            const validation = saveUserWalletInputSchema.safeParse({
                signInToken,
                smartWalletAddress,
            });

            if (!validation.success) {
                return res.status(BAD_REQUEST).json({
                    message: validation.error.errors[0].message,
                });
            }

            const updatedRecord = await UserManagementService.saveUserWalletAddress(
                signInToken,
                smartWalletAddress
            );

            if (!updatedRecord) {
                return res.status(BAD_REQUEST).json({
                    message: 'Failed to update wallet address',
                });
            }

            const message = MessageGenerators.generateTextMessage(
                updatedRecord.phoneNumber!,
                `Hi ${updatedRecord.displayName}, your wallet address has been created successfully.\n\nWallet Address: ${updatedRecord.smartWalletAddress}`
            );

            // Todo: Refactor after testing
            await WhatsAppBotApi.sendWhatsappMessage(env.WA_BUSINESS_NUMBER_ID, message);

            return res.status(200).json({
                message: 'Wallet address updated successfully',
            });
        } catch (error) {
            handleRequestError(error, res);
        }
    });

export default userManagementRouter;
