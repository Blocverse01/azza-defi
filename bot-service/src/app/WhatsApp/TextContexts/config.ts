import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import { SUPPORTED_TOKENS } from '@/schemas/schemas.base';

export const WALLET_ACTION_RULES = ` 
    1. If a valid action can be identified, your response **must** return only a **JSON object** containing the action and the filled parameters. **No other text or explanation should be included**. Any additional text is considered incorrect. (VERY IMPORTANT)
    2. If an identified action is close to the user's request but not an exact match, provide a helpful error or ask for clarification, rejecting invalid formats (VERY IMPORTANT).
    3. If no valid action is found or the request is unclear, ask for clarification or provide help based on the available actions, directing responses to the user, not the platform.
    4. Respond concisely, engaging the user only if needed for clarification or additional information.
    5. Max tokens allowed: 512. Provide very short responses to unrelated queries.
    6. If no valid action is found or the parameters for a valid action are incomplete, you must omit the JSON object from your response. This is mandatory. Instead, provide clear examples using natural language, similar to those provided in the object. Failure to follow this rule will result in an incorrect response.
    7. For actions with the token parameter, the supported tokens are ${SUPPORTED_TOKENS.join(', ')}, you should infer correctly from the user's request.
    8. DO NOT include an object or JSON when asking for clarification or providing help. Only include the JSON object when a valid action is identified.
    9. If the user isn't asking for a specific action, reply with an organised list of the actions with examples, concisely.
    
    Guidelines:             
    Examples of correct responses (when an action is identified):
    Input: "Get me the balance of my tokens."
    Correct Response:
    {
        "action": "get_balance",
        "params": { "token": "<token>" }
    } 

    Incorrect Response (Do NOT return this):
    - "Here is the response: { ... }"
    - "The following action is identified: { ... }"
    - Any additional text before or after the JSON object.

    **Examples of valid EVM-based parameters:**
    - Wallet Address: "0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee" (42 characters, starts with 0x)
    - Base Name: "baseddevjosh.base.eth" (max 253 characters, alphanumeric, hyphen, and period)
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
            "Retrieve the balance of a wallet's token holdings. If no tokens are specified, return undefined.",
        example: 'Get me the balance of my tokens.',
    },
    {
        action: 'transfer_from_wallet_to_beneficiary',
        params: {
            token: '<token>',
            amount: '<amount>',
            beneficiaryName: '<beneficiary_name>',
        },
        explanation: 'Send a specified amount of a token to a beneficiary by name.',
        example: 'Send 10 ETH to John.',
    },
    {
        action: 'request_for_wallet_address',
        explanation:
            'Request the wallet address of the user. If the user is asking to deposit tokens to or fund their wallet, this action should also be triggered.',
        example: 'Can I get my wallet address?',
    },
    {
        action: 'transfer_from_wallet_to_address_or_base_name',
        params: {
            addressOrBaseName: '<address_or_base_name>',
            token: '<token>',
            amount: '<amount>',
        },
        explanation:
            'Send a specified amount of a token to an address or base name. The address or base name can be a wallet address or ENS base name.',
        example:
            'Send 10 ETH to 0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee. or Send 10 ETH to baseddevjosh.base.eth.',
    },
    {
        action: 'add_beneficiary',
        params: {
            name: '<name>',
            addressOrBaseName: '<address_or_base_name>',
        },
        explanation: 'Add a beneficiary to the user wallet.',
        example:
            'Add John as a beneficiary, address 0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee. or Name: John\n Base name: baseddevjosh.base.eth.',
    },
];

export const SYSTEM_PROMPT = 'You are an AI agent for a blockchain wallet service';

export const MODELS = {
    META_LLAMA_3_70B_INSTRUCT: 'meta/meta-llama-3-70b-instruct',
    META_LLAMA_3_8B_INSTRUCT: 'meta/meta-llama-3-8b-instruct',
} as const;

export const MODEL_TO_USE = MODELS.META_LLAMA_3_8B_INSTRUCT;

export const INPUT_CONFIG = {
    top_k: 50,
    top_p: 0.7,
    max_tokens: 512,
    temperature: 0.4,
    length_penalty: 0.8,
    presence_penalty: 1,
} as const;
