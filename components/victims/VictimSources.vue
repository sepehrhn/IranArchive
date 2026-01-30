<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    sourceType?: string;
    socialMediaLink?: string | string[];
}>();

const sources = computed(() => {
    const links = props.socialMediaLink;
    if (!links) return [];
    
    const list = Array.isArray(links) ? links : [links];
    
    return list.map((url, index) => {
        let label = 'Social Media Link';
        try {
            const u = new URL(url);
            label = u.hostname.replace('www.', '');
            if (label === 'x.com' || label === 'twitter.com') label = 'X (Twitter)';
            if (label === 'instagram.com') label = 'Instagram';
            if (label === 'youtube.com') label = 'YouTube';
            if (label === 'facebook.com') label = 'Facebook';
            if (label === 't.me') label = 'Telegram';
        } catch (e) {
            label = url;
        }

        return {
            id: index,
            url: url,
            label: label
        };
    });
});
</script>

<template>
    <div class="space-y-4">
        
        <div v-if="sources.length > 0 || sourceType" class="space-y-3">
            <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0 border-b border-surface-100 dark:border-surface-800 pb-2">Source Information</h4>

            <div v-if="sourceType" class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <i class="pi pi-file text-surface-400"></i>
                <span class="font-medium text-surface-900 dark:text-surface-200">Type:</span>
                <span>{{ sourceType }}</span>
            </div>

            <div v-if="sources.length > 0" class="flex flex-wrap gap-2">
                <a 
                    v-for="source in sources" 
                    :key="source.id" 
                    :href="source.url" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="group inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                    :title="source.label"
                >
                    <i class="pi pi-external-link text-[10px]"></i>
                    SRC
                </a>
            </div>
        </div>
        
        <p v-else class="text-surface-500 dark:text-surface-400 text-sm italic flex items-center gap-2">
            <i class="pi pi-info-circle"></i>
            <span>No source information available.</span>
        </p>
    </div>
</template>
