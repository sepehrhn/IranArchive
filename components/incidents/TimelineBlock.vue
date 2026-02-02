<template>
  <div class="space-y-0 relative">
    <!-- Vertical Line -->
    <div class="absolute left-4 top-4 bottom-4 w-px bg-surface-200 dark:bg-surface-800"></div>

    <div v-for="(event, index) in events" :key="index" class="relative pl-10 py-2 group">
      <div 
        class="absolute left-[9.5px] top-[14px] w-3.5 h-3.5 rounded-full border-[3px] bg-surface-0 dark:bg-surface-950 border-surface-300 dark:border-surface-600 transition-all z-10 group-hover:border-primary-500 group-hover:bg-primary-500 group-hover:scale-110 shadow-sm"
      ></div>
      
      <!-- Card/Content -->
      <div class="flex flex-col gap-1 relative">
          <!-- Time & Title -->
          <div class="flex flex-col gap-0.5">
             <!-- Date -->
             <div class="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-primary-500 mb-1">
                 <span>{{ $nFa(formatDateShort(event.at)) }}</span>
                 <span v-if="event.time" class="text-surface-400 dark:text-surface-600 text-[10px]">{{ $nFa(event.time) }}</span>
             </div>

             <!-- Title -->
             <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                 {{ event.title }}
             </h3>
          </div>
          
          <div class="text-base text-surface-600 dark:text-surface-300 leading-relaxed max-w-prose mt-1">
              {{ event.description }}
          </div>
      
          <!-- Footer: Sources / Evidence -->
           <div v-if="event.evidence_ids?.length || event.source_ids?.length" class="flex flex-wrap items-center gap-3 mt-3">
            
            <div v-if="event.evidence_ids?.length" class="flex gap-2 flex-wrap items-center">
                <button 
                    v-for="id in event.evidence_ids" 
                    :key="id"
                    @click="$emit('view-evidence', id)" 
                    class="group/ev inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold bg-surface-50 hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-800 rounded-md border border-surface-200 dark:border-surface-800 transition-colors"
                >
                    <i class="pi pi-camera text-primary-500"></i>
                    <span class="text-surface-600 dark:text-surface-400 group-hover/ev:text-primary-600 dark:group-hover/ev:text-primary-400">#{{ $nFa(shortenId(id)) }}</span>
                </button>
            </div>

            <div v-if="event.source_ids?.length" 
                 class="flex gap-2 flex-wrap items-center"
                 :class="{ 'pl-3 border-l border-surface-200 dark:border-surface-800': event.evidence_ids?.length }"
            >
                <a 
                    v-for="id in event.source_ids" 
                    :key="id"
                    href="#"
                    @click.prevent="$emit('view-source', id)" 
                    class="group/src inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <i class="pi pi-external-link text-[10px]"></i>
                  Src
                </a>
            </div>
           </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TimelineEvent, type Source } from '~/types/incident';

const props = defineProps<{
  events: TimelineEvent[];
  sources?: Source[];
}>();

defineEmits<{
  (e: 'view-evidence', id: string): void;
  (e: 'view-source', id: string): void;
}>();

const formatDateShort = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};

const shortenId = (id: string) => {
    if (!id) return '';
    return id.substring(id.lastIndexOf('-') + 1);
};
</script>
