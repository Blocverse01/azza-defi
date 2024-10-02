import { type ApiRequestMakerParams } from '~/data/base/api-requests/types';

type MakeApiRequestResponse = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
};

export const makeApiRequest = async (
  params: ApiRequestMakerParams,
): Promise<MakeApiRequestResponse> => {
  const { baseUrl, requestConfig, authHeader, input } = params;

  // Validate Request Input
  if (input.body && requestConfig.requestSchema?.body) {
    requestConfig.requestSchema.body.parse(input.body);
  }
  if (input.query && requestConfig.requestSchema?.query) {
    requestConfig.requestSchema.query.parse(input.query);
  }
  if (input.params && requestConfig.requestSchema?.params) {
    requestConfig.requestSchema.params.parse(input.params);
  }
  if (input.cookies && requestConfig.requestSchema?.cookies) {
    requestConfig.requestSchema.cookies.parse(input.cookies);
  }

  const requestUrl = computeRequestUrl({ baseUrl, requestConfig, input });

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    requestHeaders.Authorization = `Bearer ${authHeader}`;
  }
  if (input.cookies) {
    requestHeaders.Cookie = Object.entries(input.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  const requestBody = input.body ? JSON.stringify(input.body) : undefined;

  const response = await fetch(requestUrl, {
    method: requestConfig.method,
    headers: requestHeaders,
    body: requestBody,
    mode: 'cors',
  });

  let responseJson: unknown;

  try {
    responseJson = await response.json();
  } catch (_err) {}

  return {
    ok: response.ok,
    status: response.status,
    data: responseJson as Record<string, unknown>,
  };
};

export const computeRequestUrl = (
  params: Pick<ApiRequestMakerParams, 'baseUrl' | 'requestConfig' | 'input'>,
) => {
  const { baseUrl, requestConfig, input } = params;

  const [requestParams, requestQuery] = [input.params, input.query];
  const requestPath = requestConfig.requestPath;

  const formattedRequestPath = requestPath.startsWith('/') ? requestPath.slice(1) : requestPath;

  let baseRequestUrl = `${baseUrl}/${formattedRequestPath}`;

  if (requestParams && Object.keys(requestParams).length > 0) {
    Object.values(requestParams).forEach((param) => {
      baseRequestUrl += `/${param}`;
    });
  }

  if (requestQuery && Object.keys(requestQuery).length > 0) {
    const queryParams = new URLSearchParams(requestQuery);
    baseRequestUrl += `?${queryParams.toString()}`;
  }

  return baseRequestUrl;
};
