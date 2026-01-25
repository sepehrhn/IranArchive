<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

const props = defineProps<{
    events: ParsedEvent[];
    selectedCountry: string | null;
    selectedCity: string | null;
    showPastEvents: boolean;
}>();

const emit = defineEmits<{
    'update:selectedCountry': [countryCode: string | null];
    'update:selectedCity': [city: string | null];
    'update:showPastEvents': [value: boolean];
}>();

const { getAllCountries, getCountryFlagUrl } = useCountries();

// --- Country Logic (Derived from CountrySidebar) ---
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
    return Array.from(countryMap.entries())
        .map(([iso2, count]) => {
            const country = getAllCountries.value.find(c => c.iso2 === iso2);
            return {
                iso2,
                name: country?.name || iso2,
                count
            };
        })
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
});

// --- City Logic (Derived from CitySidebar) ---
const citiesWithEvents = computed(() => {
    if (!props.events || !props.selectedCountry) return [];

    // Filter events based on showPastEvents toggle and selected country
    const filteredEvents = props.events.filter(e => {
        const stateMatch = props.showPastEvents 
            ? ['past', 'held'].includes(e.computed_state)
            : ['upcoming', 'ongoing'].includes(e.computed_state);
        const countryMatch = e.location?.country === props.selectedCountry;
        return stateMatch && countryMatch;
    });

    // Count events per city
    const cityMap = new Map<string, number>();
    filteredEvents.forEach(event => {
        if (event.location?.city) {
            const count = cityMap.get(event.location.city) || 0;
            cityMap.set(event.location.city, count + 1);
        }
    });

    // Map to city details with counts
    return Array.from(cityMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => a.city.localeCompare(b.city));
});

const handleCountrySelect = (iso2: string) => {
    if (props.selectedCountry === iso2) {
        emit('update:selectedCountry', null);
        emit('update:selectedCity', null);
    } else {
        emit('update:selectedCountry', iso2);
        emit('update:selectedCity', null);
    }
};

const handleCitySelect = (city: string | null) => {
    emit('update:selectedCity', city);
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Countries Row -->
        <div v-if="countriesWithEvents.length > 0" class="overflow-x-auto -mx-4 px-4 pb-2 hide-scrollbar">
            <div class="flex gap-2 min-w-min">
                <button
                    v-for="country in countriesWithEvents"
                    :key="country.iso2"
                    @click="handleCountrySelect(country.iso2)"
                    :class="[
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap',
                        selectedCountry === country.iso2
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-surface-800/50 border-surface-700 text-surface-300 hover:border-surface-600 hover:bg-surface-800'
                    ]"
                >
                    <img 
                        :src="getCountryFlagUrl(country.iso2)"
                        :alt="country.name"
                        class="w-4 h-3 object-cover rounded-[2px]"
                    />
                    <span class="font-medium">{{ country.name }}</span>
                    <span 
                        :class="[
                            'text-xs opacity-80',
                             selectedCountry === country.iso2 ? 'text-blue-100' : 'text-surface-500'
                        ]"
                    >
                        ({{ country.count }})
                    </span>
                </button>
            </div>
        </div>

        <!-- Cities Row (Only if country selected) -->
        <div v-if="selectedCountry && citiesWithEvents.length > 0" class="overflow-x-auto -mx-4 px-4 pb-2 hide-scrollbar">
            <div class="flex gap-2 min-w-min">
                <!-- City List -->
                <button
                    v-for="city in citiesWithEvents"
                    :key="city.city"
                    @click="handleCitySelect(city.city === selectedCity ? null : city.city)"
                    :class="[
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap',
                        selectedCity === city.city
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-surface-800/50 border-surface-700 text-surface-300 hover:border-surface-600 hover:bg-surface-800'
                    ]"
                >
                    <span class="font-medium">{{ city.city }}</span>
                    <span 
                        :class="[
                            'text-xs opacity-80',
                             selectedCity === city.city ? 'text-blue-100' : 'text-surface-500'
                        ]"
                    >
                        ({{ city.count }})
                    </span>
                </button>
            </div>
        </div>

        <!-- Past Events Toggle -->
        <div class="flex items-center gap-3 px-1">
             <InputSwitch 
                :modelValue="showPastEvents"
                @update:modelValue="emit('update:showPastEvents', $event)" 
            />
            <span class="text-sm font-medium text-surface-300">Show past events</span>
        </div>
    </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
