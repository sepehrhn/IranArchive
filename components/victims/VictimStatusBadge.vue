<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
    const s = props.status.toLowerCase();
    if (s === 'killed') return t('victimsPage.killed');
    if (s === 'missing') return t('victimsPage.missing');
    return props.status.charAt(0).toUpperCase() + props.status.slice(1);
});

const statusClasses = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'killed':
            return '!bg-red-500 !text-white border-none shadow-md font-bold tracking-wide text-[10px] uppercase px-2 py-0.5 rounded-full';
        case 'missing':
            return '!bg-orange-500 !text-white border-none shadow-md font-bold tracking-wide text-[10px] uppercase px-2 py-0.5 rounded-full';
        default:
            return '';
    }
});
</script>

<template>
    <Tag :value="displayText" :class="statusClasses" />
</template>
