import { XataClient } from '@/xata';
import env from '@/constants/env';

let xataClientInstance: XataClient | undefined = undefined;

export const getXataClient = (): XataClient => {
    if (!xataClientInstance) {
        xataClientInstance = new XataClient({
            apiKey: env.XATA_API_KEY,
            branch: 'main',
        });
    }

    return xataClientInstance;
};

const xata = getXataClient();

export const userRepository = xata.db.user;
