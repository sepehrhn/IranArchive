<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useStickyHeader } from '~/composables/useStickyHeader';

const { t, locale } = useI18n();
const mobileMenuOpen = ref(false);
const { isHeaderVisible } = useStickyHeader();


const isShareMenuOpen = ref(false);
const isDonateMenuOpen = ref(false);
const copiedLink = ref(false);
const copiedCryptoType = ref<string | null>(null);
const isGlobalPressureOpen = ref(false);
const isWartimeOpen = ref(false);

const BTC_ADDRESS = 'bc1q2ljvxxang69hqm578jqvx9pv5rjpz8psnjqjpv';
const ETH_ADDRESS = '0xdf52878DffE453396E8Fa3f740A70DE6E081E9E6';

const shareItems = [
    { id: 'x', label: 'X', icon: 'pi pi-twitter' },
    { id: 'facebook', label: 'Facebook', icon: 'pi pi-facebook' },
    { id: 'messenger', label: 'Messenger', icon: 'pi pi-comment' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-whatsapp' },
    { id: 'telegram', label: 'Telegram', icon: 'pi pi-telegram' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'pi pi-linkedin' },
    { id: 'email', label: 'Email', icon: 'pi pi-envelope' }
];

const closeMenu = () => {
    mobileMenuOpen.value = false;
};

const shareTo = (platform: string) => {
    const text = "Find out about what's happening in Iran and ways you can help the Iranian people: https://IranArchive.net/";
    const url = "https://IranArchive.net/";
    let shareUrl = '';

    switch (platform) {
        case 'x':
            shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'messenger':
            shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=123456789&redirect_uri=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=IranArchive&body=${encodeURIComponent(text)}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
        isShareMenuOpen.value = false;
    }
};

const copyLink = () => {
    navigator.clipboard.writeText("https://IranArchive.net/");
    copiedLink.value = true;
    setTimeout(() => {
        copiedLink.value = false;
        isShareMenuOpen.value = false;
    }, 2000);
};

const toggleShare = (e?: MouseEvent) => {
    e?.stopPropagation();
    isShareMenuOpen.value = !isShareMenuOpen.value;
    isDonateMenuOpen.value = false;
    isWartimeOpen.value = false;
    isGlobalPressureOpen.value = false;
};

const toggleDonate = (e?: MouseEvent) => {
    e?.stopPropagation();
    isDonateMenuOpen.value = !isDonateMenuOpen.value;
    isShareMenuOpen.value = false;
    isWartimeOpen.value = false;
    isGlobalPressureOpen.value = false;
};

const toggleWartime = (e?: MouseEvent) => {
    e?.stopPropagation();
    isWartimeOpen.value = !isWartimeOpen.value;
    isShareMenuOpen.value = false;
    isDonateMenuOpen.value = false;
    isGlobalPressureOpen.value = false;
};

const toggleGlobalPressure = (e?: MouseEvent) => {
    e?.stopPropagation();
    isGlobalPressureOpen.value = !isGlobalPressureOpen.value;
    isShareMenuOpen.value = false;
    isDonateMenuOpen.value = false;
    isWartimeOpen.value = false;
};

const copyCryptoAddress = (type: string, address: string) => {
    navigator.clipboard.writeText(address);
    copiedCryptoType.value = type;
    setTimeout(() => {
        copiedCryptoType.value = null;
        isDonateMenuOpen.value = false;
    }, 2000);
};

const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.share-dropdown-trigger') && !target.closest('.share-dropdown-content')) {
        isShareMenuOpen.value = false;
    }
    if (!target.closest('.donate-dropdown-trigger') && !target.closest('.donate-dropdown-content')) {
        isDonateMenuOpen.value = false;
    }
    if (!target.closest('.gp-dropdown-trigger') && !target.closest('.gp-dropdown-content')) {
        isGlobalPressureOpen.value = false;
    }
    if (!target.closest('.wt-dropdown-trigger') && !target.closest('.wt-dropdown-content')) {
        isWartimeOpen.value = false;
    }
};

