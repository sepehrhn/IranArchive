import { defineNuxtConfig } from 'nuxt/config';
import Aura from '@primevue/themes/aura';
import yaml from '@rollup/plugin-yaml';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    ssr: true,
    experimental: {
        appManifest: false
    },
    vite: {
        plugins: [
            yaml()
        ]
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
                { rel: 'icon', type: 'image/svg+xml', href: '/lion-and-sun.svg' }
            ]
        }
    },

    nitro: {
        preset: 'github-pages',
        prerender: {
            routes: []
        },
        publicAssets: [
            {
                dir: 'data/evidence',
                baseURL: '/evidence'
            }
        ]
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
                    darkModeSelector: '.dark',
                }
            },
            ripple: true
        },
        autoImport: true
    },

    colorMode: {
        classSuffix: '',
        preference: 'system',
        fallback: 'light'
    },

    i18n: {
        strategy: 'no_prefix', // Simple approach for now, or 'prefix_except_default'
        locales: [
            { code: 'en', file: 'en.json', name: 'English' }
        ],
        lazy: false,
        langDir: 'locales',
        defaultLocale: 'en',
        vueI18n: './i18n.config.ts'
    },

    tailwindcss: {
        configPath: '~/tailwind.config.js',
        cssPath: '~/assets/css/main.css'
    }
})
