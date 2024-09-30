import express, { type Request } from 'express';
import cors from 'cors';
import { NOT_FOUND, OK } from "@/constants/status-codes";
import env from "@/constants/env";

const app = express();

app.use(express.json());

app.get('/', async (_, res) => {
    res.status(OK).send('API welcomes you :)');
});

app.all('*', (_, res) => res.status(NOT_FOUND).send({ message: 'route not found' }));

app.listen(env.PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${env.PORT}`);
});