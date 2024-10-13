import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import { SUPPORTED_TOKENS } from '@/schemas/schemas.base';

export const WALLET_ACTION_RULES = `
    1. If you identify a valid action, **only** return a **JSON object** with the action and its parameters. **No additional text** should be included. Any extra text will be incorrect.
    2. If no specific action is requested, provide a concise, organized list of possible actions with brief examples.
    3. If an action is similar to, but not exactly what the user requested, provide a clarification or reject invalid formats with a helpful error. 
    4. If no valid action is identified or the request is unclear, ask for clarification or suggest actions based on the available options.
    5. Keep responses concise. Engage only if clarification or additional information is needed.
    6. Limit responses to **512 tokens**. Keep unrelated queries very brief.
    7. If parameters are incomplete or invalid, omit the JSON object. Instead, respond in natural language with examples of the correct format.
    8. For actions with token parameters, infer the token correctly from the user's request. Supported tokens are: ${SUPPORTED_TOKENS.join(', ')}.
    9. **Only include JSON** if a valid action is identified. Do not return JSON when asking for clarification or providing help.
    
    Guidelines:             
    **Correct response (action identified):**
    Input: "Get me the balance of my tokens."
    Output:
    {
        "action": "get_balance",
        "params": { "token": "<token>" }
    } 

    **Incorrect responses:**
    - "Here is the response: { ... }"
    - Any explanation before or after the JSON object.

    **EVM-based parameter examples:**
    - Wallet Address: "0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee" (42 characters, starts with 0x)
    - Base Name: "baseddevjosh.base.eth" (max 253 characters, alphanumeric, hyphen, period)
`;

export const POSSIBLE_ACTIONS: Array<
    PossibleActions & {
        example?: string;
        explanation: string;
    }
> = [
    {
        action: 'get_balance',
        params: {
            tokens: ['<token>', '<token>'],
        },
        explanation:
            "Retrieve the wallet's token balance. If no token is specified, assume an error or incomplete request.",
        example: 'Example: "Get me the balance of my tokens."',
    },
    {
        action: 'transfer_from_wallet_to_beneficiary',
        params: {
            token: '<token>',
            amount: '<amount>',
            beneficiaryName: '<beneficiary_name>',
        },
        explanation: 'Transfer a specific amount of a token to a beneficiary by name.',
        example: 'Example: "Send 10 ETH to John."',
    },
    {
        action: 'request_for_wallet_address',
        explanation:
            'Respond to a request for the wallet address. Look for variations asking for their wallet address.',
        example: 'Example: "Can I get my wallet address?"',
    },
    {
        action: 'transfer_from_wallet_to_address_or_base_name',
        params: {
            addressOrBaseName: '<address_or_base_name>',
            token: '<token>',
            amount: '<amount>',
        },
        explanation: 'Transfer tokens to a wallet address or base name (ENS).',
        example: 'Example: "Send 10 ETH to 0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee."',
    },
    {
        action: 'add_beneficiary',
        params: {
            name: '<name>',
            addressOrBaseName: '<address_or_base_name>',
        },
        explanation: 'Add a new beneficiary by name and address or base name.',
        example:
            'Example: "Add John as a beneficiary, address 0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee."',
    },
    {
        action: 'swap_tokens',
        params: {
            fromToken: '<from_token>',
            toToken: '<to_token>',
            amount: '<amount>',
        },
        explanation: 'Swap tokens from one to another.',
        example: 'Example: "Swap 10 ETH to DAI."',
    },
];

export const SYSTEM_PROMPT =
    'You are a resourceful AI agent for a blockchain wallet (i.e. you are a wallet bot assistant)';

export const MODELS = {
    META_LLAMA_3_70B_INSTRUCT: 'meta/meta-llama-3-70b-instruct',
    META_LLAMA_3_8B_INSTRUCT: 'meta/meta-llama-3-8b-instruct',
} as const;

export const MODEL_TO_USE = MODELS.META_LLAMA_3_8B_INSTRUCT;

export const INPUT_CONFIG = {
    top_k: 50,
    top_p: 0.7,
    max_tokens: 512,
    temperature: 0.5,
    length_penalty: 0.8,
    presence_penalty: 1,
} as const;
