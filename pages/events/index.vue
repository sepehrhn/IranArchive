<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

useHead({
    title: 'Events - IranArchive',
    meta: [
        { name: 'description', content: 'Find protests, rallies, and demonstrations in support of Iran happening across the globe.' }
    ]
});

// Get Data
const { data: events, pending } = await useFetch<ParsedEvent[]>('/api/events', { lazy: true });

// Load countries
const { loadCountries } = useCountries();
loadCountries();

// State

const selectedCountry = ref<string | null>(null);
const selectedCity = ref<string | null>(null);
const showPastEvents = ref(false);
const showSubmitDialog = ref(false);
const filterLoading = ref(false);

// Stats
const stats = computed(() => {
    if (!events.value) return { upcoming: 0, past: 0, total: 0 };
    const upcoming = events.value.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state)).length;
    const past = events.value.filter(e => ['past', 'held'].includes(e.computed_state)).length;
    return { upcoming, past, total: events.value.length };
});

// Filtering Logic
const filteredEvents = computed(() => {
    if (!events.value) return [];
    
    let res = events.value;

    // 1. Filter by Past Events Toggle
    if (showPastEvents.value) {
        // Show ONLY past events when toggle is ON
        res = res.filter(e => ['past', 'held'].includes(e.computed_state));
    } else {
        // Show only upcoming/ongoing events when toggle is OFF
        res = res.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state));
    }

    // 2. Filter by Country
    if (selectedCountry.value) {
        res = res.filter(e => e.location?.country === selectedCountry.value);
    }

    // 3. Filter by City
    if (selectedCity.value) {
        res = res.filter(e => e.location?.city === selectedCity.value);
    }



    // 5. Sort: Date order (closer dates top), then Featured
    res = [...res].sort((a, b) => {
        const getEventTime = (e: ParsedEvent) => {
            const formattedDate = e.date.start.replace(/\//g, '-');
            return new Date(`${formattedDate}T${e.date.start_time || '00:00'}:00`).getTime();
        };

        const aTime = getEventTime(a);
        const bTime = getEventTime(b);
        
        // Primary sort: Date proximity
        if (showPastEvents.value) {
            // For past events, show newest first (closest to today)
            if (aTime !== bTime) return bTime - aTime;
        } else {
            // For upcoming events, show earliest first (closest to today)
            if (aTime !== bTime) return aTime - bTime;
        }

        // Secondary sort: Featured status
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        
        return 0;
    });

    return res;
});

const handleCountrySelect = (countryCode: string | null) => {
    selectedCountry.value = countryCode;
    // City selection handled by watcher
};

const handleCitySelect = (city: string | null) => {
    selectedCity.value = city;
};

// Helper: Select first available city for current country
const autoSelectCity = () => {
    if (selectedCountry.value && events.value) {
        const targetStates = showPastEvents.value ? ['past', 'held'] : ['upcoming', 'ongoing'];
        const countryEvents = events.value.filter(e => 
            e.location?.country === selectedCountry.value && 
            targetStates.includes(e.computed_state) &&
            e.location?.city
        );
        
        if (countryEvents.length > 0) {
            const cities = Array.from(new Set(countryEvents.map(e => e.location.city!))).sort();
            if (cities.length > 0) {
                // Only change if current city is invalid or null
                if (!selectedCity.value || !cities.includes(selectedCity.value)) {
                    selectedCity.value = cities[0];
                }
                return;
            }
        }
    }
    selectedCity.value = null;
};

