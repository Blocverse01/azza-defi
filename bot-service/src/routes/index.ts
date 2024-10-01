import express from 'express';
import whatsappBotRoutes from './whatsappBotRoutes';
import userManagementRoutes from '@/routes/userManagementRoutes';

const apiRoutes = express
    .Router()
    .use('/whatsapp', whatsappBotRoutes)
    .use('/users', userManagementRoutes);

export default apiRoutes;
