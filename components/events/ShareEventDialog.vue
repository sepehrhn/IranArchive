<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { useCountries } from '~/composables/useCountries';

const props = defineProps<{
    event: ParsedEvent;
}>();

const visible = defineModel<boolean>('visible');

const { t } = useI18n();
const { getCountryFlagUrl } = useCountries();

// State
const mode = ref<'link' | 'poster'>('link');
const posterSize = ref<'square' | 'portrait' | 'story'>('portrait');
const generating = ref(false);
const qrCodeUrl = ref('');
const copied = ref(false);

const posterRef = ref<HTMLElement | null>(null);

// Dimensions
const dimensions = computed(() => {
    switch (posterSize.value) {
        case 'square': return { width: 1080, height: 1080, aspect: 'aspect-square' };
        case 'portrait': return { width: 1080, height: 1350, aspect: 'aspect-[4/5]' };
        case 'story': return { width: 1080, height: 1920, aspect: 'aspect-[9/16]' };
        default: return { width: 1080, height: 1350, aspect: 'aspect-[4/5]' };
    }
});

// Event Link
const eventLink = computed(() => {
    if (import.meta.client) {
        return `${window.location.origin}/events?id=${props.event.id}`;
    }
    return '';
});

const flagUrl = computed(() => {
    if (props.event.location && !Array.isArray(props.event.location)) {
        return getCountryFlagUrl(props.event.location.country);
    }
    return undefined;
});

// Generate QR Code
watch(() => props.event, async () => {
    if (props.event && import.meta.client) {
        try {
            qrCodeUrl.value = await QRCode.toDataURL(eventLink.value, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error('QR Gen Error:', err);
        }
    }
}, { immediate: true });

// Copy Link
const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(eventLink.value);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    } catch (err) {
        console.error('Copy failed', err);
    }
};

// Download Poster
const downloadPoster = async () => {
    if (!posterRef.value) return;
    
    generating.value = true;
    
    // Wait for render
    await nextTick();
    await document.fonts.ready; // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const canvas = await html2canvas(posterRef.value, {
            scale: 2, // High res output
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0f172a', // dark-900
            logging: false,
            width: dimensions.value.width,
            height: dimensions.value.height,
             // Explicitly set window dimensions to ensure no clipping
            windowWidth: dimensions.value.width,
            windowHeight: dimensions.value.height
        });

        const link = document.createElement('a');
        link.download = `event-${props.event.id}-${posterSize.value}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('Poster generation failed:', err);
        alert('Failed to generate poster. Please try again.');
    } finally {
        generating.value = false;
    }
};
</script>

<template>
    <Dialog 
        v-model:visible="visible" 
        modal 
        header="Share Event" 
        :style="{ width: '90vw', maxWidth: '500px' }"
        :draggable="false"
        class="premium-dialog"
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <span class="text-lg font-bold text-surface-900 dark:text-surface-0">Share Event</span>
            </div>
        </template>

        <div class="flex flex-col gap-6">
            <!-- Mode Switcher -->
            <div class="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
                <button 
                    v-for="m in ['link', 'poster']" 
                    :key="m"
                    @click="mode = m as any"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200"
                    :class="mode === m ? 'bg-white dark:bg-surface-700 shadow text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                >
                    {{ m === 'link' ? 'Copy Link' : 'Download Poster' }}
                </button>
            </div>

            <!-- Link Mode -->
            <div v-if="mode === 'link'" class="space-y-4">
                <div class="aspect-square bg-white p-4 rounded-2xl mx-auto w-48 shadow-lg border border-surface-200">
                    <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="w-full h-full object-contain" />
                </div>
                
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase text-surface-500 tracking-wider">Event Link</label>
                    <div class="flex gap-2">
                        <div class="flex-1 p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl font-mono text-sm truncate text-surface-600 dark:text-surface-300">
                            {{ eventLink }}
                        </div>
                        <Button 
                            :icon="copied ? 'pi pi-check' : 'pi pi-copy'" 
                            :severity="copied ? 'success' : 'secondary'"
                            @click="copyLink"
                            class="!rounded-xl"
                        />
                    </div>
                </div>
            </div>

            <!-- Poster Mode -->
            <div v-if="mode === 'poster'" class="space-y-6">
                <!-- Size Selector -->
                <div class="flex gap-2 justify-center">
                    <button 
                        v-for="size in ['square', 'portrait', 'story']" 
                        :key="size"
                        @click="posterSize = size as any"
                        class="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all"
                        :class="posterSize === size ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400' : 'bg-transparent border-surface-200 dark:border-surface-700 text-surface-500'"
                    >
                        {{ size.charAt(0).toUpperCase() + size.slice(1) }}
                    </button>
                </div>

                <!-- Preview Area -->
                <div class="relative w-full bg-surface-100 dark:bg-surface-950/50 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 flex items-center justify-center p-8">
                     <!-- Loading Overlay -->
                    <div v-if="generating" class="absolute inset-0 z-20 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center">
                        <i class="pi pi-spin pi-spinner text-white text-3xl"></i>
                    </div>

                    <!-- Visual Preview (Wrapped and Scaled) -->
                    <!-- The wrapper is fixed size in the UI (approx 200-300px wide) -->
                    <!-- We scale the inner content to fit -->
                    <div :style="{ width: (dimensions.width * 0.22) + 'px', height: (dimensions.height * 0.22) + 'px' }" class="relative shadow-2xl flex-shrink-0">
                         <EventsSharePosterTemplate 
                            class="origin-top-left transform scale-[0.22]"
                            :event="event"
                            :qrCodeUrl="qrCodeUrl"
                            :flagUrl="flagUrl"
                            :width="dimensions.width"
                            :height="dimensions.height"
                        />
                    </div>
                </div>

                <Button 
                    label="Download Poster" 
                    icon="pi pi-download" 
                    @click="downloadPoster"
                    :loading="generating"
                    class="w-full"
                    fluid
                />
            </div>
        </div>

        <!-- Hidden Generation Source (Always in DOM but off-screen) -->
        <!-- Using fixed positioning far off-screen ensures it renders fully but isn't seen -->
        <div class="fixed top-0 left-[200vw] pointer-events-none opacity-100 z-[-100]">
            <div ref="posterRef">
                <EventsSharePosterTemplate 
                    v-if="mode === 'poster'"
                    :event="event"
                    :qrCodeUrl="qrCodeUrl"
                    :flagUrl="flagUrl"
                    :width="dimensions.width"
                    :height="dimensions.height"
                />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
/* Ensure fonts work in canvas */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');


:deep(.premium-dialog) {
    @apply border-0 shadow-2xl;
}
:deep(.premium-dialog .p-dialog-content) {
    @apply p-6 pt-2 bg-white dark:bg-surface-900 rounded-b-3xl;
}
:deep(.premium-dialog .p-dialog-header) {
    @apply p-6 pb-2 bg-white dark:bg-surface-900 rounded-t-3xl border-b-0;
}
:deep(.premium-dialog .p-dialog-header-icons) {
    @apply gap-2;
}
:deep(.premium-dialog .p-dialog-header-close) {
    @apply w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors;
}
</style>
