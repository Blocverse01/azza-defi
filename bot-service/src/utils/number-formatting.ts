export const formatNumberAsCurrency = (number: number, currency: string): string => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    });

    return formatter.format(defaultAmountFixer(number));
};

export const prettifyNumber = (number: number, maximumFractionDigits = 2): string => {
    const formatter = new Intl.NumberFormat('en-US', {
        maximumFractionDigits,
    });

    return formatter.format(number);
};

export const fixNumber = (number: number, decimalPlaces: number): number => {
    return Number(number.toFixed(decimalPlaces));
};

export const defaultAmountFixer = (number: number): number => fixNumber(number, 2);
