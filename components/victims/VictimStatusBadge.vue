<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    status: string;
}>();

const severity = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'killed':
            return 'danger'; // Red
        case 'missing':
            return 'warn'; // Orange
        default:
            return 'secondary';
    }
});

const displayText = computed(() => {
    return props.status.charAt(0).toUpperCase() + props.status.slice(1);
});
const statusClasses = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'killed':
            return '!bg-red-600 !text-red-200 border-none shadow-sm font-semibold';
        case 'missing':
            return '!bg-orange-500 !text-orange-200 border-none shadow-sm font-semibold';
        default:
            return '';
    }
});
</script>

<template>
    <Tag :value="displayText" :class="statusClasses" />
</template>