// Auto-select first country on page load or context change
const autoSelectCountry = () => {
    if (events.value && events.value.length > 0) {
        const targetStates = showPastEvents.value ? ['past', 'held'] : ['upcoming', 'ongoing'];
        
        // Try to keep current country if it has events
        if (selectedCountry.value) {
            const hasEvents = events.value.some(e => 
                e.location?.country === selectedCountry.value && 
                targetStates.includes(e.computed_state)
            );
            if (hasEvents) {
                // Country is valid, just re-check city
                autoSelectCity();
                return;
            }
        }

        const firstCountryWithEvents = events.value.find(e => 
            e.location?.country && targetStates.includes(e.computed_state)
        )?.location?.country;
        
        if (firstCountryWithEvents) {
            selectedCountry.value = firstCountryWithEvents;
            // Watcher will trigger autoSelectCity
        } else {
            selectedCountry.value = null;
            selectedCity.value = null;
        }
    }
};

// Auto-select first city when country changes
watch(selectedCountry, () => {
    autoSelectCity();
});

watch(() => events.value, (newEvents) => {
    if (newEvents && newEvents.length > 0) {
        autoSelectCountry();
    }
}, { immediate: true });

// When toggle changes, re-evaluate country and city
watch(showPastEvents, () => {
    autoSelectCountry();
});

// Simulate loading on filter change for better UX
watch([() => selectedCountry.value, () => selectedCity.value, () => showPastEvents.value], () => {
    filterLoading.value = true;
    setTimeout(() => {
        filterLoading.value = false;
    }, 300);
});

const isLoading = computed(() => pending.value || filterLoading.value);

const submissionStepTitle = ref('Submit a Global Solidarity Event');

</script>

