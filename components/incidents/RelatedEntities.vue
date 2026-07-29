<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <!-- Victims -->
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
        <h3 class="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4 flex items-center gap-2">
            <i class="pi pi-users"></i> Victims / Affected
        </h3>
        
        <div v-if="victims.length" class="flex flex-wrap gap-2">
            <a 
                v-for="victim in victims" 
                :key="victim.id"
                :href="`/victims/${victim.id}`"
                @click.prevent="$emit('victim-click', victim.id)"
                class="no-underline group cursor-pointer"
            >
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 hover:bg-primary-50 dark:bg-surface-800 dark:hover:bg-primary-900/30 transition-colors border border-surface-200 dark:border-surface-700 hover:border-primary-200 dark:hover:border-primary-800/50">
                     <span class="text-sm font-medium text-surface-700 dark:text-surface-200 group-hover:text-primary-700 dark:group-hover:text-primary-300">{{ victim.name }}</span>
                </div>
            </a>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6 text-surface-400">
            <i class="pi pi-user-minus text-2xl mb-2 opacity-50"></i>
            <span class="text-xs italic">No specific individuals listed</span>
        </div>
    </div>

    <!-- Related Incidents -->
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
         <h3 class="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4 flex items-center gap-2">
             <i class="pi pi-link"></i> Related Incidents
         </h3>

        <div v-if="related.length" class="space-y-3">
            <NuxtLink 
                v-for="inc in related" 
                :key="inc.id" 
                :to="`/incidents/${inc.slug}`"
                class="block group"
            >
                <div class="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 leading-snug">
                        {{ inc.title }}
                    </span>
                    <Badge :value="inc.status" :severity="getStatusColor(inc.status)" class="text-[10px] uppercase font-bold tracking-wide" />
                </div>
            </NuxtLink>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6 text-surface-400">
            <i class="pi pi-link text-2xl mb-2 opacity-50"></i>
            <span class="text-xs italic">No related incidents linked</span>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { type Victim, type RelatedIncident } from '~/types/incident';
import { getStatusColor } from '~/utils/formatters';

defineProps<{
  victims: Victim[];
  related: RelatedIncident[];
}>();

defineEmits<{
  (e: 'victim-click', id: string): void
}>();
</script>
