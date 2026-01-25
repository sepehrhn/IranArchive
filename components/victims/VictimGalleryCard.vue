<script setup lang="ts">
import type { Victim } from '@/types/victims';
import VictimPhoto from './VictimPhoto.vue';
import VictimStatusBadge from './VictimStatusBadge.vue';
import { computed } from 'vue';

import { formatDate } from '@/utils/formatters';

const props = defineProps<{
    victim: Victim
}>();

const formattedDate = computed(() => {
    if (!props.victim.date_of_death) return 'Unknown Date';
    return formatDate(props.victim.date_of_death);
});

// Use placeholder if no photo provided
const photoSrc = computed(() => {
    return props.victim.photo || '/placeholder-victim.png';
});
</script>

<template>
    <NuxtLink :to="`/victims/${victim.id}`" class="group block h-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
            <div class="relative overflow-hidden">
                <!-- Grayscale by default, colorful on hover -->
                <div class="victim-photo-wrapper">
                    <VictimPhoto :src="photoSrc" :alt="victim.name" aspect="portrait" />
                </div>
                <div class="absolute top-2 left-2">
                    <VictimStatusBadge :status="victim.status" />
                </div>
            </div>
            
            <div class="p-4 flex flex-col gap-2">
                <h3 class="font-bold text-lg text-surface-900 dark:text-surface-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ victim.name }}
                </h3>
                
                <div class="text-sm text-surface-600 dark:text-surface-400 flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                         <i class="pi pi-map-marker text-xs"></i>
                         <span>{{ victim.incident_city }}<span v-if="victim.incident_province">, {{ victim.incident_province }}</span></span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="pi pi-calendar text-xs"></i>
                        <span>{{ formattedDate }}</span>
                    </div>
                </div>

                <div v-if="victim.incident_ids?.length" class="mt-2 text-xs font-medium text-surface-500 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded inline-block self-start">
                    {{ victim.incident_ids.length }} Incident{{ victim.incident_ids.length !== 1 ? 's' : '' }} Linked
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<style scoped>
.victim-photo-wrapper :deep(img) {
    filter: grayscale(100%);
    transition: filter 0.3s ease;
}

.group:hover .victim-photo-wrapper :deep(img) {
    filter: grayscale(0%);
}
</style>
