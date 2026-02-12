<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Victim } from '@/types/victim';
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { formatDate } from '@/utils/formatters';

const props = defineProps<{
    visible: boolean;
    victim: Victim | null;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
    'close': [];
}>();

import { usePersianNumbers } from '@/composables/usePersianNumbers';

const { t, locale } = useI18n();
const { pn } = usePersianNumbers();

// -- State --
const selectedSize = ref('instagram_story'); // 'a4', 'a3', 'instagram_post', 'instagram_story', 'tiktok'
const selectedPhotoIndex = ref(0);
const autoFit = ref(true);
const addOverlay = ref(false); // Default false based on screenshot
const bloodEffect = ref(false);
const isPersian = computed(() => locale.value === 'fa');
const isMissing = computed(() => props.victim?.status === 'Missing');

// Dynamic Text/Colors based on status
const actionTextEn = computed(() => isMissing.value ? 'Captured by' : 'Killed by');

// Dynamic Font Sizing for Name
const nameFontSize = computed(() => {
    // Only show Persian name if locale is fa and persian_name exists
    const name = (isPersian.value && props.victim?.persian_name) 
        ? props.victim.persian_name 
        : (props.victim?.name || '');
        
    const length = name.length;
    const words = name.split(/\s+/); // Split by whitespace
    const longestWord = Math.max(...words.map(w => w.length), 0);
    
    // Priority 1: Long words must fit on a single line to avoid weird breaks
    // "ASGHARNEZHAD" is 12 chars. At >9 we start scaling down.
    if (longestWord > 14) return 'text-[1.1em] md:text-[1.6em] leading-tight';
    if (longestWord > 11) return 'text-[1.3em] md:text-[2.0em] leading-tight';
    if (longestWord > 9) return 'text-[1.6em] md:text-[2.4em] leading-tight';

    // Priority 2: Total length constraints for multi-word names
    if (length > 35) return 'text-[1.2em] md:text-[1.8em] leading-tight';
    if (length > 25) return 'text-[1.5em] md:text-[2.2em] leading-tight';
    if (length > 18) return 'text-[1.8em] md:text-[2.8em] leading-tight';

    // Default (Short names, Short words)
    return 'text-[2.2em] md:text-[3.5em] leading-none';
});
const actionTextFa = computed(() => isMissing.value ? 'دستگیر شده توسط' : 'کشته شده توسط');
const perpitratorTextEn = 'Islamic Republic'; // Fixed per request
const perpitratorTextFa = 'جمهوری اسلامی';

const statusColorClass = computed(() => isMissing.value ? 'text-orange-500' : 'text-red-500');
const statusGradientClass = computed(() => isMissing.value ? 'from-orange-900/60' : 'from-red-900/60');
const isGenerating = ref(false);
const qrCodeDataUrl = ref('');

// Computed
const currentPhoto = computed(() => {
    if (!props.victim?.photos || props.victim.photos.length === 0) {
        return props.victim?.photo;
    }
    return props.victim.photos[selectedPhotoIndex.value];
});

const posterAspectRatio = computed(() => {
    switch (selectedSize.value) {
        case 'a4': return '210/297';
        case 'a3': return '297/420'; // A3 is just larger A4 ratio usually, but let's stick to standard ISO
        case 'instagram_post': return '1/1';
        case 'instagram_story':
        case 'tiktok': return '9/16';
        default: return '9/16';
    }
});

const posterDimensions = computed(() => {
    // Return style object for the poster container preview
    // We'll use a fixed height for preview and calc width, or vice versa.
    // Actually, best to just use aspect-ratio css prop.
    return {
        aspectRatio: posterAspectRatio.value
    };
});

// Size Labels
const sizes = computed(() => [
    { label: t('assetsPage.filters.posters') + ' (A4)', value: 'a4' },
    { label: t('assetsPage.filters.posters') + ' (A3)', value: 'a3' },
    { label: 'Instagram', value: 'instagram_post' },
    { label: 'Story/TikTok', value: 'instagram_story' },
]);

// -- Logic --