onMounted(() => {
    window.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-0 font-sans">
        <header 
            class="sticky top-0 z-50 bg-white/70 dark:bg-surface-900/70 backdrop-blur-2xl transition-all duration-500 border-b border-surface-200/30 dark:border-surface-800/30"
            :class="{ '-translate-y-full': !isHeaderVisible }"
        >
            <!-- Top Row: Logo & Utilities -->
            <div class="relative group/top z-20">
                <nav class="container mx-auto px-6 h-16 flex items-center justify-between relative z-10">
                    <NuxtLink to="/" class="flex items-center gap-3 font-black text-2xl tracking-tighter hover:scale-[1.02] transition-transform duration-500 group/logo" @click="closeMenu">
                        <img src="/lion-and-sun.svg" alt="Lion and Sun" class="h-10 w-auto drop-shadow-[0_0_15px_rgba(217,119,6,0.3)] group-hover/logo:scale-110 transition-all duration-500 ease-out will-change-transform" />
                        <span class="text-surface-900 dark:text-white flex items-baseline">
                            IRAN<span class="text-primary-600 dark:text-primary-400 font-extralight ml-1">ARCHIVE</span>
                        </span>
                    </NuxtLink>
                    
                    <div class="flex items-center gap-4">
                        <!-- Desktop Utilities -->
                        <div class="hidden md:flex items-center gap-4">
                            <ClientOnly>
                                <div class="flex items-center gap-4 font-bold text-surface-400 dark:text-surface-500 tracking-[0.2em] uppercase" :class="locale === 'fa' ? 'text-xs' : 'text-[10px]'">
                                    <LanguageSwitcher class="hover:text-primary-500 transition-all hover:scale-110 cursor-pointer" />
                                    <ThemeToggle class="hover:text-primary-500 transition-all hover:scale-110 cursor-pointer" />
                                    <a href="https://x.com/IranArchive" target="_blank" class="flex items-center hover:text-primary-500 transition-all hover:scale-110">
                                        <i class="pi pi-twitter text-lg"></i>
                                    </a>
                                    <div class="relative">
                                        <button @click.stop="toggleShare" class="share-dropdown-trigger flex items-center gap-2 hover:text-primary-500 transition-all hover:scale-105 group/share">
                                            <i class="pi pi-share-alt text-lg group-hover/share:rotate-12 transition-transform"></i>
                                            <span :class="locale === 'fa' ? 'text-sm' : 'text-[10px]'">{{ $t('common.share') }}</span>
                                        </button>
                                        
                                        <!-- Premium Share Dropdown -->
                                        <Transition
                                            enter-active-class="transition duration-300 ease-out"
                                            enter-from-class="transform scale-95 opacity-0 translate-y-2"
                                            enter-to-class="transform scale-100 opacity-100 translate-y-0"
                                            leave-active-class="transition duration-200 ease-in"
                                            leave-from-class="transform scale-100 opacity-100 translate-y-0"
                                            leave-to-class="transform scale-95 opacity-0 translate-y-2"
                                        >
                                            <div v-if="isShareMenuOpen" class="share-dropdown-content absolute top-full right-0 mt-3 w-60 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                                                <div class="p-4">
                                                    <div class="font-bold uppercase tracking-[0.2em] text-surface-400 mb-4 flex items-center gap-1.5" :class="locale === 'fa' ? 'text-sm' : 'text-[11px]'">
                                                        <span class="w-1 h-1 rounded-full bg-primary-500"></span>
                                                        {{ locale === 'fa' ? 'اشتراک‌گذاری' : 'Share Page' }}
                                                    </div>
                                                    
                                                    <div class="space-y-0.5">
                                                        <button 
                                                            v-for="item in shareItems" 
                                                            :key="item.id"
                                                            @click="shareTo(item.id)"
                                                            class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 group/item"
                                                        >
                                                            <div 
                                                                class="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-50 dark:bg-surface-700/50 group-hover/item:bg-primary-100 dark:group-hover/item:bg-primary-800/50 transition-colors"
                                                            >
                                                                <i :class="[item.icon, 'text-base group-hover/item:scale-110 transition-transform group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400']"></i>
                                                            </div>
                                                            <span class="font-medium text-surface-600 dark:text-surface-300 group-hover/item:text-primary-700 dark:group-hover/item:text-primary-300 transition-colors" :class="locale === 'fa' ? 'text-sm' : 'text-xs'">{{ item.label }}</span>
                                                        </button>
                                                    </div>

                                                    <div class="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
                                                        <button 
                                                            @click="copyLink"
                                                            class="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group/copy"
                                                            :class="copiedLink ? 'bg-emerald-500 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-800'"
                                                        >
                                                            <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-50 dark:bg-surface-700/50 group-hover/copy:bg-white/20 transition-colors">
                                                                <i :class="copiedLink ? 'pi pi-check' : 'pi pi-link'" class="text-base"></i>
                                                            </div>
                                                            <span class="font-bold uppercase tracking-wider" :class="locale === 'fa' ? 'text-sm' : 'text-xs'">{{ copiedLink ? (locale === 'fa' ? 'کپی شد!' : 'Copied!') : (locale === 'fa' ? 'کپی لینک' : 'Copy Link') }}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Transition>
                                    </div>
                                </div>
                            </ClientOnly>
                            
                            <div class="relative">
                                <Button 
                                    @click.stop="toggleDonate"
                                    :label="$t('common.donate')" 
                                    icon="pi pi-heart-fill" 
                                    severity="success" 
                                    size="small"
                                    class="donate-dropdown-trigger !rounded-full !px-8 !py-2.5 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 !border-none !text-white !font-black !tracking-[0.25em] !shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:!shadow-[0_12px_25px_rgba(16,185,129,0.4)] hover:!-translate-y-0.5 !transition-all !duration-300"
                                    :class="locale === 'fa' ? '!text-sm' : '!text-[11px]'"
                                />

                                <!-- Crypto Donate Dropdown -->
                                <Transition
                                    enter-active-class="transition duration-300 ease-out"
                                    enter-from-class="transform scale-95 opacity-0 translate-y-2"
                                    enter-to-class="transform scale-100 opacity-100 translate-y-0"
                                    leave-active-class="transition duration-200 ease-in"
                                    leave-from-class="transform scale-100 opacity-100 translate-y-0"
                                    leave-to-class="transform scale-95 opacity-0 translate-y-2"
                                >
                                    <div v-if="isDonateMenuOpen" class="donate-dropdown-content absolute top-full right-0 mt-3 w-60 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                                        <div class="p-4">
                                            <div class="font-bold uppercase tracking-[0.2em] text-surface-400 mb-4 flex items-center gap-1.5" :class="locale === 'fa' ? 'text-sm' : 'text-[11px]'">
                                                <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                {{ locale === 'fa' ? 'کمک مالی رمزنگاری' : 'Crypto Donation' }}
                                            </div>
                                            
                                            <div class="space-y-0.5">
                                                <button 
                                                    @click="copyCryptoAddress('BTC', BTC_ADDRESS)"
                                                    class="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group/item"
                                                    :class="copiedCryptoType === 'BTC' ? 'bg-emerald-500 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-800'"
                                                >
                                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-50 dark:bg-surface-700/50 group-hover/item:bg-white/20 transition-colors">
                                                        <i :class="copiedCryptoType === 'BTC' ? 'pi pi-check' : 'pi pi-bitcoin'" class="text-base text-[#F7931A]" :style="copiedCryptoType === 'BTC' ? 'color: white' : ''"></i>
                                                    </div>
                                                    <div class="flex flex-col items-start truncate">
                                                        <span class="font-medium uppercase tracking-wider" :class="locale === 'fa' ? 'text-sm' : 'text-xs'">{{ copiedCryptoType === 'BTC' ? (locale === 'fa' ? 'کپی شد!' : 'Copied!') : (locale === 'fa' ? 'بیت‌کوین' : 'Bitcoin') }}</span>
                                                        <span v-if="copiedCryptoType !== 'BTC'" class="text-[9px] opacity-50 truncate w-32 tracking-normal font-normal uppercase">{{ BTC_ADDRESS }}</span>
                                                    </div>
                                                </button>

                                                <button 
                                                    @click="copyCryptoAddress('ETH', ETH_ADDRESS)"
                                                    class="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group/item"
                                                    :class="copiedCryptoType === 'ETH' ? 'bg-emerald-500 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-800'"
                                                >
                                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-50 dark:bg-surface-700/50 group-hover/item:bg-white/20 transition-colors">
                                                        <i :class="copiedCryptoType === 'ETH' ? 'pi pi-check' : 'pi pi-ethereum text-[#627EEA]'" class="text-base" :style="copiedCryptoType === 'ETH' ? 'color: white' : ''"></i>
                                                    </div>
                                                    <div class="flex flex-col items-start truncate">
                                                        <span class="font-medium uppercase tracking-wider" :class="locale === 'fa' ? 'text-sm' : 'text-xs'">{{ copiedCryptoType === 'ETH' ? (locale === 'fa' ? 'کپی شد!' : 'Copied!') : (locale === 'fa' ? 'اتریوم' : 'Ethereum') }}</span>
                                                        <span v-if="copiedCryptoType !== 'ETH'" class="text-[9px] opacity-50 truncate w-32 tracking-normal font-normal uppercase">{{ ETH_ADDRESS }}</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>

                        <!-- Mobile Menu Button -->
                        <div class="flex items-center gap-4 md:hidden">
                            <ClientOnly>
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </ClientOnly>
                            <Button icon="pi pi-bars" text rounded aria-label="Menu" @click="mobileMenuOpen = true" class="!w-12 !h-12 hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-all hover:scale-105" />
                        </div>
                    </div>
                </nav>
                <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover/top:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
            </div>

            <!-- Bottom Row: Navigation -->
            <div class="bg-surface-50/10 dark:bg-surface-950/10 border-t border-surface-200/20 dark:border-surface-800/20 relative z-10">
                <nav class="container mx-auto px-6 h-14 flex items-center gap-2 overflow-visible no-scrollbar">
                        <NuxtLink 
                            to="/incidents" 
                            class="px-5 py-2.5 rounded-xl hover:bg-surface-200/40 dark:hover:bg-surface-800/40 transition-all duration-300 flex items-center gap-3 font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap group tracking-wider"
                            active-class="!text-primary-600 dark:!text-primary-400 bg-primary-100/30 dark:bg-primary-900/20"
                            :class="locale === 'fa' ? 'text-sm' : 'text-xs'"
                        >
                            <i class="pi pi-exclamation-triangle text-base opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110"></i>
                            <span class="uppercase tracking-[0.15em]">{{ $t('common.incidents') }}</span>
                        </NuxtLink>

                        <NuxtLink 
                            to="/victims" 
                            class="px-5 py-2.5 rounded-xl hover:bg-surface-200/40 dark:hover:bg-surface-800/40 transition-all duration-300 flex items-center gap-3 font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap group tracking-wider"
                            active-class="!text-primary-600 dark:!text-primary-400 bg-primary-100/30 dark:bg-primary-900/20"
                            :class="locale === 'fa' ? 'text-sm' : 'text-xs'"
                        >
                            <i class="pi pi-user text-base opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110"></i>
                            <span class="uppercase tracking-[0.15em]">{{ $t('common.victims') }}</span>
                        </NuxtLink>

                        <NuxtLink 
                            to="/events" 
                            class="px-5 py-2.5 rounded-xl hover:bg-surface-200/40 dark:hover:bg-surface-800/40 transition-all duration-300 flex items-center gap-3 font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap group tracking-wider"
                            active-class="!text-primary-600 dark:!text-primary-400 bg-primary-100/30 dark:bg-primary-900/20"
                            :class="locale === 'fa' ? 'text-sm' : 'text-xs'"
                        >
                            <i class="pi pi-calendar text-base opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110"></i>
                            <span class="uppercase tracking-[0.15em]">{{ $t('common.events') }}</span>
                        </NuxtLink>

                        <!-- Wartime Dropdown -->
                        <div class="relative">
                            <button
                                @click.stop="toggleWartime"
                                class="wt-dropdown-trigger px-5 py-2.5 rounded-xl hover:bg-surface-200/40 dark:hover:bg-surface-800/40 transition-all duration-300 flex items-center gap-3 font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap group tracking-wider"
                                :class="[locale === 'fa' ? 'text-sm' : 'text-xs', isWartimeOpen ? '!text-primary-600 dark:!text-primary-400 bg-primary-100/30 dark:bg-primary-900/20' : '']"
                            >
                                <i class="pi pi-shield text-base opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110"></i>
                                <span class="uppercase tracking-[0.15em]">{{ $t('common.wartime') }}</span>
                                <i class="pi pi-chevron-down text-[10px] opacity-50 transition-transform duration-200" :class="{ 'rotate-180': isWartimeOpen }"></i>
                            </button>
                            <Transition
                                enter-active-class="transition-all duration-200 ease-out"
                                enter-from-class="opacity-0 -translate-y-2 scale-95"
                                enter-to-class="opacity-100 translate-y-0 scale-100"
                                leave-active-class="transition-all duration-150 ease-in"
                                leave-from-class="opacity-100 translate-y-0 scale-100"
                                leave-to-class="opacity-0 -translate-y-2 scale-95"
                            >
                                <div
                                    v-show="isWartimeOpen"
                                    class="wt-dropdown-content absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl shadow-surface-900/10 dark:shadow-black/30 overflow-hidden min-w-[180px] z-50"
                                >
                                    <a
                                        href="https://drive.google.com/file/d/136HDuo52j_eRlovuf3jIhT2om19wJq9q/view"
                                        target="_blank"
                                        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                                        @click="isWartimeOpen = false"
                                    >
                                        <i class="pi pi-book text-base opacity-60"></i>
                                        {{ $t('common.booklet') }}
                                    </a>
                                </div>
                            </Transition>
                        </div>

                        <!-- Global Pressure Dropdown -->
                        <div class="relative">
                            <button
                                @click.stop="toggleGlobalPressure"
                                class="gp-dropdown-trigger px-5 py-2.5 rounded-xl hover:bg-surface-200/40 dark:hover:bg-surface-800/40 transition-all duration-300 flex items-center gap-3 font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap group tracking-wider"
                                :class="[locale === 'fa' ? 'text-sm' : 'text-xs', isGlobalPressureOpen ? '!text-primary-600 dark:!text-primary-400 bg-primary-100/30 dark:bg-primary-900/20' : '']"
                            >
                                <i class="pi pi-globe text-base opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110"></i>
                                <span class="uppercase tracking-[0.15em]">{{ $t('common.globalPressure') }}</span>
                                <i class="pi pi-chevron-down text-[10px] opacity-50 transition-transform duration-200" :class="{ 'rotate-180': isGlobalPressureOpen }"></i>
                            </button>
                            <Transition
                                enter-active-class="transition-all duration-200 ease-out"
                                enter-from-class="opacity-0 -translate-y-2 scale-95"
                                enter-to-class="opacity-100 translate-y-0 scale-100"
                                leave-active-class="transition-all duration-150 ease-in"
                                leave-from-class="opacity-100 translate-y-0 scale-100"
                                leave-to-class="opacity-0 -translate-y-2 scale-95"
                            >
                                <div
                                    v-show="isGlobalPressureOpen"
                                    class="gp-dropdown-content absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl shadow-surface-900/10 dark:shadow-black/30 overflow-hidden min-w-[180px] z-50"
                                >
                                    <NuxtLink
                                        to="/entities"
                                        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                                        active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                        @click="isGlobalPressureOpen = false"
                                    >
                                        <i class="pi pi-users text-base opacity-60"></i>
                                        {{ $t('common.entities') }}
                                    </NuxtLink>
                                    <NuxtLink
                                        to="/countries"
                                        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                                        active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                        @click="isGlobalPressureOpen = false"
                                    >
                                        <i class="pi pi-chart-bar text-base opacity-60"></i>
                                        {{ $t('common.countries') }}
                                    </NuxtLink>
                                </div>
                            </Transition>
                        </div>
                </nav>
            </div>
        </header>

        <!-- Mobile Drawer -->
        <Drawer v-model:visible="mobileMenuOpen" position="right" class="w-72 !bg-surface-0/95 dark:!bg-surface-950/95 !backdrop-blur-xl">
            <div class="flex flex-col gap-1.5">
                <NuxtLink to="/incidents" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-exclamation-triangle text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>{{ $t('common.incidents') }}</span>
                </NuxtLink>
                <NuxtLink to="/victims" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-user text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>{{ $t('common.victims') }}</span>
                </NuxtLink>
                <NuxtLink to="/events" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-calendar text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>{{ $t('common.events') }}</span>
                </NuxtLink>
                <NuxtLink to="/assets" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                     <i class="pi pi-image text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                    <span>{{ $t('common.assets') }}</span>
                </NuxtLink>
                
                <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div class="px-4 py-2 text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em]">{{ $t('common.globalPressure') }}</div>
                    <NuxtLink to="/entities" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group mt-1" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                        <i class="pi pi-users text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                        <span>{{ $t('common.entities') }}</span>
                    </NuxtLink>
                    <NuxtLink to="/countries" class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group mt-1" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" @click="closeMenu">
                        <i class="pi pi-chart-bar text-lg opacity-70 group-[.router-link-active]:opacity-100"></i>
                        <span>{{ $t('common.countries') }}</span>
                    </NuxtLink>
                </div>

                <div class="mt-2 pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div class="px-4 py-2 text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em]">{{ $t('common.wartime') }}</div>
                    <a 
                        href="https://drive.google.com/file/d/136HDuo52j_eRlovuf3jIhT2om19wJq9q/view" 
                        target="_blank"
                        class="px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900 transition-all flex items-center gap-4 group mt-1"
                        @click="closeMenu"
                    >
                        <i class="pi pi-book text-lg opacity-70"></i>
                        <span>{{ $t('common.booklet') }}</span>
                    </a>
                </div>
            </div>
        </Drawer>

        <main class="flex-grow container mx-auto px-4 py-8">
            <slot />
        </main>
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
