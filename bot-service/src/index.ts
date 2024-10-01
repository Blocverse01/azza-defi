import express from 'express';
import { NOT_FOUND, OK } from '@/constants/status-codes';
import env from '@/constants/env';
import logger from '@/resources/logger';
import apiRoutes from '@/routes';
import cors from 'cors';
import corsOptions from '@/cors/corsOptions';

const app = express();

app.use(express.json());
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.get('/', async (_, res) => {
    res.status(OK).send('API welcomes you :)');
});

app.use('/api', apiRoutes, async () => {
    // flush logs: ensure all logs are sent
    await logger.flush();
});

app.all('*', (_, res) => res.status(NOT_FOUND).send({ message: 'route not found' }));

app.listen(env.PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${env.PORT}`);
});
