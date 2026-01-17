<template>
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
      <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/incidents" class="hover:text-primary-500">Incidents</NuxtLink>
      <span>/</span>
      <span class="truncate">{{ incident.title }}</span>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-nowrap items-start justify-between gap-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex-1 min-w-0 break-words">{{ incident.title }}</h1>
        
        <div class="flex flex-col items-end gap-3 shrink-0">
             <div class="flex items-center gap-4" v-if="incident.ratings">
                <div class="flex flex-col items-center" v-if="incident.ratings.truth_confidence" v-tooltip="'Likelihood the core claim is true (1–10).'">
                    <Knob v-model="incident.ratings.truth_confidence" :min="0" :max="10" :size="60" readonly :strokeWidth="5" :valueColor="getRatingColor(incident.ratings.truth_confidence)" rangeColor="var(--p-surface-200)" />
                    <span class="text-[10px] uppercase font-bold text-gray-500 mt-1">Truth</span>
                </div>
                <div class="flex flex-col items-center" v-if="incident.ratings.evidence_availability" v-tooltip="'Amount/quality of reviewable evidence available (1–10).'">
                    <Knob v-model="incident.ratings.evidence_availability" :min="0" :max="10" :size="60" readonly :strokeWidth="5" :valueColor="getRatingColor(incident.ratings.evidence_availability)" rangeColor="var(--p-surface-200)" />
                    <span class="text-[10px] uppercase font-bold text-gray-500 mt-1">Evidence</span>
                </div>
            </div>
            <Tag :value="formatStatus(incident.status)" :severity="getStatusColor(incident.status)" class="text-base px-3 py-1 bg-opacity-90 shadow-sm" />
        </div>
      </div>

      <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div class="flex items-center gap-1">
          <i class="pi pi-calendar"></i>
          <span>{{ formatRange(incident.occurred_at) }}</span>
          <span class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
            {{ incident.occurred_at.precision }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <i class="pi pi-map-marker"></i>
          <span>{{ incident.location.city }}, {{ incident.location.province }}, {{ incident.location.country }}</span>
        </div>
      </div>

      <!-- Map Placeholder (to be replaced with MapLibre/Leaflet later if needed) -->
      <!-- Map Preview -->
      <div v-if="incident.location.lat" class="w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <IncidentsIncidentMap 
            :lat="incident.location.lat" 
            :lng="incident.location.lng" 
          />
      </div>

      <div class="flex flex-wrap gap-2 mt-2">
        <!-- Tags removed -->
      </div>

      <Card class="mt-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-none">
        <template #content>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1">
                    <h3 class="font-semibold mb-2">Summary</h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ incident.summary }}</p>
                </div>
                <!-- Vertical Divider (Desktop) -->
                <div class="hidden md:block w-px bg-surface-200 dark:bg-surface-700 self-stretch shrink-0"></div>
                <!-- Horizontal Divider (Mobile) -->
                <div class="block md:hidden h-px w-full bg-surface-200 dark:bg-surface-700"></div>
                
                <div class="w-full md:w-1/3">
                    <h3 class="font-semibold mb-2">Confirmed Impact</h3>
                    <ul class="space-y-1 text-sm">
                        <li class="flex justify-between">
                            <span>Deaths:</span>
                            <span class="font-mono font-bold">{{ formatSeverityProp(incident.severity.deaths) }}</span>
                        </li>
                        <li class="flex justify-between">
                            <span>Injured:</span>
                            <span class="font-mono font-bold">{{ formatSeverityProp(incident.severity.injured) }}</span>
                        </li>
                         <li class="flex justify-between">
                            <span>Arrests:</span>
                            <span class="font-mono font-bold">{{ formatSeverityProp(incident.severity.arrests) }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Incident, type StatsRange } from '~/types/incident';
import { formatRange, formatStatus } from '~/utils/formatters';

defineProps<{
  incident: Incident;
}>();

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'verified': 'success',
        'disputed': 'warn',
        'unverified': 'danger',
        'partially_verified': 'info'
    };
    return colors[status] || 'secondary';
};

const getRatingColor = (value: number) => {
    if (value <= 4) return 'var(--p-red-500)';
    if (value <= 7) return 'var(--p-orange-500)';
    return 'var(--p-green-500)';
};

const formatSeverityProp = (range?: StatsRange) => {
    if (!range) return '-';
    if (range.min && range.max) return `${range.min}-${range.max}`;
    if (range.min) return `${range.min}+`;
    if (range.max) return `<${range.max}`;
    return '?';
};
</script>
