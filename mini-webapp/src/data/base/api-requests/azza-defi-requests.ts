import { type APIRequestConfig } from "~/data/base/api-requests/types";
import { z } from "zod";

export const SAVE_USER_WALLET_ADDRESS = {
  method: "POST",
  requestPath: "/users",
  responseJsonSchema: z.object({
    message: z.string(),
  }),
  requestSchema: {
    params: z.object({
      signInToken: z.string(),
    }),
    body: z.object({
      smartWalletAddress: z.string(),
    }),
  },
} as const satisfies APIRequestConfig;

export const GET_USER_DISPLAY_NAME = {
  method: "GET",
  requestPath: "/users",
  responseJsonSchema: z.object({
    data: z.object({
      displayName: z.string(),
    }),
  }),
  requestSchema: {
    params: z.object({
      signInToken: z.string(),
    }),
  },
} as const satisfies APIRequestConfig;

export const SEND_TRANSFER_TRANSACTION_HASH = {
  method: "POST",
  requestPath: "/users/transport/token-transfers",
  responseJsonSchema: z.object({
    message: z.string(),
  }),
  requestSchema: {
    body: z.object({
      transactionHash: z.string(),
      signingToken: z.string(),
    }),
  },
} as const satisfies APIRequestConfig;