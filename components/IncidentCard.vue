<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { getStatusColor, formatDate, formatStatus } from '~/utils/formatters';

const { locale } = useI18n();

const props = defineProps<{
    incident: Incident;
}>();

const severityText = computed(() => {
    const s = props.incident.severity;
    if (!s) return null;
    
    const parts = [];
    if (s.deaths && (s.deaths.min || s.deaths.max)) {
        parts.push(`${useNuxtApp().$nFa(s.deaths.min || '0')}${s.deaths.max ? '-' + useNuxtApp().$nFa(s.deaths.max) : '+'} Deaths`);
    }
    if (s.injured && (s.injured.min || s.injured.max)) {
        parts.push(`${useNuxtApp().$nFa(s.injured.min || '0')}${s.injured.max ? '-' + useNuxtApp().$nFa(s.injured.max) : '+'} Injured`);
    }
    if (s.arrests && (s.arrests.min || s.arrests.max)) {
        parts.push(`${useNuxtApp().$nFa(s.arrests.min || '0')}${s.arrests.max ? '-' + useNuxtApp().$nFa(s.arrests.max) : '+'} Arrests`);
    }
    
    return parts.join(' • ');
});

// Format: City, Province
const locationText = computed(() => {
    const l = props.incident.location;
    const parts = [];
    if (l.city) parts.push(l.city);
    if (l.province && l.province !== l.city) parts.push(l.province);
    return parts.join(', ');
});

const getRatingColor = (value: number) => {
    if (value <= 4) return 'bg-red-500';
    if (value <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
};
</script>

<template>
    <NuxtLink :to="`/incidents/${incident.id}`" class="group block h-full">
        <div class="h-full flex flex-col bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-900 p-5">
            
            <!-- Header: Date & Status -->
            <div class="flex justify-between items-start mb-3">
                <div class="flex flex-col">
                    <span class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                        {{ formatDate(incident.occurred_at.start, locale) }}
                    </span>
                    <div class="flex items-center gap-1.5 mt-1 text-xs text-surface-600 dark:text-surface-300">
                        <i class="pi pi-map-marker text-primary-500"></i>
                        <span>{{ locationText }}</span>
                    </div>
                </div>
                <Tag :value="formatStatus(incident.status)" :severity="getStatusColor(incident.status)" class="shadow-sm font-semibold shrink-0" />
            </div>

            <!-- Title -->
            <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {{ incident.title }}
            </h3>

            <!-- Summary -->
            <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-3 mb-4 leading-relaxed flex-grow">
                {{ incident.summary }}
            </p>

            <!-- Confidence Ratings -->
            <div class="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-surface-100 dark:border-surface-800" v-if="incident.ratings">
                <!-- Truth Confidence -->
                <div v-if="incident.ratings.veracity" class="flex flex-col gap-1.5">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Veracity</span>
                        <span class="text-xs font-bold text-surface-700 dark:text-surface-200">{{ $nFa(incident.ratings.veracity) }}/{{ $nFa(10) }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" 
                             :class="getRatingColor(incident.ratings.veracity)"
                             :style="{ width: `${incident.ratings.veracity * 10}%` }">
                        </div>
                    </div>
                </div>
                
                <!-- Evidence Availability -->
                <div v-if="incident.ratings.evidence_availability" class="flex flex-col gap-1.5">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Evidence</span>
                        <span class="text-xs font-bold text-surface-700 dark:text-surface-200">{{ $nFa(incident.ratings.evidence_availability) }}/{{ $nFa(10) }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                             :class="getRatingColor(incident.ratings.evidence_availability)"
                             :style="{ width: `${incident.ratings.evidence_availability * 10}%` }">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer: Stats & Type -->
            <div class="flex items-center justify-between mt-auto">
                <div class="flex items-center gap-3">
                     <div class="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 font-medium text-[10px] uppercase tracking-wider text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700">
                        {{ incident.incident_type }}
                    </div>
                    
                    <div v-if="severityText" class="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5" :title="severityText">
                         <i class="pi pi-exclamation-circle"></i>
                         <span class="max-w-[120px] truncate">{{ severityText }}</span>
                    </div>
                </div>
                
                <span class="text-surface-400 group-hover:text-primary-500 transition-colors">
                    <i class="pi pi-arrow-right text-sm"></i>
                </span>
            </div>
        </div>
    </NuxtLink>
</template>
