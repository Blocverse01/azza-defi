import { type ZodSchema } from 'zod';

export type ApiRequestMakerParams = {
    baseUrl: string;
    requestConfig: APIRequestConfig;
    authHeader?: string;
    input: {
        body?: Record<string, unknown>;
        params?: Record<string, string>;
        query?: Record<string, string>;
        cookies?: Record<string, string | undefined>;
    };
};

export type APIRequestConfig = {
    requestPath: string;
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    requestSchema?: {
        body?: ZodSchema;
        params?: ZodSchema;
        query?: ZodSchema;
        cookies?: ZodSchema;
    };
    responseJsonSchema: ZodSchema;
};
