import { toPersianDigits } from './utils/numbers'

export default defineI18nConfig(() => ({
    legacy: false,
    fallbackLocale: 'en',
    modifiers: {
        // This allows using @.fa:key or applying a modifier if needed, 
        // but for global automatic translation conversion, we rely on a custom formatter if supported,
        // or just apply it in the components.
    }
}))
