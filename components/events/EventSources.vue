<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    sources: string[]
}>();

const formattedSources = computed(() => {
    if (!props.sources) return [];
    
    return props.sources.map((url, index) => {
        return {
            id: index,
            url: url,
            label: formatSourceName(url)
        };
    });
});
</script>

<template>
    <div v-if="formattedSources.length > 0" class="space-y-3">
        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
            <i class="pi pi-link text-primary-500 text-[10px]"></i>
            Sources & Verification
        </h4>

        <div class="flex flex-wrap gap-2">
            <a 
                v-for="source in formattedSources" 
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
</template>
