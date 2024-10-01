import { BOT_COMMANDS_REGEX, WalletBalanceMatchGroup } from '@/app/WhatsApp/BotCommands/commands';
import { PhoneNumberParams } from '@/app/WhatsApp/app.whatsapp.schemas';

type BotCommand = keyof typeof BOT_COMMANDS_REGEX;

class BotCommandHandler {
    public static async handlePossibleCommand(
        text: string,
        phoneParams: PhoneNumberParams,
        _displayName: string
    ): Promise<{
        handled: boolean;
    }> {
        const botCommand = BotCommandHandler.isCommand(text);

        if (!botCommand) {
            return {
                handled: false,
            };
        }

        switch (botCommand.command) {
            default:
                return {
                    handled: false,
                };
        }

        return {
            handled: true,
        };
    }

    public static isCommand(command: string) {
        const commandRegex = Object.values(BOT_COMMANDS_REGEX).find((regex) => regex.test(command));

        if (!commandRegex) {
            return undefined;
        }

        const commandName = Object.keys(BOT_COMMANDS_REGEX).find(
            (key) => BOT_COMMANDS_REGEX[key as BotCommand] === commandRegex
        ) as BotCommand;

        switch (commandName) {
            case 'WALLET_BALANCE':
                return {
                    command: commandName,
                    params: command.match(commandRegex)?.groups as WalletBalanceMatchGroup,
                };
            default:
                return {
                    command: commandName,
                    params: {},
                };
        }
    }
}

export default BotCommandHandler;
