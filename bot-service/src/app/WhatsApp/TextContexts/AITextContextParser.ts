import { getReplicateClient } from '@/app/Replicate/client';
import env from '@/constants/env';
import { prepareOnchainQueryPrompt } from '@/utils/prompt-parser';
import ReplicateIntegrationLibrary from '@/app/Replicate/ReplicateIntegrationLibrary';
import { possibleActionsSchema } from './contextSchema';
import {
    INPUT_CONFIG,
    MODEL_TO_USE,
    POSSIBLE_ACTIONS,
    SYSTEM_PROMPT,
    WALLET_ACTION_RULES,
} from '@/app/WhatsApp/TextContexts/config';
import { extractJson } from '@/utils/json-formatting';
import logger from '@/resources/logger';

class AITextContextParser {
    private static readonly MODEL = MODEL_TO_USE;
    private static readonly INPUT_CONFIG = INPUT_CONFIG;

    public static async deriveContextFromPrompt(prompt: string, userDisplayName: string) {
        const replicateClient = getReplicateClient(env.REPLICATE_API_TOKEN);

        const refinedPrompt = prepareOnchainQueryPrompt({
            prompt,
            possibleActions: POSSIBLE_ACTIONS,
            rules: WALLET_ACTION_RULES,
            userDisplayName,
        });

        const response = await ReplicateIntegrationLibrary.runPrompt(replicateClient, {
            input: {
                prompt: refinedPrompt,
                system_prompt: SYSTEM_PROMPT,
                ...AITextContextParser.INPUT_CONFIG,
            },
            model: this.MODEL,
        });

        console.log(response);

        try {
            // Match JSON in response
            const extractedJson = extractJson(response);

            console.log(extractedJson, response);

            const responseJson = extractedJson ? extractedJson : (JSON.parse(response) as unknown);

            const action = AITextContextParser.extractActionFromResponse(responseJson);

            const fallbackResponse = 'No action identified. Please try again.';

            if (extractedJson && !action) {
                void logger.error('No action identified, but JSON response was present', {
                    extractedJson,
                    prompt,
                });

                return fallbackResponse;
            }

            return action ?? response;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
