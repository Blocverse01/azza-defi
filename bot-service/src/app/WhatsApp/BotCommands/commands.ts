export const BOT_COMMANDS_REGEX = {
    WALLET_BALANCE: /^\/balance\s+(?<tokenSymbol>\w+)$/,
};

export type WalletBalanceMatchGroup = {
    wallet: string;
};