<template>
    <div class="space-y-6">
        <div class="w-full">
            <!-- Hero Section -->
            <div class="relative bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 rounded-2xl overflow-hidden mb-8">
                <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
                <div class="relative px-8 py-10 md:py-12">
                    <div class="max-w-3xl">
                        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                            Global Solidarity Events
                        </h1>
                        <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                            Join the movement. Find protests, rallies, and demonstrations in support of Iran happening across the globe.
                        </p>
                        
                        <!-- Stats -->
                        <div class="flex flex-wrap gap-6 mb-8">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <i class="pi pi-calendar text-blue-400 text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-3xl font-bold text-white">
                                        <Skeleton v-if="pending" width="2rem" height="2.5rem" class="!bg-white/20" />
                                        <span v-else>{{ stats.upcoming }}</span>
                                    </p>
                                    <p class="text-sm text-surface-300 dark:text-surface-400">Upcoming</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center">
                                    <i class="pi pi-history text-gray-400 text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-3xl font-bold text-white">
                                        <Skeleton v-if="pending" width="2rem" height="2.5rem" class="!bg-white/20" />
                                        <span v-else>{{ stats.past }}</span>
                                    </p>
                                    <p class="text-sm text-surface-300 dark:text-surface-400">Past Events</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Action Button in Top Right -->
                    <div class="absolute top-8 right-8 md:top-12 md:right-8 flex flex-col items-end gap-3">
                        <Button
                            label="Submit an Event"
                            icon="pi pi-plus"
                            @click="showSubmitDialog = true"
                            class="hidden md:flex shadow-lg"
                        />
                        
                        <!-- Past Events Toggle (Desktop) -->
                        <div class="hidden md:flex items-center gap-3 bg-surface-900/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                            <span class="text-sm font-bold text-white">Show past events</span>
                            <InputSwitch v-model="showPastEvents" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile Filters (Sticky) -->
            <div class="sticky-trigger md:hidden mb-6 sticky top-4 z-30 bg-surface-0/95 dark:bg-surface-900/95 backdrop-blur-md py-4 px-1 rounded-xl border border-surface-200 dark:border-surface-800 shadow-md">
                <EventsMobileFilters 
                    :events="events || []"
                    :selectedCountry="selectedCountry"
                    :selectedCity="selectedCity"
                    :showPastEvents="showPastEvents"
                    :pending="pending"
                    @update:selectedCountry="handleCountrySelect"
                    @update:selectedCity="handleCitySelect"
                    @update:showPastEvents="showPastEvents = $event"
                />
            </div>

            <!-- Mobile Submit Button (Floating) -->
            <div class="fixed bottom-6 right-6 z-20 md:hidden">
                <Button 
                    icon="pi pi-plus" 
                    rounded
                    raised
                    size="large"
                    class="!w-14 !h-14 !shadow-2xl shadow-primary-500/30"
                    @click="showSubmitDialog = true"
                />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[240px_240px_1fr] gap-8 items-start">
                <!-- Country Sidebar (Desktop) -->
                <aside class="sticky-trigger hidden lg:block sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
                    <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
                        <div v-if="pending" class="space-y-4">
                            <Skeleton width="100%" height="2rem" />
                            <div class="space-y-2">
                                <Skeleton v-for="i in 5" :key="i" width="100%" height="2.5rem" />
                            </div>
                        </div>
                        <EventsCountrySidebar 
                            v-else-if="events"
                            :events="events" 
                            :selectedCountry="selectedCountry"
                            :showPastEvents="showPastEvents"
                            @selectCountry="handleCountrySelect"
                        />
                    </div>
                </aside>

                <!-- City Sidebar (Desktop) -->
                <aside class="sticky-trigger hidden lg:block sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
                    <div v-if="selectedCountry || pending" class="bg-surface-0 dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
                        <div v-if="pending" class="space-y-4">
                             <Skeleton width="100%" height="2rem" />
                            <div class="space-y-2">
                                <Skeleton v-for="i in 5" :key="i" width="100%" height="2.5rem" />
                            </div>
                        </div>
                        <EventsCitySidebar 
                            v-else-if="events && selectedCountry"
                            :events="events" 
                            :selectedCountry="selectedCountry"
                            :selectedCity="selectedCity"
                            :showPastEvents="showPastEvents"
                            @selectCity="handleCitySelect"
                        />
                    </div>
                     <div v-else-if="!pending" class="text-center p-8 opacity-50">
                        <i class="pi pi-map text-4xl text-surface-300 mb-2"></i>
                        <p class="text-sm text-surface-500">Select a country to filter</p>
                    </div>
                </aside>

                <!-- Events Content -->
                <main class="min-w-0">
                    <div v-if="isLoading" class="flex flex-col gap-6">
                        <EventsEventSkeleton v-for="i in 4" :key="i" />
                    </div>

                    <div v-else-if="filteredEvents.length > 0" class="flex flex-col gap-6">
                        <TransitionGroup name="list">
                            <EventsEventCard v-for="ev in filteredEvents" :key="ev.id" :event="ev" />
                        </TransitionGroup>
                    </div>
                    
                    <div v-else class="text-center py-32 bg-surface-50/50 dark:bg-surface-900/30 rounded-3xl border-2 border-dashed border-surface-200 dark:border-surface-800">
                        <div class="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <i class="pi pi-search text-3xl text-surface-300 dark:text-surface-600"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-surface-700 dark:text-surface-200 mb-2">No events found</h2>
                        <p class="text-surface-500 dark:text-surface-400 text-lg max-w-sm mx-auto">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                    </div>
                </main>
            </div>

            <!-- Submit Event Dialog -->
            <Dialog 
                v-model:visible="showSubmitDialog" 
                modal 
                :header="submissionStepTitle" 
                :style="{ width: '90vw', maxWidth: '1000px' }"
                :draggable="false"
                class="submission-dialog"
            >
                <SubmissionsEventSubmissionForm @update:step-title="submissionStepTitle = $event" />
            </Dialog>
    </div>
    </div>
</template>

<style scoped>
:deep(.submission-dialog) .p-dialog-header {
    @apply px-6 pt-6 md:px-8 md:pt-8;
}
:deep(.submission-dialog) .p-dialog-content {
    @apply px-6 pb-6 md:px-8 md:pb-8;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-surface-200 dark:bg-surface-700 rounded-full;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute; /* ensure removed items are taken out of flow */
  width: 100%; /* prevent collapse width */
  z-index: 0;
}
</style>
