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
                    0: '#ffffff',
                    1: 'var(--surface-1)',
                    2: 'var(--surface-2)',
                    // Providing HEX values so tailwind opacity modifiers (/80) work
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d4d4d8',
                    400: '#a1a1aa',
                    500: '#71717a',
                    600: '#52525b',
                    700: '#3f3f46',
                    800: '#27272a',
                    900: '#18181b',
                    950: '#09090b',
                },
                text: 'var(--text)',
                muted: 'var(--muted)',
                border: 'var(--border)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    contrast: 'var(--primary-contrast)',
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                },
                danger: 'var(--danger)',
                warning: 'var(--warning)',
                success: 'var(--success)',
                info: 'var(--info)',
            },
            fontFamily: {
                sans: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
                mono: ['Vazirmatn', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            }
        },
    },
    plugins: [primeui, require('@tailwindcss/typography')],
}
