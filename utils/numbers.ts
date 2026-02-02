/**
 * Converts Western digits (0-9) in a string or number to Persian Unicode digits (۰-۹).
 * @param value The value to convert.
 * @returns The converted string with Persian digits.
 */
export const toPersianDigits = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '';

    const persianMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return value.toString().replace(/\d/g, (d) => persianMap[parseInt(d)]);
};
