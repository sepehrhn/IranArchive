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
    selectCountry: [countryCode: string | null];
    selectCity: [city: string | null];
    close: [];
}>();

const { getAllCountries, getCountryFlagUrl } = useCountries();

const countryName = computed(() => {
    if (!props.selectedCountry) return null;
    return getAllCountries.value.find(c => c.iso2 === props.selectedCountry)?.name || props.selectedCountry;
});

const clearCountry = () => {
    emit('selectCountry', null);
    emit('selectCity', null);
};
</script>

<template>
    <div class="flex flex-col h-full bg-surface-0 dark:bg-surface-900">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
            <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">Filters</h2>
            <Button 
                icon="pi pi-times" 
                text 
                rounded 
                severity="secondary" 
                @click="emit('close')" 
            />
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            <!-- Active Selection / Navigation -->
            <div v-if="selectedCountry" class="mb-6 animate-fadein">
                <div class="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-xl mb-4">
                    <img 
                        :src="getCountryFlagUrl(selectedCountry)"
                        class="w-6 h-4 object-cover rounded shadow-sm"
                    />
                    <span class="font-bold text-primary-700 dark:text-primary-300 flex-1">{{ countryName }}</span>
                </div>
                
                <!-- City Selection -->
                 <EventsCitySidebar 
                    :events="events"
                    :selectedCountry="selectedCountry"
                    :selectedCity="selectedCity"
                    :showPastEvents="showPastEvents"
                    @selectCity="(city) => { emit('selectCity', city); emit('close'); }"
                />
            </div>

            <!-- Country List (only if no country selected) -->
            <div v-else class="animate-fadein">
                <EventsCountrySidebar 
                    :events="events"
                    :selectedCountry="selectedCountry"
                    :showPastEvents="showPastEvents"
                    @selectCountry="(country) => emit('selectCountry', country)"
                />
            </div>
        </div>
        
        <!-- Footer Actions -->
        <div class="p-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
           <Button 
                label="Show All Events" 
                class="w-full font-bold"
                size="large"
                @click="emit('close')"
           />
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
    @apply bg-surface-300 dark:bg-surface-700 rounded-full;
}

.animate-fadein {
    animation: fadein 0.3s ease-out;
}

@keyframes fadein {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
