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
      <div class="flex flex-wrap items-start justify-between gap-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ incident.title }}</h1>
        <div class="flex gap-2">
            <Tag :value="incident.status.toUpperCase()" :severity="getStatusColor(incident.status)" />
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
      <div v-if="incident.location.lat" class="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden relative border border-gray-200 dark:border-gray-700">
         <div class="absolute inset-0 flex items-center justify-center">
             <div class="text-center">
                 <i class="pi pi-map text-2xl mb-2"></i>
                 <p class="text-sm">Map Preview: {{ incident.location.lat }}, {{ incident.location.lng }}</p>
             </div>
         </div>
      </div>

      <div class="flex flex-wrap gap-2 mt-2">
        <Chip v-for="tag in incident.tags" :key="tag" :label="tag" class="text-xs" />
      </div>

      <Card class="mt-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-none">
        <template #content>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1">
                    <h3 class="font-semibold mb-2">Summary</h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ incident.summary }}</p>
                </div>
                <Divider layout="vertical" class="hidden md:flex" />
                <Divider layout="horizontal" class="flex md:hidden" />
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
import { formatRange, getStatusColor } from '~/utils/formatters';

defineProps<{
  incident: Incident;
}>();

const formatSeverityProp = (range?: StatsRange) => {
    if (!range) return '-';
    if (range.min && range.max) return `${range.min}-${range.max}`;
    if (range.min) return `${range.min}+`;
    if (range.max) return `<${range.max}`;
    return '?';
};
</script>
