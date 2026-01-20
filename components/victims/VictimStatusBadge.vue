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
    <Badge :value="label" :severity="severity" class="font-medium shadow-sm" />
</template>
