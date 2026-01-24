<script setup lang="ts">
defineProps<{
    sourceType?: string;
    socialMediaLink?: string;
}>();
</script>

<template>
    <div class="space-y-3">
        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
            Source Information
        </h3>
        
        <div v-if="sourceType || socialMediaLink" class="space-y-2">
            <div v-if="sourceType" class="text-sm">
                <span class="font-medium text-surface-700 dark:text-surface-300">Type:</span>
                <span class="ml-2 text-surface-600 dark:text-surface-400">{{ sourceType }}</span>
            </div>
            
            <div v-if="socialMediaLink" class="text-sm">
                <span class="font-medium text-surface-700 dark:text-surface-300">Link:</span>
                <a 
                    :href="socialMediaLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-2 text-primary-600 dark:text-primary-400 hover:underline break-all"
                >
                    {{ socialMediaLink }}
                    <i class="pi pi-external-link text-xs ml-1"></i>
                </a>
            </div>
        </div>
        
        <p v-else class="text-surface-500 dark:text-surface-400 text-sm italic">
            No source information available.
        </p>
    </div>
</template>
