<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-0 font-sans transition-colors duration-300">
        <header class="sticky top-0 z-50 border-b border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 transition-colors duration-300">
            <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
                <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl tracking-tight text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity">
                    <img src="/lion-and-sun.svg" alt="Lion and Sun" class="h-10 w-auto" />
                    <span>Iran<span class="text-surface-900 dark:text-white">Archive</span></span>
                </NuxtLink>
                
                <div class="flex items-center gap-1 md:gap-4">
                    <NuxtLink to="/" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Home
                    </NuxtLink>
                    <NuxtLink to="/incidents" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Incidents
                    </NuxtLink>
                    <NuxtLink to="/countries" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Global Pressure
                    </NuxtLink>
                    <div class="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1 hidden md:block"></div>
                    <ThemeToggle />
                </div>
            </nav>
        </header>

        <main class="flex-grow container mx-auto px-4 py-8">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>
