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
</script>

<template>
    <Tag :value="displayText" :severity="severity" />
</template>
