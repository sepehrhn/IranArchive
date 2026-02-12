<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    sources?: string | string[];
}>();

const parsedSources = computed(() => {
    const raw = props.sources;
    if (!raw) return [];
    
    // Handle comma-separated string
    const list = Array.isArray(raw) 
        ? raw 
        : raw.includes(',') 
            ? raw.split(',').map(s => s.trim()) 
            : [raw];
    
    return list.filter(Boolean).map((url, index) => {
        return {
            id: index,
            url: url,
            label: formatSourceName(url)
        };
    });
});
</script>

<template>
    <div class="space-y-4">
        
        <div v-if="parsedSources.length > 0" class="space-y-3">
            <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0 border-b border-surface-100 dark:border-surface-800 pb-2">Source Information</h4>

            <div class="flex flex-wrap gap-2">
                <a 
                    v-for="source in parsedSources" 
                    :key="source.id" 
                    :href="source.url" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="group inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                    :title="source.label"
                >
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ source.label }}
                </a>
            </div>
        </div>
        
        <p v-else class="text-surface-500 dark:text-surface-400 text-sm italic flex items-center gap-2">
            <i class="pi pi-info-circle"></i>
            <span>No source information available.</span>
        </p>
    </div>
</template>
