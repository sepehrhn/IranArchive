<script setup lang="ts">
defineProps<{
    sources: string[]
}>();
</script>

<template>
    <div v-if="sources && sources.length > 0" class="flex flex-col gap-2">
        <h3 class="font-semibold text-lg flex items-center gap-2">
            <i class="pi pi-link"></i> Sources & Verification
        </h3>
        <ul class="list-disc list-inside space-y-1 text-sm">
            <li v-for="(source, idx) in sources" :key="idx">
                <a :href="source" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">
                    {{ source }}
                </a>
            </li>
        </ul>
    </div>
</template>

