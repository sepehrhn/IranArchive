<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

const props = defineProps<{
    event: ParsedEvent
}>();

const { getCountryByIso } = useCountries();
const loc = props.event.location;

const countryName = computed(() => {
    if (!loc?.country) return '';
    const c = getCountryByIso(loc.country);
    return c ? c.name : loc.country;
});
</script>

<template>
    <div v-if="loc" class="flex flex-col gap-1 text-sm">
        <div class="flex items-start gap-2">
            <i class="pi pi-map-marker text-primary mt-1"></i>
            <div>
                <!-- Always show Country/City unless totally withheld (unlikely per schema) -->
                <div class="font-medium text-surface-900 dark:text-surface-0">
                    {{ loc.city ? `${loc.city}, ` : '' }}{{ countryName }}
                </div>

                <div v-if="loc.address">{{ loc.address }}</div>
            </div>
        </div>
    </div>
    <div v-else-if="event.format === 'online'" class="flex items-center gap-2 text-sm">
        <i class="pi pi-globe text-primary"></i>
        <span>Online Event</span>
    </div>
</template>
