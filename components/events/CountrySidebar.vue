<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

const props = defineProps<{
    events: ParsedEvent[];
    selectedCountry: string | null;
    showPastEvents: boolean;
}>();

const emit = defineEmits<{
    selectCountry: [countryCode: string | null];
}>();

const { getAllCountries, getCountryFlagUrl } = useCountries();

const { t } = useI18n();

const countriesWithEvents = computed(() => {
    if (!props.events) return [];

    // Filter events based on showPastEvents toggle
    const filteredEvents = props.showPastEvents 
        ? props.events.filter(e => ['past', 'held'].includes(e.computed_state))
        : props.events.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state));

    // Count events per country
    const countryMap = new Map<string, number>();
    filteredEvents.forEach(event => {
        if (event.location?.country) {
            const count = countryMap.get(event.location.country) || 0;
            countryMap.set(event.location.country, count + 1);
        }
    });

    // Map to country details with counts
    const countries = Array.from(countryMap.entries())
        .map(([iso2, count]) => {
            const countryEntry = getAllCountries.value.find(c => c.iso2 === iso2);
            // Use i18n name if available, fallback to data name or ISO
            const name = t(`countries.${iso2}`, countryEntry?.name || iso2);
            return {
                iso2,
                name,
                count
            };
        })
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));

    return countries;
});
</script>

<template>
    <div class="space-y-4">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 dark:text-surface-500 px-3">
            Countries
        </h3>
        <div class="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <!-- Country List -->
            <button
                v-for="country in countriesWithEvents"
                :key="country.iso2"
                @click="emit('selectCountry', country.iso2)"
                :class="[
                    'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left border',
                    selectedCountry === country.iso2
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300 border-primary-200 dark:border-primary-800/50 shadow-sm shadow-primary-500/10'
                        : 'bg-transparent text-surface-600 dark:text-surface-400 border-transparent hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-100 dark:hover:border-surface-700/50'
                ]"
            >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <img 
                        :src="getCountryFlagUrl(country.iso2)"
                        :alt="country.name" 
                        class="w-6 h-4 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <span :class="['text-sm truncate', selectedCountry === country.iso2 ? 'font-bold' : 'font-medium group-hover:text-surface-900 dark:group-hover:text-surface-100']">
                        {{ country.name }}
                    </span>
                </div>
                <Badge 
                    :value="$nFa(country.count)" 
                    :severity="selectedCountry === country.iso2 ? 'primary' : 'secondary'"
                    class="!text-[10px] !font-bold !px-1.5 !py-0.5 !min-w-[1.5rem] !rounded-md"
                />
            </button>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-surface-200 dark:bg-surface-700 rounded-full;
}
</style>
