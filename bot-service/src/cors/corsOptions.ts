import allowedOrigins, { allowedOriginPatterns } from './allowedOrigins';

import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
        const matchesPattern =
            origin && allowedOriginPatterns.some((pattern) => pattern.test(origin));

        console.log({ origin, isAllowedOrigin, matchesPattern });

        if (isAllowedOrigin || matchesPattern) {
            callback(null, true);
        } else {
            callback(new Error(`${origin} Is Not allowed by CORS`));
        }
    },

    optionsSuccessStatus: 200,
    credentials: true,
};

export default corsOptions;
