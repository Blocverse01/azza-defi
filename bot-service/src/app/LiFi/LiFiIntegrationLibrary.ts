import { getQuoteRequestParamsSchema } from '@/app/LiFi/app.lifi.schema';
import { createConfig, getQuote, QuoteRequest } from '@lifi/sdk';

createConfig({
    integrator: 'azza-defi-bot-service',
});

class LiFiIntegrationLibrary {
    public static async getQuotes(params: QuoteRequest) {
        const validParams = getQuoteRequestParamsSchema.parse(params);

        return await getQuote(validParams);
    }
}

export default LiFiIntegrationLibrary;
