import primeui from 'tailwindcss-primeui';

export default {
    important: true,
    darkMode: ['selector', '[data-theme="dark"]'],
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    safelist: [
        // Safelist for EventSubmissionForm dynamic classes (colors are used conditionally)
        { pattern: /(bg|text|border|shadow)-(blue|purple|green)-(50|100|200|300|400|500|600|900|950)(\/(5|10|20|40|50))?/ },
        { pattern: /(rotate)-(3|6)/ },
        { pattern: /(-rotate)-(3|6)/ },
    ],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                surface: {
                    1: 'var(--surface-1)',
                    2: 'var(--surface-2)',
                    // Keeping standard scales for utility if needed, but mapped to vars where possible or just keep literals
                    50: 'var(--p-slate-50)',
                    100: 'var(--p-slate-100)',
                    200: 'var(--p-slate-200)',
                    300: 'var(--p-slate-300)',
                    400: 'var(--p-slate-400)',
                    500: 'var(--p-slate-500)',
                    600: 'var(--p-slate-600)',
                    700: 'var(--p-slate-700)',
                    800: 'var(--p-slate-800)',
                    900: 'var(--p-slate-900)',
                    950: 'var(--p-slate-950)',
                },
                text: 'var(--text)',
                muted: 'var(--muted)',
                border: 'var(--border)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    contrast: 'var(--primary-contrast)',
                    // Map scales if necessary, or just use variables
                    50: 'var(--p-primary-50)',
                    100: 'var(--p-primary-100)',
                    200: 'var(--p-primary-200)',
                    400: 'var(--p-primary-400)',
                    500: 'var(--p-primary-500)',
                    600: 'var(--p-primary-600)',
                    700: 'var(--p-primary-700)',
                },
                danger: 'var(--danger)',
                warning: 'var(--warning)',
                success: 'var(--success)',
                info: 'var(--info)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [primeui, require('@tailwindcss/typography')],
}
