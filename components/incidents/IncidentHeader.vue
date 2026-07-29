<template>
  <div class="mb-10 relative">
    
    <!-- Breadcrumbs -->
    <nav class="relative z-10 flex items-center gap-2 mb-8 text-sm font-medium text-surface-500 dark:text-surface-400">
      <NuxtLink to="/" class="hover:text-primary-500 transition-colors flex items-center gap-1">
        <i class="pi pi-home text-[10px]"></i>
        <span>Home</span>
      </NuxtLink>
      <i class="pi pi-angle-right text-[10px] text-surface-300 dark:text-surface-700"></i>
      <NuxtLink to="/incidents" class="hover:text-primary-500 transition-colors">Incidents</NuxtLink>
      <i class="pi pi-angle-right text-[10px] text-surface-300 dark:text-surface-700"></i>
      <span class="truncate text-surface-900 dark:text-surface-100 max-w-[200px] md:max-w-md">{{ incident.title }}</span>
    </nav>

    <div class="flex flex-col gap-8 relative z-10">
      <!-- Title Area with Background Glow -->
      <div class="relative">
          <div class="absolute -left-20 -top-20 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none opacity-50"></div>
          
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative">
            <div class="flex-1 space-y-4">
                <div class="flex flex-wrap items-center gap-3">
                     <Tag :value="formatStatus(incident.status).toUpperCase()" :severity="getStatusColor(incident.status)" class="font-bold tracking-widest px-2.5 py-1 text-[10px] shadow-sm" rounded />
                     <span class="text-xs font-mono text-surface-500 dark:text-surface-400">ID: {{ $nFa(incident.id) }}</span>
                </div>

                <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-surface-900 dark:text-surface-0 tracking-tight leading-[1.1] drop-shadow-sm">
                    {{ incident.title }}
                </h1>
                
                <div class="flex flex-wrap gap-4 items-center text-sm text-surface-600 dark:text-surface-300 pt-2">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                        <i class="pi pi-calendar text-primary-500"></i>
                        <span class="font-medium text-surface-700 dark:text-surface-200">{{ $nFa(formatRange(incident.occurred_at)) }}</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                        <i class="pi pi-map-marker text-primary-500"></i>
                        <span class="font-medium text-surface-700 dark:text-surface-200">{{ incident.location.city }}, {{ incident.location.province }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Scores / Actions -->
            <div class="flex flex-row gap-3 shrink-0">
                <!-- Truth Score (Semicircle) -->
                <div class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm" v-if="incident.ratings?.veracity">
                    <div class="relative flex items-end justify-center w-20 h-10 overflow-hidden">
                         <!-- Background Arc -->
                        <svg class="w-full h-[200%] absolute top-0" viewBox="0 0 36 36">
                            <path class="text-surface-100 dark:text-surface-800" d="M2.0845 18 a 15.9155 15.9155 0 0 1 31.831 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                        </svg>
                        <!-- Progress Arc -->
                         <svg class="w-full h-[200%] absolute top-0" viewBox="0 0 36 36">
                            <path :stroke="getRatingColor(incident.ratings.veracity)" :stroke-dasharray="`${(incident.ratings.veracity / 10) * 50}, 100`" d="M2.0845 18 a 15.9155 15.9155 0 0 1 31.831 0" fill="none" stroke-width="4" stroke-linecap="round" />
                        </svg>
                        <span class="text-lg font-black text-surface-900 dark:text-surface-0 z-10 -mb-0.5">{{ $nFa(incident.ratings.veracity) }}</span>
                    </div>
                    <span class="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Veracity</span>
                </div>

                <!-- Evidence Score (Semicircle) -->
                <div class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm" v-if="incident.ratings?.evidence_availability">
                    <div class="relative flex items-end justify-center w-20 h-10 overflow-hidden">
                         <!-- Background Arc -->
                        <svg class="w-full h-[200%] absolute top-0" viewBox="0 0 36 36">
                            <path class="text-surface-100 dark:text-surface-800" d="M2.0845 18 a 15.9155 15.9155 0 0 1 31.831 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                        </svg>
                        <!-- Progress Arc -->
                         <svg class="w-full h-[200%] absolute top-0" viewBox="0 0 36 36">
                            <path :stroke="getRatingColor(incident.ratings.evidence_availability)" :stroke-dasharray="`${(incident.ratings.evidence_availability / 10) * 50}, 100`" d="M2.0845 18 a 15.9155 15.9155 0 0 1 31.831 0" fill="none" stroke-width="4" stroke-linecap="round" />
                        </svg>
                        <span class="text-lg font-black text-surface-900 dark:text-surface-0 z-10 -mb-0.5">{{ $nFa(incident.ratings.evidence_availability) }}</span>
                    </div>
                    <span class="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Evidence</span>
                </div>
            </div>
          </div>
      </div>

      <!-- Map & Summary Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Summary Card with Map on Top -->
          <!-- Main Content (Map + Summary) -->
          <div class="flex flex-col gap-6" :class="[hasSeverityStats ? 'lg:col-span-9' : 'lg:col-span-12']">
                
                <!-- Map Card -->
                <div v-if="incident.location.lat" class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden h-64 relative group">
                      <IncidentsIncidentMap 
                        :lat="incident.location.lat" 
                        :lng="incident.location.lng" 
                      />
                      <!-- Gradient overlay -->
                      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-4 left-5 text-white flex items-center gap-2 drop-shadow-md">
                           <i class="pi pi-map-marker text-primary-400"></i>
                           <span class="font-bold text-lg">{{ incident.location.city }}</span>
                      </div>
                </div>

                <!-- Summary Card -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6 md:p-8 relative">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 rounded-l-2xl"></div>
                    <h2 class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-4 flex items-center gap-2">
                        <i class="pi pi-align-left text-primary-500"></i> Summary
                    </h2>
                    <p class="text-lg leading-relaxed text-surface-800 dark:text-surface-200">{{ incident.summary }}</p>
                </div>
          </div>

          <!-- Right Column: Stats -->
          <div class="lg:col-span-3 flex flex-col gap-4" v-if="hasSeverityStats">
               <!-- Impact Stats (Vertical) -->
              <div class="flex flex-col gap-2">
                  <div v-if="incident.severity.deaths" class="bg-surface-0 dark:bg-surface-900 rounded-xl p-3 border border-surface-200 dark:border-surface-800 flex items-center justify-between shadow-sm">
                      <div class="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Deaths</div>
                      <div class="text-lg font-black text-red-500 dark:text-red-400">{{ formatSeverityProp(incident.severity.deaths) }}</div>
                  </div>
                   <div v-if="incident.severity.injured" class="bg-surface-0 dark:bg-surface-900 rounded-xl p-3 border border-surface-200 dark:border-surface-800 flex items-center justify-between shadow-sm">
                      <div class="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Injured</div>
                      <div class="text-lg font-black text-orange-500 dark:text-orange-400">{{ formatSeverityProp(incident.severity.injured) }}</div>
                  </div>
                   <div v-if="incident.severity.arrests" class="bg-surface-0 dark:bg-surface-900 rounded-xl p-3 border border-surface-200 dark:border-surface-800 flex items-center justify-between shadow-sm">
                      <div class="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Arrests</div>
                      <div class="text-lg font-black text-surface-700 dark:text-surface-200">{{ formatSeverityProp(incident.severity.arrests) }}</div>
                  </div>
              </div>



          </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { formatDate, formatRange } from '~/utils/formatters';

const props = defineProps<{
  incident: Incident;
}>();

const formatStatus = (status: string) => status.replace('_', ' ');

const getStatusColor = (status: string) => {
    switch (status) {
        case 'verified': return 'success';
        case 'disputed': return 'warn';
        case 'debunked': return 'danger';
        default: return 'info';
    }
};

const getRatingColor = (score: number) => {
    if (score >= 8) return '#22c55e'; // green-500
    if (score >= 5) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
};

// Handle both number and {min, max} range
const formatSeverityProp = (val: any) => {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'number') return useNuxtApp().$nFa(val.toString());
    if (typeof val === 'object') {
        if (val.min && val.max && val.min !== val.max) return `${useNuxtApp().$nFa(val.min)}-${useNuxtApp().$nFa(val.max)}`;
        if (val.min) return useNuxtApp().$nFa(val.min.toString());
        if (val.max) return useNuxtApp().$nFa(val.max.toString());
    }
    return '-';
};

const hasSeverityStats = computed(() => {
    const s = props.incident.severity;
    if (!s) return false;
    
    const hasValue = (val: any) => {
        if (typeof val === 'number') return val > 0;
        if (typeof val === 'object') return (val.min && val.min > 0) || (val.max && val.max > 0);
        return false;
    };

    return hasValue(s.deaths) || hasValue(s.injured) || hasValue(s.arrests);
});
</script>
```
