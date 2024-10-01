import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-ctr';
const keyLength = 32; // 256 bits

const KEY_LENGTH = 32; // 256 bits

export const encrypt = (data: string, key: string): string => {
    if (key.length !== keyLength) {
        throw new Error(`Key must be ${keyLength} characters long`);
    }

    const iv = crypto.randomBytes(16);
    if (key.length !== KEY_LENGTH) {
        throw new Error(`Key must be ${KEY_LENGTH} characters long`);
    }

    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedData: string, key: string): string => {
    if (key.length !== keyLength) {
        throw new Error(`Key must be ${keyLength} characters long`);
    }

    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
};

export const generateRandomHash = async (length: number) => {
    return crypto.randomBytes(length).toString('hex');
};
