import { userBeneficiaryRepository, userRepository, xataSearchClient } from '@/resources/data/db';
import { decrypt, encrypt, generateRandomHash } from '@/utils/encryption';
import { SIGNING_TOKEN_LENGTH } from '@/constants/numbers';
import env from '@/constants/env';
import { isAddress } from 'viem';
import { User } from '@/xata';

class UserManagementService {
    private static readonly USER_IDENTITY_MASK_KEY = env.USER_IDENTITY_MASK_KEY;

    public static async getUserByPhoneNumber(phoneNumber: string) {
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }

        return await userRepository
            .filter({
                phoneNumber,
            })
            .getFirst();
    }

    private static async generateSignInToken(phoneNumber: string) {
        const [randomHash, userIdentity] = await Promise.all([
            generateRandomHash(SIGNING_TOKEN_LENGTH),
            encrypt(phoneNumber, this.USER_IDENTITY_MASK_KEY),
        ]);

        if (!randomHash || !userIdentity) {
            throw new Error('Failed to generate signing token');
        }

        const now = new Date();

        const expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

        return encrypt(
            `${randomHash}.${userIdentity}.${expiry.getTime()}`,
            this.USER_IDENTITY_MASK_KEY
        );
    }

    private static decodeSignInToken(signInToken: string) {
        const decrypted = decrypt(signInToken, this.USER_IDENTITY_MASK_KEY);

        if (!decrypted) {
            throw new Error('Failed to decode signing token');
        }

        const [randomHash, userIdentity, expiry] = decrypted.split('.');

        return {
            randomHash,
            userIdentity: decrypt(userIdentity, this.USER_IDENTITY_MASK_KEY),
            expiry: new Date(parseInt(expiry)),
        };
    }

    public static async createUserSignInToken(phoneNumber: string, displayName?: string) {
        const [signInToken, targetUser] = await Promise.all([
            this.generateSignInToken(phoneNumber),
            this.getUserByPhoneNumber(phoneNumber),
        ]);

        if (!signInToken) {
            throw new Error('Failed to generate signing token');
        }

        if (!targetUser) {
            await userRepository.create({
                phoneNumber,
                signInToken,
                displayName,
            });
        } else {
            await targetUser.update({
                signInToken,
            });
        }

        return signInToken;
    }

    public static async getUserBySignInToken(signInToken: string) {
        return await userRepository
            .filter({
                signInToken,
            })
            .getFirst();
    }

    public static async saveUserWalletAddress(signInToken: string, smartWalletAddress: string) {
        const { userIdentity, expiry } = this.decodeSignInToken(signInToken);

        if (expiry < new Date()) {
            throw new Error('Signing token expired');
        }

        const targetUser = await this.getUserBySignInToken(signInToken);

        if (!targetUser) {
            throw new Error('User not found');
        }

        if (targetUser.phoneNumber !== userIdentity) {
            throw new Error('User identity mismatch');
        }

        return await targetUser.update({
            smartWalletAddress,
        });
    }

    public static async searchUserBeneficiariesByName(user: User, name: string, useFuzzy: boolean) {
        if (useFuzzy) {
            const results = await xataSearchClient.all(name, {
                tables: [
                    {
                        table: 'user_beneficiary',
                        target: ['displayName'],
                        filter: { user: user.id },
                    },
                ],
                fuzziness: 1,
            });

            return results?.records.map((record) => record.record);
        }

        return await userBeneficiaryRepository
            .filter({
                'user.phoneNumber': user.phoneNumber,
                displayName: { $iContains: name },
            })
            .getMany();
    }

    public static async createUserBeneficiary(
        user: User,
        params: {
            displayName: string;
            addressOrBaseName: string;
        }
    ) {
        const existingBeneficiary = await userBeneficiaryRepository
            .filter({
                'user.phoneNumber': user.phoneNumber,
                $any: {
                    walletAddress: params.addressOrBaseName,
                    baseName: params.addressOrBaseName,
                },
            })
            .getFirst();

        if (existingBeneficiary) {
            return {
                beneficiary: existingBeneficiary,
                isExisting: true,
            };
        }

        const recipientIdentityKey = isAddress(params.addressOrBaseName)
            ? ('walletAddress' as const)
            : ('baseName' as const);

        return {
            beneficiary: await userBeneficiaryRepository.create({
                user,
                displayName: params.displayName,
                [recipientIdentityKey]: params.addressOrBaseName,
            }),
            isExisting: false,
        };
    }
}

export default UserManagementService;
