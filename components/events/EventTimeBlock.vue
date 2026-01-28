<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

const formattedDate = computed(() => {
    const d = props.event.date;
    if (!d || !d.start) return 'Invalid Date';

    const formatDate = (dateStr: string) => {
        const obj = new Date(dateStr);
        return isNaN(obj.getTime()) ? dateStr : obj.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });
    };

    const startStr = formatDate(d.start);
    const hasEndTime = d.end_time && d.end_time !== d.start_time;
    const isMultiDay = d.end && d.end !== d.start;

    // Base: "Jan 28 — 11:00"
    let result = `${startStr} — ${d.start_time}`;

    if (isMultiDay) {
        // "Jan 28 — 11:00 to Jan 30 — 14:00"
        result += ` to ${formatDate(d.end!)} — ${d.end_time || d.start_time}`;
    } else if (hasEndTime) {
        // "Jan 28 — 11:00 - 14:00"
        result += ` - ${d.end_time}`;
    }

    return result;
});
</script>

<template>
    <div class="flex flex-col gap-1">
        <span class="font-semibold text-base text-surface-900 dark:text-surface-0 leading-relaxed">
            {{ formattedDate }}
        </span>
    </div>
</template>
