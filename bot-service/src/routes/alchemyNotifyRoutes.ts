import express from 'express';
import AlchemyNotifyController from '@/app/AlchemyNotify/AlchemyNotifyController';

const alchemyNotifyRoutes = express.Router();

alchemyNotifyRoutes.post('/address-activity/:network', AlchemyNotifyController.notificationHandler);

export default alchemyNotifyRoutes;
