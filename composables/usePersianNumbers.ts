import { useI18n } from '#imports';

export const usePersianNumbers = () => {
    const { locale } = useI18n();

    const pn = (num: string | number | undefined | null): string => {
        if (num === undefined || num === null) return '';

        const str = num.toString();

        if (locale.value !== 'fa') {
            return str;
        }

        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return str.replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    };

    return {
        pn
    };
};