// Generate QR Code on mount or when visibility changes
watch(() => props.visible, async (newVal) => {
    if (newVal) {
        try {
            const url = `${window.location.origin}/victims/${props.victim?.id}`;
            qrCodeDataUrl.value = await QRCode.toDataURL(url, {
                margin: 0,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (e) {
            console.error('QR Gen Error', e);
        }
        
        // Reset effects if missing
        if (isMissing.value) {
            bloodEffect.value = false;
        }
    }
});

const handleDownload = async () => {
    isGenerating.value = true;
    await nextTick();
    
    // 1. Get the element
    const posterElement = document.getElementById('poster-canvas');
    if (!posterElement) {
        console.error('Poster element not found');
        isGenerating.value = false;
        return;
    }

    try {
        // 2. Options for html2canvas
        // We want high resolution.
        // A4 at 300 DPI is huge (2480 x 3508).
        // Let's aim for a decent scale.
        
        // Define exact pixel dimensions for production export based on request?
        // Request: 1080x1920 for Story, 1080x1080 for Post.
        // A4: 2480 x 3508 (approx 300dpi)
        
        let width = 1080;
        let height = 1920;
        let scale = 2; // Default scale up for better quality on screens

        if (selectedSize.value === 'instagram_post') {
            height = 1080;
        } else if (selectedSize.value === 'a4') {
             // A4 aspect ratio 1:1.414
             width = 2480 / 2; // Scale down for canvas processing speed, then scale up via html2canvas scale if needed
             height = 3508 / 2; 
             scale = 2; // Output full resolution
        } else if (selectedSize.value === 'a3') {
             width = 3508 / 2;
             height = 4961 / 2;
             scale = 2;
        }

        const canvas = await html2canvas(posterElement, {
            scale: scale,
            useCORS: true, // Important for external images
            backgroundColor: '#000000', // Default background
            allowTaint: true,
            logging: false,
        });

        // 3. Download
        const link = document.createElement('a');
        link.download = `poster-${props.victim?.name || 'victim'}-${selectedSize.value}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (err) {
        console.error('Download failed', err);
    } finally {
        isGenerating.value = false;
    }
};



import { getMediaUrl } from '~/utils/mediaUrl';

</script>

<template>
    <Dialog 
        :visible="visible" 
        @update:visible="emit('update:visible', $event)"
        modal
        dismissableMask
        :style="{ width: '95vw', maxWidth: '1200px' }"
        :contentStyle="{ padding: '0', height: '85vh', maxHeight: '900px' }"
        class="poster-modal"
        :header="t('victimDetail.createMemorialPoster')"
    >
        <div class="flex flex-col lg:flex-row h-full">
            
            <!-- LEFT: Preview Area -->
            <div class="flex-1 bg-surface-900 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
                
                <!-- Loading Overlay during generation -->
                <div v-if="isGenerating" class="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4 text-white">
                    <i class="pi pi-spin pi-spinner text-4xl"></i>
                    <p>Generating Poster...</p>
                </div>

                <!-- Canvas / Poster Element -->
                <!-- We scale this with CSS transform to fit viewing area, but render it at high res logic is separate -->
                <!-- To make it WYSIWYG, we usually make a container with fixed aspect ratio and 100% height/width of that container -->
                
                <div class="relative shadow-2xl transition-all duration-300 ease-in-out origin-center"
                     style="height: 100%; max-height: 100%;">
                    
                    <div id="poster-canvas" class="relative bg-black overflow-hidden flex flex-col h-full w-full"
                         :style="{ aspectRatio: posterAspectRatio }">
                        
                        <!-- Background Image -->
                        <div class="absolute inset-0 z-0">
                            <img 
                                v-if="currentPhoto"
                                :src="getMediaUrl({ kind: 'victim_photo', relativePath: currentPhoto })" 
                                class="w-full h-full grayscale contrast-125"
                                :class="[ autoFit ? 'object-contain' : 'object-cover' ]"
                                crossOrigin="anonymous"
                            />
                        </div>

                        <!-- Dark Overlay -->
                         <div class="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/90"
                              :class="{ 'opacity-100': addOverlay, 'opacity-40': !addOverlay }"></div>

                         <!-- Blood Effect -->
                         <div v-if="bloodEffect" class="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-90">
                             <!-- Realistic SVG Blood Splatter -->
                             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="absolute top-0 right-0 w-full h-[60%] opacity-80" preserveAspectRatio="none">
                                <defs>
                                    <filter id="blood-glow">
                                        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path :fill="isMissing ? '#ea580c' : '#b91c1c'" filter="url(#blood-glow)" d="M200,0 L200,120 C180,110 170,130 150,115 C130,100 120,130 100,110 C80,90 60,110 50,90 C30,100 20,80 0,90 L0,0 Z" />
                                <circle :fill="isMissing ? '#ea580c' : '#b91c1c'" cx="160" cy="140" r="15" filter="url(#blood-glow)" opacity="0.8" />
                                <circle :fill="isMissing ? '#ea580c' : '#b91c1c'" cx="30" cy="110" r="8" filter="url(#blood-glow)" opacity="0.6" />
                                <circle :fill="isMissing ? '#ea580c' : '#b91c1c'" cx="80" cy="130" r="5" filter="url(#blood-glow)" opacity="0.7" />
                             </svg>
                             
                             <!-- Drips -->
                             <svg viewBox="0 0 100 100" class="absolute top-0 left-0 w-full h-full opacity-60" preserveAspectRatio="none">
                                 <path :fill="isMissing ? '#c2410c' : '#991b1b'" d="M10,0 C10,0 15,20 10,40 C5,60 15,65 10,70 C5,65 5,0 5,0 Z" />
                                 <path :fill="isMissing ? '#c2410c' : '#991b1b'" d="M80,0 C80,0 85,30 80,50 C75,70 85,75 80,80 C75,75 75,0 75,0 Z" />
                                 <path :fill="isMissing ? '#c2410c' : '#991b1b'" d="M40,0 C40,0 45,10 40,25 C35,40 45,45 40,50 C35,45 35,0 35,0 Z" />
                             </svg>
                         </div>


                        <!-- Content Layer -->
                        <div class="relative z-30 flex flex-col justify-between h-full p-[8%] text-center">
                            
                            <div class="pt-4 flex flex-col items-center">
                                <!-- Persian Layout -->
                                <template v-if="isPersian">
                                    <h3 class="text-white text-[1.1em] md:text-[1.3em] font-bold font-fa drop-shadow-lg leading-tight mb-1">
                                        {{ actionTextFa }}
                                    </h3>
                                    <h2 class="text-[1.6em] md:text-[2.2em] font-black font-fa drop-shadow-md leading-tight"
                                        :class="statusColorClass">
                                        {{ perpitratorTextFa }}
                                    </h2>
                                </template>

                                <!-- English Layout -->
                                <template v-else>
                                    <h3 class="text-white text-[0.9em] md:text-[1.1em] font-bold font-en uppercase drop-shadow-lg leading-tight tracking-wide mb-1">
                                        {{ actionTextEn }}
                                    </h3>
                                    <h2 class="text-[1.2em] md:text-[1.6em] font-black font-en uppercase drop-shadow-md leading-none tracking-tight"
                                        :class="statusColorClass">
                                        {{ perpitratorTextEn }}
                                    </h2>
                                </template>
                            </div>

                            <!-- Bottom: Info -->
                            <div class="flex flex-col items-center gap-2 pb-4 w-full">
                                <!-- Name -->
                                <h1 class="text-white font-black uppercase tracking-tighter drop-shadow-xl w-full px-2"
                                    :class="[nameFontSize, isPersian ? 'font-fa' : 'font-en']">
                                    {{ (isPersian && victim?.persian_name) ? victim.persian_name : victim?.name }}
                                </h1>

                                <!-- Details Line -->
                                <div class="flex flex-wrap items-center justify-center gap-2 text-white/70 text-[0.9em] font-medium mt-1">
                                    <span v-if="victim?.age">
                                        {{ isPersian ? pn(victim.age) : victim.age }} {{ t('victimDetail.yearsOld') }}
                                    </span>
                                    <span v-if="victim?.age && victim?.incident_province">•</span>
                                    <span v-if="victim?.incident_province">
                                        {{ t(`provinces.${victim.incident_province}`, victim.incident_province) }}
                                    </span>
                                </div>
                                
                                <div class="text-[0.8em] font-bold mt-1 mb-3" :class="statusColorClass">
                                    {{ formatDate(victim?.date_of_death, locale) }}
                                </div>

                                <!-- QR Code Area -->
                                <div class="mt-2 flex flex-col items-center gap-1">
                                    <div class="bg-white p-1 rounded-sm">
                                        <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" class="w-16 h-16 md:w-20 md:h-20 block" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

            </div>

            <!-- RIGHT: Controls -->
            <div class="w-full lg:w-[360px] bg-surface-800 border-l border-surface-700 flex flex-col h-full overflow-y-auto">
                <div class="p-6 space-y-8">
                    
                    <!-- Size Selector -->
                    <div>
                        <h3 class="text-sm font-semibold text-surface-400 mb-3">{{ t('victimDetail.selectSize') }}</h3>
                        <div class="grid grid-cols-2 gap-2">
                             <button 
                                v-for="size in sizes" 
                                :key="size.value"
                                @click="selectedSize = size.value"
                                class="px-3 py-2 rounded-lg text-sm border-2 transition-all text-center"
                                :class="selectedSize === size.value 
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-400 font-bold' 
                                    : 'border-surface-700 bg-surface-900 text-surface-300 hover:border-surface-600'"
                             >
                                {{ size.label }}
                             </button>
                        </div>
                    </div>

                    <!-- Photo Selector -->
                    <div v-if="victim?.photos && victim.photos.length > 1">
                         <h3 class="text-sm font-semibold text-surface-400 mb-3">{{ t('victimDetail.selectPhoto') }}</h3>
                         <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                             <button
                                v-for="(photo, idx) in victim.photos"
                                :key="idx"
                                @click="selectedPhotoIndex = idx"
                                class="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all"
                                :class="selectedPhotoIndex === idx ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'"
                             >
                                 <img :src="getMediaUrl({ kind: 'victim_photo', relativePath: photo })" class="w-full h-full object-cover" />
                             </button>
                         </div>
                         <div class="text-xs text-center text-surface-500 mt-1">
                             {{ selectedPhotoIndex + 1 }} / {{ victim.photos.length }}
                         </div>
                    </div>

                    <!-- Toggles -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <label class="text-surface-200 font-medium">{{ t('victimDetail.autoFit') }}</label>
                            <InputSwitch v-model="autoFit" />
                        </div>
                         <div class="flex items-center justify-between">
                            <label class="text-surface-200 font-medium">{{ t('victimDetail.addOverlay') }}</label>
                            <InputSwitch v-model="addOverlay" />
                        </div>
                         <div v-if="!isMissing" class="flex items-center justify-between">
                            <label class="text-surface-200 font-medium">{{ t('victimDetail.bloodEffect') }}</label>
                            <InputSwitch v-model="bloodEffect" />
                        </div>

                    </div>

                    <!-- Victim Mini Info -->
                    <div class="bg-surface-900 rounded-xl p-4 border border-surface-700 mt-4">
                        <h4 class="font-bold text-white text-lg mb-1">
                            {{ (isPersian && victim?.persian_name) ? victim.persian_name : victim?.name }}
                        </h4>
                        <div v-if="victim?.age" class="text-surface-500 text-sm mt-1">
                            {{ isPersian ? pn(victim.age) : victim.age }} {{ t('victimDetail.yearsOld') }}
                        </div>
                    </div>

                </div>

                <!-- Footer / Download -->
                <div class="mt-auto p-6 border-t border-surface-700">
                    <Button 
                        @click="handleDownload" 
                        :loading="isGenerating"
                        :label="t('victimDetail.download')" 
                        icon="pi pi-download" 
                        class="w-full font-bold !text-lg !py-3" 
                        severity="success" 
                    />
                </div>
            </div>

        </div>
    </Dialog>
</template>

<style scoped>
/* Font overrides if needed, assuming tailwind config handles font-fa and font-en */
.font-fa {
    font-family: 'Vazirmatn', sans-serif; /* Fallback */
}

/* Custom Scrollbar for photos */
.scrollbar-thin::-webkit-scrollbar {
    height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: var(--surface-600);
    border-radius: 20px;
}
</style>
