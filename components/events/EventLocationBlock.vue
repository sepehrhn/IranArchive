<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

const props = defineProps<{
    event: ParsedEvent
}>();

const { getCountryByIso } = useCountries();
const loc = props.event.location;

const { t } = useI18n();
import { useI18n } from 'vue-i18n';

const countryName = computed(() => {
    if (!loc?.country) return '';
    const c = getCountryByIso(loc.country);
    return t(`countries.${loc.country}`, c ? c.name : loc.country);
});
</script>

<template>
    <div v-if="loc" class="flex flex-col gap-1">
        <!-- Always show Country/City unless totally withheld (unlikely per schema) -->
        <div class="font-semibold text-base text-surface-900 dark:text-surface-0">
            {{ loc.city ? `${loc.city}, ` : '' }}{{ countryName }}
        </div>

        <div v-if="loc.address" class="text-sm text-surface-600 dark:text-surface-300">{{ loc.address }}</div>
    </div>
    <div v-else-if="event.type === 'online'" class="font-semibold text-base text-surface-900 dark:text-surface-0">
        Online Event
    </div>
</template>
