<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

const showLocal = ref(false);

const timeFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    timeZoneName: 'short'
});

const eventTime = computed(() => {
    return timeFormat.format(new Date(props.event.start_at));
    // Implementation note: Ideally we'd strictly respect props.event.timezone for formatting the "Event Time"
    // But Intl API defaults to local if not overridden. We need to force timezone.
});

// Helper to format in specific timezone
const formatInZone = (dateStr: string, zone: string) => {
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            timeZone: zone,
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
        });
    } catch (e) {
        return dateStr; // Fallback
    }
}

const localTime = computed(() => {
    return new Date(props.event.start_at).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
    });
});
</script>

<template>
    <div class="flex flex-col gap-1 text-sm">
        <div class="flex items-center gap-2 font-medium text-surface-900 dark:text-surface-0">
            <i class="pi pi-calendar text-primary"></i>
            <span>
                {{ showLocal ? localTime : formatInZone(event.start_at, event.timezone) }}
            </span>
        </div>
        <div class="flex items-center gap-2 pl-6">
            <small class="text-muted-color cursor-pointer hover:underline" @click="showLocal = !showLocal">
                {{ showLocal ? 'Show Event Time' : 'Show My Local Time' }}
            </small>
        </div>
    </div>
</template>
