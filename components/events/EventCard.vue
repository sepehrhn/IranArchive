<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

// Simple excerpt
const excerpt = computed(() => {
    return props.event.summary.length > 120 
        ? props.event.summary.substring(0, 120) + '...' 
        : props.event.summary;
});
</script>

<template>
    <div class="border border-surface-200 dark:border-surface-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-surface-0 dark:bg-surface-800 flex flex-col gap-3 h-full hover:border-primary-500/50">
        <!-- Header -->
        <div class="flex flex-col gap-2">
            <h3 class="font-bold text-lg leading-tight">
                <NuxtLink :to="`/events/${event.id}`" class="hover:text-primary transition-colors">
                    {{ event.title }}
                </NuxtLink>
            </h3>
            <!-- Badges (below title) -->
            <EventsEventBadges :event="event" />
        </div>

        <!-- Meta -->
        <div class="space-y-2">
            <EventsEventTimeBlock :event="event" />
            <EventsEventLocationBlock :event="event" />
        </div>

        <!-- Summary -->
        <p class="text-sm text-surface-600 dark:text-surface-300 line-clamp-2 flex-grow">
            {{ excerpt }}
        </p>

        <!-- Footer -->
        <div class="pt-2 mt-auto border-t border-surface-100 dark:border-surface-700 flex justify-between items-center text-xs">
            <span class="text-muted-color truncate max-w-[60%]">
                <i class="pi pi-user mr-1"></i>{{ event.organizer.name }}
            </span>
            <NuxtLink :to="`/events/${event.id}`">
                <Button label="Details" size="small" outlined class="!py-1 !px-2 !text-xs" />
            </NuxtLink>
        </div>
    </div>
</template>
