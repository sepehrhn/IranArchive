<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

const formattedDate = computed(() => {
    const d = props.event.date;
    // Format: "Mon, Feb 09 • 20:00"
    // Since we don't have timezone, we just parse the string and format it.
    // We treat the string as "local" to the event.
    // Parsing "YYYY/MM/DD HH:mm"
    
    // Safety check
    if (!d || !d.start) return 'Invalid Date';

    try {
        const dateObj = new Date(d.start + (d.start_time ? ' ' + d.start_time : ''));
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        return dateObj.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        }) + (d.start_time ? ` — ${d.start_time}` : '');
    } catch (e) {
        return `${d.start} ${d.start_time}`;
    }
});
</script>

<template>
    <div class="flex flex-col gap-1">
        <span class="font-semibold text-base text-surface-900 dark:text-surface-0 leading-relaxed">
            {{ formattedDate }}
        </span>
    </div>
</template>
