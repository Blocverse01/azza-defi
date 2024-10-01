const POSSIBLE_ACTIONS = [
    {
        action: 'get_balance',
        params: {
            tokenSymbol: '<token_symbol>',
        },
        explanation: "Get the user's wallet balance of a token.",
        example: 'What is my USDC balance?',
        model_guide:
            "Always standardize the token symbol to uppercase. If the user doesn't specify a token, set to ALL.",
    },
    {
        action: 'get_rates',
        params: {
            currency: '<currency>',
        },
        explanation: 'Get the current exchange rates for a currency.',
        example: 'What is the current exchange rate for NGN?',
        model_guide:
            "Based on the user's input you should always standardize the currency param to a 3-letter ISO 4217 code.",
    },
];

export function prepareOnchainQueryPrompt(prompt: string): {
    prompt: string;
    system_prompt: string;
} {
    const refinedPrompt = `
        Based on the user's request: "${prompt}", determine the correct action from the possible actions: ${JSON.stringify(POSSIBLE_ACTIONS)}.
        
        Rules:
        1. If a valid action is identified, your response should not be more than a JSON object containing the action with parameters filled and nothing else.
        2. If no valid action is found or the query is unclear, ask for clarification or provide help based on the available actions.
        3. Respond concisely, engaging the user only if needed for clarification or additional information.
        4. Max tokens allowed: 80
        5. If no valid action with parameters is found, omit the JSON object and action key from your response. Provide examples using natural language, similar to those in the object.
    `;

    return {
        prompt: refinedPrompt.trim(),
        system_prompt: 'You are a blockchain wallet assistant.',
    };
}
