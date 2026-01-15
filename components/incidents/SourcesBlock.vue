<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Primary Sources -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <i class="pi pi-star-fill text-yellow-500"></i> Primary Sources
      </h3>
      <div class="space-y-4">
        <div v-for="source in primarySources" :key="source.id" class="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:shadow-md transition-shadow">
          <a :href="source.url" target="_blank" rel="noopener noreferrer" class="block group">
            <h4 class="font-medium text-primary-600 group-hover:underline mb-1">{{ source.label }}</h4>
            <div class="text-xs text-gray-500 mb-2 truncate">{{ source.url }}</div>
          </a>
          <div class="text-sm text-gray-600 dark:text-gray-400">
             <div v-if="source.publisher" class="mb-1">Publisher: {{ source.publisher }}</div>
             <p v-if="source.notes" class="italic mt-2 text-xs">"{{ source.notes }}"</p>
          </div>
        </div>
        <p v-if="primarySources.length === 0" class="text-sm text-gray-500 italic">No primary sources listed.</p>
      </div>
    </div>

    <!-- Secondary Sources -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
         <i class="pi pi-bookmark text-blue-500"></i> Secondary Sources
      </h3>
      <div class="space-y-2">
         <ul class="list-disc list-inside space-y-2">
             <li v-for="source in secondarySources" :key="source.id" class="text-sm text-gray-700 dark:text-gray-300">
                <a :href="source.url" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">
                    {{ source.label }}
                </a>
                <span v-if="source.publisher" class="text-gray-500 mx-1">- {{ source.publisher }}</span>
             </li>
         </ul>
         <p v-if="secondarySources.length === 0" class="text-sm text-gray-500 italic">No secondary sources listed.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Source } from '~/types/incident';

const props = defineProps<{
  sources: Source[];
}>();

const primarySources = computed(() => props.sources.filter(s => s.type === 'primary'));
const secondarySources = computed(() => props.sources.filter(s => s.type === 'secondary'));
</script>
