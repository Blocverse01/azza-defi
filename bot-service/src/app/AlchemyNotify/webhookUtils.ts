import { NextFunction, Request, Response } from 'express';

import * as crypto from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'http';

export interface AlchemyRequest extends Request {
    alchemy: {
        rawBody: string;
        signature: string;
    };
}

export function isValidSignatureForAlchemyRequest(
    request: AlchemyRequest,
    signingKey: string
): boolean {
    return isValidSignatureForStringBody(
        request.alchemy.rawBody,
        request.alchemy.signature,
        signingKey
    );
}

export function isValidSignatureForStringBody(
    body: string,
    signature: string,
    signingKey: string
): boolean {
    const hmac = crypto.createHmac('sha256', signingKey); // Create a HMAC SHA256 hash using the signing key
    hmac.update(body, 'utf8'); // Update the token hash with the request body using utf8
    const digest = hmac.digest('hex');
    return signature === digest;
}

export function addAlchemyContextToRequest(
    req: IncomingMessage,
    _res: ServerResponse,
    buf: Buffer,
    encoding: BufferEncoding
): void {
    const signature = req.headers['x-alchemy-signature'];
    // Signature must be validated against the raw string
    const body = buf.toString(encoding || 'utf8');
    (req as AlchemyRequest).alchemy = {
        rawBody: body,
        signature: signature as string,
    };
}

export function validateAlchemySignature(signingKey: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKey)) {
            const errMessage = 'Signature validation failed, unauthorized!';
            res.status(403).send(errMessage);
            throw new Error(errMessage);
        } else {
            next();
        }
    };
}

export interface AlchemyWebhookEvent {
    webhookId: string;
    id: string;
    createdAt: Date;
    type: AlchemyWebhookType;
    event: Record<string, unknown>;
}

export type AlchemyWebhookType = 'MINED_TRANSACTION' | 'DROPPED_TRANSACTION' | 'ADDRESS_ACTIVITY';

export interface AddressActivity {
    fromAddress: string;
    toAddress: string;
    blockNum: string;
    hash: string;
    value: number;
    asset: string;
    category: string;
    rawContract: RawContract;
    log: Log;
}

export interface Log {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: boolean;
}

export interface RawContract {
    rawValue: string;
    address: string;
    decimals: number;
}

export interface AlchemyAddressActivityWebhookEvent extends AlchemyWebhookEvent {
    event: {
        network: 'OPT_MAINNET';
        activity: Array<AddressActivity>;
    };
}
