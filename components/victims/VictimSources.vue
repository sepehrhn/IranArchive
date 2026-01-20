<script setup lang="ts">
const props = defineProps<{
    sources: string[]
}>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Sources</h3>
        <ul v-if="sources.length > 0" class="flex flex-col gap-1 list-disc list-inside">
            <li v-for="(source, index) in sources" :key="index" class="text-sm">
                <a 
                    :href="source" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-primary-600 dark:text-primary-400 hover:underline break-all"
                >
                    {{ source }}
                </a>
            </li>
        </ul>
        <p v-else class="text-surface-500 dark:text-surface-400 text-sm italic">
            No sources added yet.
        </p>
    </div>
</template>
