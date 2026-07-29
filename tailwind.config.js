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
                    50: '#fff1ef',
                    100: '#ffe0dc',
                    200: '#ffc6bf',
                    300: '#ff9f94',
                    400: '#f9776b',
                    500: '#ef574b',
                    600: '#d63a2f',
                    700: '#b22c24',
                    800: '#932821',
                    900: '#7a2823',
                    950: '#42100d',
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
