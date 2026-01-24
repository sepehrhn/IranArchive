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

                    <NuxtLink to="/incidents" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Incidents
                    </NuxtLink>
                    <NuxtLink to="/victims" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Victims
                    </NuxtLink>
                    <NuxtLink to="/events" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Events
                    </NuxtLink>
                    <div class="relative group">
                        <button class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-1 outline-none focus:ring-2 focus:ring-primary-500/50">
                            Global Pressure
                            <i class="pi pi-chevron-down text-xs opacity-70"></i>
                        </button>
                        <div class="absolute top-full right-0 mt-1 w-48 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-right z-50">
                            <div class="flex flex-col py-1">
                                <NuxtLink to="/countries" class="px-4 py-2.5 hover:bg-surface-100 dark:hover:bg-surface-800 text-sm flex items-center gap-2 group/item">
                                    <i class="pi pi-globe text-primary-500"></i>
                                    <span class="group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">Tracker</span>
                                </NuxtLink>
                                <NuxtLink to="/campaigns" class="px-4 py-2.5 hover:bg-surface-100 dark:hover:bg-surface-800 text-sm flex items-center gap-2 group/item">
                                    <i class="pi pi-megaphone text-primary-500"></i>
                                    <span class="group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">Campaigns</span>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
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

                <NuxtLink to="/incidents" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                     <i class="pi pi-exclamation-triangle text-surface-500"></i>
                    <span>Incidents</span>
                </NuxtLink>
                <NuxtLink to="/victims" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                     <i class="pi pi-user text-surface-500"></i>
                    <span>Victims</span>
                </NuxtLink>
                <NuxtLink to="/events" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3" @click="closeMenu">
                     <i class="pi pi-calendar text-surface-500"></i>
                    <span>Events</span>
                </NuxtLink>
                <div class="mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                    <div class="px-3 py-2 text-xs font-bold text-surface-500 uppercase tracking-wider">Global Pressure</div>
                    <NuxtLink to="/countries" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3 ml-2" @click="closeMenu">
                        <i class="pi pi-globe text-surface-500"></i>
                        <span>Tracker</span>
                    </NuxtLink>
                    <NuxtLink to="/campaigns" class="px-3 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center gap-3 ml-2" @click="closeMenu">
                        <i class="pi pi-megaphone text-surface-500"></i>
                        <span>Campaigns</span>
                    </NuxtLink>
                </div>
            </div>
        </Drawer>

        <main class="flex-grow container mx-auto px-4 py-8">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>
