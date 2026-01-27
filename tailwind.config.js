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
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
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
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [primeui, require('@tailwindcss/typography')],
}
