import { z } from 'zod';

export const getBalanceActionSchema = z.object({
    action: z.literal('get_balance'),
    params: z.object({
        tokens: z.array(z.string()).optional(),
    }),
});

export const sendTokenToBeneficiaryActionSchema = z.object({
    action: z.literal('transfer_from_wallet_to_beneficiary'),
    params: z.object({
        token: z.string(),
        amount: z.string().refine((data) => !isNaN(parseFloat(data)), {
            message: 'Invalid amount',
        }),
        beneficiaryName: z.string(),
    }),
});

export const sendTokenToAddressOrBaseNameActionSchema = z.object({
    action: z.literal('transfer_from_wallet_to_address_or_base_name'),
    params: z.object({
        token: z.string(),
        amount: z.string().refine((data) => !isNaN(parseFloat(data)), {
            message: 'Invalid amount',
        }),
        addressOrBaseName: z.string(),
    }),
});

export const requestForWalletAddressActionSchema = z.object({
    action: z.literal('request_for_wallet_address'),
});

export const addBeneficiaryActionSchema = z.object({
    action: z.literal('add_beneficiary'),
    params: z.object({
        name: z.string(),
        addressOrBaseName: z.string(),
    }),
});

export const swapTokensActionSchema = z.object({
    action: z.literal('swap_tokens'),
    params: z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string().refine((data) => !isNaN(parseFloat(data)), {
            message: 'Invalid amount',
        }),
    }),
});

export const possibleActionsSchema = getBalanceActionSchema
    .or(sendTokenToBeneficiaryActionSchema)
    .or(sendTokenToAddressOrBaseNameActionSchema)
    .or(requestForWalletAddressActionSchema)
    .or(addBeneficiaryActionSchema)
    .or(swapTokensActionSchema);

export type PossibleActions = z.infer<typeof possibleActionsSchema>;
export type GetBalanceAction = z.infer<typeof getBalanceActionSchema>;
export type SendTokenToBeneficiaryAction = z.infer<typeof sendTokenToBeneficiaryActionSchema>;
export type SendTokenToAddressOrBaseNameAction = z.infer<
    typeof sendTokenToAddressOrBaseNameActionSchema
>;
export type RequestForWalletAddressAction = z.infer<typeof requestForWalletAddressActionSchema>;
export type AddBeneficiaryAction = z.infer<typeof addBeneficiaryActionSchema>;
export type SwapTokensAction = z.infer<typeof swapTokensActionSchema>;
