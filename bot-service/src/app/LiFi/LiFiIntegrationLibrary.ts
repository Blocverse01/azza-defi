import { getQuoteRequestParamsSchema } from '@/app/LiFi/app.lifi.schema';
import { createConfig, getActiveRoute, getQuote, QuoteRequest } from '@lifi/sdk';

createConfig({
    integrator: 'azza-defi-bot-service',
});

class LiFiIntegrationLibrary {
    public static async getQuote(params: QuoteRequest) {
        const validParams = getQuoteRequestParamsSchema.parse(params);

        return await getQuote(validParams);
    }

    public static getActiveQuote(routeId: string) {
        return getActiveRoute(routeId);
    }
}

export default LiFiIntegrationLibrary;
