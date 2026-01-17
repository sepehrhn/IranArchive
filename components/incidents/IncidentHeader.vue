<template>
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-4 text-sm text-surface-500 dark:text-surface-400">
      <NuxtLink to="/" class="hover:text-primary-500 transition-colors">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/incidents" class="hover:text-primary-500 transition-colors">Incidents</NuxtLink>
      <span>/</span>
      <span class="truncate text-surface-900 dark:text-surface-0 font-medium">{{ incident.title }}</span>
    </div>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <h1 class="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-0 flex-1 min-w-0 break-words leading-tight tracking-tight">{{ incident.title }}</h1>
        
        <div class="flex flex-col items-end gap-3 shrink-0">
             <div class="flex items-center gap-4 bg-surface-0 dark:bg-surface-800 p-2 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm" v-if="incident.ratings">
                <div class="flex flex-col items-center px-2" v-if="incident.ratings.truth_confidence" v-tooltip="'Likelihood the core claim is true (1–10).'">
                    <Knob v-model="incident.ratings.truth_confidence" :min="0" :max="10" :size="50" readonly :strokeWidth="6" :valueColor="getRatingColor(incident.ratings.truth_confidence)" rangeColor="var(--p-surface-200)" />
                    <span class="text-[10px] uppercase font-bold text-surface-500 mt-1">Truth</span>
                </div>
                <div class="w-px h-10 bg-surface-200 dark:bg-surface-700"></div>
                <div class="flex flex-col items-center px-2" v-if="incident.ratings.evidence_availability" v-tooltip="'Amount/quality of reviewable evidence available (1–10).'">
                    <Knob v-model="incident.ratings.evidence_availability" :min="0" :max="10" :size="50" readonly :strokeWidth="6" :valueColor="getRatingColor(incident.ratings.evidence_availability)" rangeColor="var(--p-surface-200)" />
                    <span class="text-[10px] uppercase font-bold text-surface-500 mt-1">Evidence</span>
                </div>
            </div>
            <Tag :value="formatStatus(incident.status)" :severity="getStatusColor(incident.status)" class="text-sm px-3 py-1 font-semibold uppercase tracking-wider" />
        </div>
      </div>

      <div class="flex flex-wrap gap-4 text-sm text-surface-600 dark:text-surface-300 items-center">
        <div class="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-full">
          <i class="pi pi-calendar text-primary-500"></i>
          <span class="font-medium">{{ formatRange(incident.occurred_at) }}</span>
          <span class="text-xs px-1.5 py-0.5 bg-white dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600 text-surface-500">
            {{ incident.occurred_at.precision }}
          </span>
        </div>
        <div class="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-full">
          <i class="pi pi-map-marker text-primary-500"></i>
          <span class="font-medium">{{ incident.location.city }}, {{ incident.location.province }}, {{ incident.location.country }}</span>
        </div>
      </div>

      <!-- Map Preview -->
      <div v-if="incident.location.lat" class="w-full h-48 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-inner bg-surface-100 dark:bg-surface-800 relative group">
          <IncidentsIncidentMap 
            :lat="incident.location.lat" 
            :lng="incident.location.lng" 
          />
          <div class="absolute inset-0 pointer-events-none border-inner border-black/5 dark:border-white/5 rounded-xl"></div>
      </div>

      <div class="card bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
        <div class="flex flex-col md:flex-row gap-8">
            <div class="flex-1">
                <h3 class="text-sm font-bold uppercase tracking-wider text-surface-500 mb-2">Executive Summary</h3>
                <p class="text-lg leading-relaxed text-surface-800 dark:text-surface-100">{{ incident.summary }}</p>
            </div>
            
            <!-- Vertical Divider (Desktop) -->
            <div class="hidden md:block w-px bg-surface-100 dark:bg-surface-800 self-stretch shrink-0"></div>
            <!-- Horizontal Divider (Mobile) -->
            <div class="block md:hidden h-px w-full bg-surface-100 dark:bg-surface-800"></div>
            
            <div class="w-full md:w-64 shrink-0">
                <h3 class="text-sm font-bold uppercase tracking-wider text-surface-500 mb-3">Confirmed Impact</h3>
                <ul class="space-y-3 text-sm">
                    <li class="flex justify-between items-center p-2 rounded hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                        <span class="text-surface-600 dark:text-surface-400">Deaths</span>
                        <span class="font-mono font-bold text-lg text-surface-900 dark:text-surface-0">{{ formatSeverityProp(incident.severity.deaths) }}</span>
                    </li>
                    <li class="flex justify-between items-center p-2 rounded hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                        <span class="text-surface-600 dark:text-surface-400">Injured</span>
                        <span class="font-mono font-bold text-lg text-surface-900 dark:text-surface-0">{{ formatSeverityProp(incident.severity.injured) }}</span>
                    </li>
                     <li class="flex justify-between items-center p-2 rounded hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                        <span class="text-surface-600 dark:text-surface-400">Arrests</span>
                        <span class="font-mono font-bold text-lg text-surface-900 dark:text-surface-0">{{ formatSeverityProp(incident.severity.arrests) }}</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
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
