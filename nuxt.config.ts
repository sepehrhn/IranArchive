import { defineNuxtConfig } from 'nuxt/config';
import Aura from '@primevue/themes/aura';
import yaml from '@rollup/plugin-yaml';
import { resolve } from 'path';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    ssr: true,
    experimental: {
        appManifest: false
    },
    vite: {
        plugins: [
            yaml()
        ]
    },

    css: [
        'primeicons/primeicons.css',
        '~/assets/css/theme.css'
    ],

    runtimeConfig: {
        public: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
            // Media loading from GitHub raw URLs
            mediaRepoOwner: process.env.NUXT_PUBLIC_MEDIA_REPO_OWNER || 'sepehrhn',
            mediaRepoName: process.env.NUXT_PUBLIC_MEDIA_REPO_NAME || 'IranArchive',
            mediaRepoRef: process.env.NUXT_PUBLIC_MEDIA_REPO_REF || 'main',
            mediaBaseRawUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_RAW_URL || 'https://raw.githubusercontent.com',
            // Submissions API
            submissionApiBase: process.env.NUXT_PUBLIC_SUBMISSION_API_BASE || 'https://iranarchive-submissions.sepehrhadaeghnia.workers.dev',
            turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACOtO5pJOUTTP3dd'
        }
    },

    app: {
        baseURL: process.env.NUXT_APP_BASE_URL || '/',
        head: {
            title: 'IranArchive',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' }
            ],
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/lion-and-sun.svg' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700&display=swap' }
            ]
        }
    },

    nitro: {
        preset: 'github-pages',
        prerender: {
            routes: ['/data/events/events.ics', '/api/assets', '/api/events']
        }
        // Note: Media files (evidences, campaigns, victims) are NOT copied to static output.
        // They are loaded at runtime from GitHub raw URLs via utils/mediaUrl.ts
    },




    modules: [
        '@primevue/nuxt-module',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/color-mode',
        '@nuxtjs/i18n'
    ],

    primevue: {
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '[data-theme="dark"]',
                }
            },
            ripple: true
        },
        autoImport: true
    },

    colorMode: {
        classSuffix: '',
        preference: 'system',
        fallback: 'light',
        dataValue: 'theme'
    },

    i18n: {
        baseUrl: 'https://iranarchive.com',
        strategy: 'no_prefix', // Simple approach for now, or 'prefix_except_default'
        locales: [
            { code: 'en', file: 'en.json', name: 'English', dir: 'ltr' },
            { code: 'fa', file: 'fa.json', name: 'Persian', dir: 'ltr' } // User requested LTR global layout
        ],

        langDir: 'locales',
        defaultLocale: 'en',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
        },
        vueI18n: './i18n.config.ts'
    },

    tailwindcss: {
        configPath: '~/tailwind.config.js',
        cssPath: '~/assets/css/main.css'
    }
})
