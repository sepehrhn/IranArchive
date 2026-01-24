<script setup lang="ts">
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

const formatLabel = {
    'in_person': 'In Person',
    'online': 'Online',
    'hybrid': 'Hybrid'
};

const formatSeverity = {
    'in_person': 'info',
    'online': 'warn',
    'hybrid': 'success'
};

const stateSeverity = {
    'upcoming': 'success',
    'ongoing': 'warn',
    'held': 'secondary',
    'canceled': 'danger',
    'postponed': 'warn'
};
</script>

<template>
    <div class="flex flex-wrap gap-2">
        <!-- Computed State -->
        <Badge :value="event.computed_state.toUpperCase()" :severity="stateSeverity[event.computed_state] || 'info'" />

        <!-- Format -->
        <Badge :value="formatLabel[event.format]" :severity="formatSeverity[event.format]" variant="outline" />

        <!-- Type -->
        <Badge :value="event.type.replace('_', ' ').toUpperCase()" severity="secondary" variant="outline" />
        
        <!-- Verification -->
         <Tag v-if="event.status === 'verified'" icon="pi pi-check-circle" severity="success" value="Verified" rounded class="!bg-green-100 !text-green-700 dark:!bg-green-500/20 dark:!text-green-400"></Tag>
         <Tag v-if="event.status === 'disputed'" icon="pi pi-exclamation-triangle" severity="warn" value="Disputed" rounded class="!bg-orange-100 !text-orange-700 dark:!bg-orange-500/20 dark:!text-orange-400"></Tag>
    </div>
</template>
