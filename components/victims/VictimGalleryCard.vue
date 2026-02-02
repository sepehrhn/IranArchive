<script setup lang="ts">
import type { Victim } from '@/types/victims';
import VictimPhoto from './VictimPhoto.vue';
import VictimStatusBadge from './VictimStatusBadge.vue';
import { computed, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePersianNumbers } from '@/composables/usePersianNumbers';

import { formatDate } from '@/utils/formatters';

const { t, locale } = useI18n();
const { pn } = usePersianNumbers();

const props = defineProps<{
    victim: Victim
}>();

const formattedDate = computed(() => {
    if (!props.victim.date_of_death) return t('victimDetail.unknown');
    return formatDate(props.victim.date_of_death, locale.value);
});

// Photo cycling logic
const currentPhotoIndex = ref(0);
const intervalId = ref<number | null>(null);

const hasMultiplePhotos = computed(() => {
    return props.victim.photos && props.victim.photos.length > 1;
});

const currentPhoto = computed(() => {
    if (!props.victim.photos || props.victim.photos.length === 0) return '/placeholder-victim.png';
    return props.victim.photos[currentPhotoIndex.value];
});

const startCycling = () => {
    if (!hasMultiplePhotos.value) return;
    
    // Stop any existing interval just in case
    stopCycling();
    
    intervalId.value = window.setInterval(() => {
        currentPhotoIndex.value = (currentPhotoIndex.value + 1) % props.victim.photos!.length;
    }, 1200); // Switch every 1.2s
};

const stopCycling = () => {
    if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
    }
    currentPhotoIndex.value = 0; // Reset to primary photo
};

// Cleanup on unmount
onUnmounted(() => {
    stopCycling();
});

const emit = defineEmits<{
    (e: 'click', id: string): void
}>();

const handleClick = (event: MouseEvent) => {
    // Allow default behavior (open in new tab) for modifier keys
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }
    
    // Prevent client-side navigation
    event.preventDefault();
    emit('click', props.victim.id);
};
</script>

<template>
    <NuxtLink 
        :to="`/victims/${victim.id}`" 
        @click="handleClick" 
        class="group block h-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
        @mouseenter="startCycling"
        @mouseleave="stopCycling"
    >
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-900">
            <div class="relative overflow-hidden">
                <!-- Grayscale by default, colorful on hover -->
                <div class="victim-photo-wrapper relative">
                    <VictimPhoto 
                        :src="currentPhoto" 
                        :alt="victim.name" 
                        aspect="portrait" 
                        class="!rounded-b-none" 
                    />
                    
                    <!-- Multiple Photos Indicator -->
                    <div 
                        v-if="hasMultiplePhotos" 
                        class="absolute bottom-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <span 
                            v-for="(_, idx) in victim.photos" 
                            :key="idx" 
                            class="w-1.5 h-1.5 rounded-full transition-all duration-300 bg-white/80 shadow-sm"
                            :class="[currentPhotoIndex === idx ? 'scale-125 bg-primary-500' : 'opacity-70']"
                        ></span>
                    </div>
                </div>
                <div class="absolute top-2 left-2">
                    <VictimStatusBadge :status="victim.status" />
                </div>
            </div>
            
            <div class="p-4 flex flex-col gap-2">
                <h3 class="font-bold text-lg text-surface-900 dark:text-surface-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                    {{ victim.name }}
                </h3>
                <p v-if="victim.persian_name" class="text-sm font-medium text-surface-500 dark:text-surface-400 font-fa" dir="rtl">
                    {{ victim.persian_name }}
                </p>
                
                <div class="text-sm text-surface-600 dark:text-surface-400 flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                         <i class="pi pi-map-marker text-xs"></i>
                         <span>
                             {{ victim.incident_city }}<span v-if="victim.incident_province">, {{ t(`provinces.${victim.incident_province}`, victim.incident_province) }}</span>
                         </span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="pi pi-calendar text-xs"></i>
                        <span>{{ formattedDate }}</span>
                    </div>
                </div>

                <div v-if="victim.incident_ids?.length" class="mt-2 text-xs font-medium text-surface-500 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded inline-block self-start">
                    {{ t('victimsPage.linkedIncidentsCount', { count: pn(victim.incident_ids.length) }, victim.incident_ids.length) }}
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<style scoped>
/* Only apply grayscale when NOT hovering over the card group */
.victim-photo-wrapper :deep(img) {
    filter: grayscale(100%);
    transition: filter 0.3s ease, opacity 0.5s ease;
}

.group:hover .victim-photo-wrapper :deep(img) {
    filter: grayscale(0%);
}
</style>
