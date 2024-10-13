import express from 'express';
import whatsappBotRoutes from './whatsappBotRoutes';
import userManagementRoutes from '@/routes/userManagementRoutes';
import alchemyNotifyRoutes from '@/routes/alchemyNotifyRoutes';

const apiRoutes = express
    .Router()
    .use('/whatsapp', whatsappBotRoutes)
    .use('/users', userManagementRoutes)
    .use('/alchemy-notify', alchemyNotifyRoutes);

export default apiRoutes;
