<template>
  <div class="relative pl-4 border-l border-gray-200 dark:border-gray-700 space-y-8">
    <div v-for="(event, index) in events" :key="index" class="relative">
      <!-- Dot -->
      <div class="absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-gray-900"></div>
      
      <div class="mb-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
        {{ formatDate(event.at) }}<span v-if="event.time" class="ml-1">{{ event.time }}</span>
      </div>
      
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ event.title }}</h3>
      
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
        {{ event.description }}
      </p>
      
      <div v-if="event.evidence_ids?.length || event.source_ids?.length" class="flex flex-col gap-2">
        <!-- Evidences -->
        <div v-if="event.evidence_ids?.length" class="flex gap-2 flex-wrap">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider self-center">Evidence linked:</span>
            <button 
            v-for="id in event.evidence_ids" 
            :key="id"
            @click="$emit('view-evidence', id)" 
            class="px-2 py-1 text-xs bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded transition-colors text-primary-600 dark:text-primary-400"
            >
            #{{ id }}
            </button>
        </div>

        <!-- Sources -->
        <div v-if="event.source_ids?.length" class="flex gap-2 flex-wrap">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider self-center">Sources linked:</span>
            <button 
            v-for="id in event.source_ids" 
            :key="id"
            @click="$emit('view-source', id)" 
            class="px-2 py-1 text-xs bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded transition-colors text-blue-600 dark:text-blue-400"
            title="Click to view source"
            >
             <!-- Try to find source label -->
              <template v-if="getSourceLabel(id)">
                  {{ getSourceLabel(id) }}
              </template>
              <template v-else>
                   #{{ id }}
              </template>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TimelineEvent, type Source } from '~/types/incident';
import { formatDate } from '~/utils/formatters';

const props = defineProps<{
  events: TimelineEvent[];
  sources?: Source[];
}>();

defineEmits<{
  (e: 'view-evidence', id: string): void;
  (e: 'view-source', id: string): void;
}>();

const getSourceLabel = (id: string) => {
    if (!props.sources) return null;
    const src = props.sources.find(s => s.id === id);
    if (!src) return null;
    
    // If label is short, use it, otherwise truncate or use publisher
    if (src.publisher) return src.publisher;
    if (src.label.length < 20) return src.label;
    return src.label.substring(0, 20) + '...';
};
</script>
