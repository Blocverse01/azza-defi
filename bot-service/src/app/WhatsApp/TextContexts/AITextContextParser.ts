import { getReplicateClient } from '@/app/Replicate/client';
import env from '@/constants/env';
import { prepareOnchainQueryPrompt } from '@/utils/prompt-parser';
import ReplicateIntegrationLibrary from '@/app/Replicate/ReplicateIntegrationLibrary';
import { possibleActionsSchema } from './contextSchema';
import { appConfig } from '@/constants/config';

class AITextContextParser {
    private static readonly MODEL = appConfig.AI_TEXT_CONTEXT_PARSER.MODEL;
    private static readonly INPUT_CONFIG = appConfig.AI_TEXT_CONTEXT_PARSER.INPUT_CONFIG;

    public static async deriveContextFromPrompt(prompt: string) {
        const replicateClient = getReplicateClient(env.REPLICATE_API_TOKEN);

        const { prompt: refinedPrompt, system_prompt } = prepareOnchainQueryPrompt(prompt);

        const response = await ReplicateIntegrationLibrary.runPrompt(replicateClient, {
            input: {
                prompt: refinedPrompt,
                system_prompt,
                ...AITextContextParser.INPUT_CONFIG,
            },
            model: this.MODEL,
        });

        try {
            const responseJson = JSON.parse(response) as unknown;
            const action = AITextContextParser.extractActionFromResponse(responseJson);

            return action ?? response;
        } catch (error) {
            return response;
        }
    }

    private static extractActionFromResponse(responseJson: unknown) {
        const schemaValidation = possibleActionsSchema.safeParse(responseJson);

        if (!schemaValidation.success) {
            return null;
        }

        return schemaValidation.data;
    }
}

export default AITextContextParser;
