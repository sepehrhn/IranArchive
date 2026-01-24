<script setup lang="ts">
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    event: ParsedEvent
}>();

const loc = props.event.location;
</script>

<template>
    <div v-if="loc" class="flex flex-col gap-1 text-sm">
        <div class="flex items-start gap-2">
            <i class="pi pi-map-marker text-primary mt-1"></i>
            <div>
                <!-- Always show Country/City unless totally withheld (unlikely per schema) -->
                <div class="font-medium text-surface-900 dark:text-surface-0">
                    {{ loc.city ? `${loc.city}, ` : '' }}{{ loc.country }}
                    <span v-if="loc.country_iso2" class="text-xs text-muted-color ml-1">({{ loc.country_iso2 }})</span>
                </div>

                <!-- Visibility Logic -->
                 <template v-if="loc.location_visibility === 'public'">
                    <div v-if="loc.venue_name" class="font-semibold">{{ loc.venue_name }}</div>
                    <div v-if="loc.address">{{ loc.address }}</div>
                    <div v-if="loc.meeting_point" class="text-primary text-xs mt-1">Meeting point: {{ loc.meeting_point }}</div>
                 </template>

                 <template v-else-if="loc.location_visibility === 'approximate'">
                    <div class="italic text-muted-color">Approximate location</div>
                    <div class="text-xs">Exact meeting point shared by organizers/channels.</div>
                 </template>

                 <template v-else-if="loc.location_visibility === 'withheld_until_day_of'">
                    <div class="italic text-warn-500">Location withheld for safety</div>
                    <div class="text-xs">Check organizer channels on day of event.</div>
                 </template>
                 
                 <template v-else>
                     <div class="italic text-muted-color">Private / Invite Only</div>
                 </template>
            </div>
        </div>
    </div>
    <div v-else-if="event.format === 'online'" class="flex items-center gap-2 text-sm">
        <i class="pi pi-globe text-primary"></i>
        <span>Online Event</span>
    </div>
</template>
