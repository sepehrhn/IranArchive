<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
    events: ParsedEvent[];
    selectedCountry: string | null;
    selectedCity: string | null;
    showPastEvents: boolean;
}>();

const emit = defineEmits<{
    selectCity: [city: string | null];
}>();

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
    const cities = Array.from(cityMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => a.city.localeCompare(b.city));

    return cities;
});
</script>

<template>
    <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 -translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
    >
        <div v-if="selectedCountry" class="space-y-4">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 dark:text-surface-500 px-3">
                Cities
            </h3>
            <div class="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <!-- City List -->
                <button
                    v-for="city in citiesWithEvents"
                    :key="city.city"
                    @click="emit('selectCity', city.city)"
                    :class="[
                        'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left border',
                        selectedCity === city.city
                            ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-200 dark:border-surface-600 shadow-sm'
                            : 'bg-transparent text-surface-600 dark:text-surface-400 border-transparent hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-100 dark:hover:border-surface-700/50'
                    ]"
                >
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <i :class="['pi pi-map-marker text-[10px]', selectedCity === city.city ? 'text-primary-500' : 'text-surface-300 dark:text-surface-600 group-hover:text-surface-400']"></i>
                        <span :class="['text-sm truncate', selectedCity === city.city ? 'font-bold' : 'font-medium group-hover:text-surface-900 dark:group-hover:text-surface-100']">
                            {{ city.city }}
                        </span>
                    </div>
                    <span class="text-[10px] font-bold text-surface-400 tracking-tighter">{{ city.count }}</span>
                </button>
            </div>
        </div>
    </Transition>
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
