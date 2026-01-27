<script setup lang="ts">
defineProps<{
    sourceType?: string;
    socialMediaLink?: string;
}>();
</script>

<template>
    <div class="space-y-4">
        <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Source Information</h4>
        
        <div v-if="sourceType || socialMediaLink" class="flex flex-col gap-3">
            <div v-if="sourceType" class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <i class="pi pi-file text-surface-400"></i>
                <span class="font-medium text-surface-900 dark:text-surface-200">Type:</span>
                <span>{{ sourceType }}</span>
            </div>
            
            <div v-if="socialMediaLink" class="flex items-center gap-2 text-sm">
                <i class="pi pi-link text-surface-400"></i>
                <span class="font-medium text-surface-900 dark:text-surface-200">Link:</span>
                <a 
                    :href="socialMediaLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline break-all transition-colors truncate max-w-full"
                >
                    {{ socialMediaLink }}
                </a>
            </div>
        </div>
        
        <p v-else class="text-surface-500 dark:text-surface-400 text-sm italic flex items-center gap-2">
            <i class="pi pi-info-circle"></i>
            <span>No source information available.</span>
        </p>
    </div>
</template>
