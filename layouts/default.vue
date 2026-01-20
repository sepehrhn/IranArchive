<script setup lang="ts">
import { ref } from 'vue';

const { t } = useI18n();
const mobileMenuOpen = ref(false);

const closeMenu = () => {
    mobileMenuOpen.value = false;
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-0 font-sans">
        <header class="sticky top-0 z-50 border-b border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
            <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
                <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl tracking-tight text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity" @click="closeMenu">
                    <img src="/lion-and-sun.svg" alt="Lion and Sun" class="h-10 w-auto" />
                    <span>Iran<span class="text-surface-900 dark:text-white">Archive</span></span>
                </NuxtLink>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-1 md:gap-4">
                    <NuxtLink to="/" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Home
                    </NuxtLink>
                    <NuxtLink to="/incidents" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Incidents
                    </NuxtLink>
                    <NuxtLink to="/victims" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Victims
                    </NuxtLink>
                    <NuxtLink to="/countries" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Global Pressure
                    </NuxtLink>
                    <div class="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1"></div>
                    <ThemeToggle />
                </div>

                <!-- Mobile Menu Button -->
                <div class="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Button icon="pi pi-bars" text rounded aria-label="Menu" @click="mobileMenuOpen = true" />
                </div>
            </nav>
        </header>

        <!-- Mobile Drawer -->
        <Drawer v-model:visible="mobileMenuOpen" position="right" class="w-64">
            <template #header>
                <div class="flex items-center gap-2 font-bold text-xl tracking-tight text-primary-600 dark:text-primary-400">
                    <img src="/lion-and-sun.svg" alt="Lion and Sun" class="h-8 w-auto" />
                    <span>Iran<span class="text-surface-900 dark:text-white">Archive</span></span>
                </div>
            </template>
            <div class="flex flex-col gap-2">
                <NuxtLink to="/" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                    <i class="pi pi-home text-surface-500"></i>
                    <span>Home</span>
                </NuxtLink>
                <NuxtLink to="/incidents" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                     <i class="pi pi-exclamation-triangle text-surface-500"></i>
                    <span>Incidents</span>
                </NuxtLink>
                <NuxtLink to="/victims" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                     <i class="pi pi-user text-surface-500"></i>
                    <span>Victims</span>
                </NuxtLink>
                <NuxtLink to="/countries" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                    <i class="pi pi-globe text-surface-500"></i>
                    <span>Global Pressure</span>
                </NuxtLink>
            </div>
        </Drawer>

        <main class="flex-grow container mx-auto px-4 py-8">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>
