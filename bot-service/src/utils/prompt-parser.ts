import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';

export type PrepareOnchainQueryPromptParams = {
    prompt: string;
    rules: string;
    possibleActions: Array<
        PossibleActions & {
            example?: string;
            explanation: string;
        }
    >;
    userDisplayName: string;
};

export function prepareOnchainQueryPrompt(params: PrepareOnchainQueryPromptParams): string {
    const { prompt, rules, possibleActions } = params;

    const refinedPrompt = `
        Based on the user's prompt: "${prompt}", determine the exact action from these supported actions: ${JSON.stringify(possibleActions)}.
        
        Rules:
        ${rules}
    `;

    return refinedPrompt.trim();
}
