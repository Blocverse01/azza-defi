import {
  GET_USER_DISPLAY_NAME,
  SAVE_USER_WALLET_ADDRESS,
} from "~/data/base/api-requests/azza-defi-requests";
import { makeApiRequest } from "~/data/base/api-requests/api-request-maker";
import { AZZA_DEFI_API_ENDPOINT } from "~/constants/strings";

export const getUserDisplayName = async (signInToken: string) => {
  const params = GET_USER_DISPLAY_NAME.requestSchema.params.parse({
    signInToken,
  });

  const rawResponse = await makeApiRequest({
    baseUrl: AZZA_DEFI_API_ENDPOINT,
    requestConfig: GET_USER_DISPLAY_NAME,
    input: { params },
  });

  if (!rawResponse.ok) {
    return null;
  }

  const response = GET_USER_DISPLAY_NAME.responseJsonSchema.parse(
    rawResponse.data,
  );

  return response.data.displayName;
};

export const saveUserWalletAddress = async (
  signInToken: string,
  walletAddress: string,
) => {
  const params = SAVE_USER_WALLET_ADDRESS.requestSchema.params.parse({
    signInToken,
  });
  const body = SAVE_USER_WALLET_ADDRESS.requestSchema.body.parse({
    smartWalletAddress: walletAddress,
  });

  const rawResponse = await makeApiRequest({
    baseUrl: AZZA_DEFI_API_ENDPOINT,
    requestConfig: SAVE_USER_WALLET_ADDRESS,
    input: { params, body },
  });

  const response = SAVE_USER_WALLET_ADDRESS.responseJsonSchema.parse(
    rawResponse.data,
  );

  return {
    message: response.message,
    saved: rawResponse.ok,
  };
};
