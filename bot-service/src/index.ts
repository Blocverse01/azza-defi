import express, { type Request } from 'express';
import { NOT_FOUND, OK } from '@/constants/status-codes';
import env from '@/constants/env';
import logger from '@/resources/logger';
import apiRoutes from '@/routes';
import cors from 'cors';
import corsOptions from '@/cors/corsOptions';
import { addAlchemyContextToRequest } from '@/app/AlchemyNotify/webhookUtils';

const app = express();

// middleware for capturing raw body
app.use(
    express.json({
        limit: '20mb',
        verify: (req: Request, res, buf, encoding: BufferEncoding) => {
            req.rawBody = buf.toString();
            addAlchemyContextToRequest(req, res, buf, encoding);
        },
    })
);
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
