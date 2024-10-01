import { Logtail } from '@logtail/node';
import env from '@/constants/env';

let logger: Logtail | undefined;

const getLogger = () => {
    if (!logger) {
        logger = new Logtail(env.LOG_TAIL_SOURCE_TOKEN, {
            sendLogsToConsoleOutput: env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
        });
    }

    return logger;
};

// Use this function to log messages synchronously, necessary for silencing missing await warnings
export function logSync(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: object
) {
    void getLogger()[level](message, context);
}

export default getLogger();
