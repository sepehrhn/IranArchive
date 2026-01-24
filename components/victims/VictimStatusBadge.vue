<script setup lang="ts">
import { computed } from 'vue';
import type { VictimStatus } from '@/types/victims';

const props = defineProps<{
    status: VictimStatus
}>();

const label = computed(() => {
    switch (props.status) {
        case 'verified': return 'Verified';
        case 'not_verified': return 'Not Verified';
        default: return props.status;
    }
});

const severity = computed(() => {
    switch (props.status) {
        case 'verified': return 'success';
        case 'not_verified': return 'secondary';
        default: return 'info';
    }
});
</script>

<template>
    <Tag v-if="status === 'verified'" icon="pi pi-check-circle" severity="success" value="Verified" rounded class="!bg-green-100 !text-green-700 dark:!bg-green-600 dark:!text-white"></Tag>
    <Tag v-else-if="status === 'not_verified'" icon="pi pi-question-circle" severity="secondary" value="Not Verified" rounded class="!bg-surface-100 !text-surface-600 dark:!bg-surface-800 dark:!text-surface-400"></Tag>
    <Badge v-else :value="label" :severity="severity" class="font-medium shadow-sm" />
</template>
