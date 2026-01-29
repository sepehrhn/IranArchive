<script setup lang="ts">
import { ref } from 'vue';

const { t } = useI18n();
const mobileMenuOpen = ref(false);


const closeMenu = () => {
    mobileMenuOpen.value = false;
};

const headerTransform = ref(0);

const handleScroll = () => {
    // Find the first visible sticky trigger
    const triggers = document.querySelectorAll('.sticky-trigger');
    let firstVisibleTrigger = null;
    
    for (const trigger of triggers) {
        if (trigger.offsetWidth > 0 || trigger.offsetHeight > 0) {
            firstVisibleTrigger = trigger;
            break;
        }
    }

    if (!firstVisibleTrigger) {
        headerTransform.value = 0;
        return;
    }

    const rect = firstVisibleTrigger.getBoundingClientRect();
    const style = window.getComputedStyle(firstVisibleTrigger);
    const topOffset = parseInt(style.top) || 0;

    // Header height is 64px. 
    // When rect.top is (64 + topOffset), transform is 0. 
    // When rect.top is topOffset, transform is -64.
    headerTransform.value = Math.min(0, (rect.top - topOffset) - 64);
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-0 font-sans">
        <header 
            class="sticky top-0 z-50 border-b border-surface-200/50 dark:border-surface-800/50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shadow-sm"
            :style="{ transform: `translateY(${headerTransform}px)` }"
        >
            <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
                <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl tracking-tight text-primary-600 dark:text-primary-500 hover:opacity-80 transition-all duration-300" @click="closeMenu">
                    <img src="/lion-and-sun.svg" alt="Lion and Sun" class="h-10 w-auto drop-shadow-sm" />
                    <span class="text-surface-900 dark:text-white">Iran<span class="text-primary-600 dark:text-primary-400">Archive</span></span>
                </NuxtLink>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-1 md:gap-2">
                    <NuxtLink 
                        to="/incidents" 
                        class="px-4 py-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-all duration-300 relative group"
                        active-class="text-primary-600 dark:text-primary-400 font-medium"
                    >
                        Incidents
                        <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-[.router-link-active]:w-1/2"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/victims" 
                        class="px-4 py-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-all duration-300 relative group"
                        active-class="text-primary-600 dark:text-primary-400 font-medium"
                    >
                        Victims
                        <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-[.router-link-active]:w-1/2"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/events" 
                        class="px-4 py-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-all duration-300 relative group"
                        active-class="text-primary-600 dark:text-primary-400 font-medium"
                    >
                        Events
                        <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-[.router-link-active]:w-1/2"></span>
                    </NuxtLink>
                    
                    <div class="relative group">
                        <button class="px-4 py-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-all duration-300 flex items-center gap-1.5 outline-none focus:ring-2 focus:ring-primary-500/50 text-surface-700 dark:text-surface-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            <span class="font-medium">Global Pressure</span>
                            <i class="pi pi-chevron-down text-[10px] opacity-70 transition-transform duration-300 group-hover:rotate-180"></i>
                        </button>
                        
                        <!-- Dropdown Menu -->
                        <div class="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 origin-top-right z-50">
                            <div class="flex flex-col p-1.5 space-y-0.5 relative bg-white dark:bg-surface-900">
                                <NuxtLink to="/countries" class="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 group/item transition-all duration-200" active-class="bg-primary-50 dark:bg-primary-900/20">
                                    <div class="w-8 h-8 shrink-0 rounded-lg bg-primary-100/50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover/item:scale-110 transition-transform">
                                        <i class="pi pi-globe"></i>
                                    </div>
                                    <span class="text-sm font-bold text-surface-900 dark:text-surface-0 group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">Response Tracker</span>
                                </NuxtLink>

                                <NuxtLink to="/campaigns" class="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 group/item transition-all duration-200" active-class="bg-primary-50 dark:bg-primary-900/20">
                                    <div class="w-8 h-8 shrink-0 rounded-lg bg-primary-100/50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover/item:scale-110 transition-transform">
                                        <i class="pi pi-megaphone"></i>
                                    </div>
                                    <span class="text-sm font-bold text-surface-900 dark:text-surface-0 group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">Campaigns</span>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                    
                    <div class="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2"></div>
                    <ThemeToggle />
                </div>

                <!-- Mobile Menu Button -->
                <div class="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Button icon="pi pi-bars" text rounded aria-label="Menu" @click="mobileMenuOpen = true" class="!w-10 !h-10 hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors" />
                </div>
            </nav>
        </header>

        <!-- Mobile Drawer -->
        <Drawer v-model:visible="mobileMenuOpen" position="right" class="w-72 !bg-surface-0/95 dark:!bg-surface-950/95 !backdrop-blur-xl">
            <div class="flex flex-col gap-1.5">
                <NuxtLink to="/incidents" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-exclamation-triangle text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>Incidents</span>
                </NuxtLink>
                <NuxtLink to="/victims" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-user text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>Victims</span>
                </NuxtLink>
                <NuxtLink to="/events" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-calendar text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>Events</span>
                </NuxtLink>
                
                <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div class="px-4 py-2 text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em]">Global Pressure</div>
                    <NuxtLink to="/countries" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group mt-1" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                        <i class="pi pi-globe text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                        <span>Tracker</span>
                    </NuxtLink>
                    <NuxtLink to="/campaigns" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                        <i class="pi pi-megaphone text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
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

<style scoped>
:deep(.p-drawer-header) {
    @apply p-3;
}
:deep(.p-drawer-content) {
    @apply pt-0;
}
</style>
