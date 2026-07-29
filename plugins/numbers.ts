import { defineNuxtPlugin } from '#app';
import { toPersianDigits } from '~/utils/numbers';

export default defineNuxtPlugin((nuxtApp) => {
    // We can't use useI18n here directly as it's not a setup function,
    // but we can access it via $i18n on the vue app or inject it.

    return {
        provide: {
            /**
             * Converts numbers to Persian digits ONLY if the current locale is 'fa'.
             * Use in templates: {{ $nFa(123) }}
             */
            nFa: (value: string | number | undefined | null) => {
                const { locale } = nuxtApp.$i18n as { locale: { value: string } };
                if (locale.value === 'fa') {
                    return toPersianDigits(value);
                }
                return value?.toString() ?? '';
            },
            /**
             * Forces conversion to Persian digits regardless of locale.
             * Use in templates: {{ $toFa(123) }}
             */
            toFa: (value: string | number | undefined | null) => {
                return toPersianDigits(value);
            }
        }
    };
});
