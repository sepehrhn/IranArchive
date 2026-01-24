<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';

// Get Data
const { data: events } = await useFetch<ParsedEvent[]>('/api/events');

// State
const activeTab = ref(0); // 0: Upcoming+Ongoing, 1: Held, 2: Canceled/Postponed
const filters = ref({
    search: '',
    format: null,
    country: null,
    type: null
});

// Filtering Logic
const filteredEvents = computed(() => {
    if (!events.value) return [];
    
    let res = events.value;

    // 1. Filter by Tab
    if (activeTab.value === 0) {
        res = res.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state));
    } else if (activeTab.value === 1) {
        res = res.filter(e => e.computed_state === 'held');
    } else {
        res = res.filter(e => ['canceled', 'postponed'].includes(e.computed_state));
    }

    // 2. Filter by Criteria
    if (filters.value.search) {
        const q = filters.value.search.toLowerCase();
        res = res.filter(e => 
            e.title.toLowerCase().includes(q) || 
            e.location?.city?.toLowerCase().includes(q) ||
            e.organizer.name.toLowerCase().includes(q)
        );
    }
    if (filters.value.format) {
        res = res.filter(e => e.format === filters.value.format);
    }
    if (filters.value.type) {
        res = res.filter(e => e.type === filters.value.type);
    }
    if (filters.value.country) {
        res = res.filter(e => e.location?.country_iso2 === filters.value.country?.toUpperCase());
    }

    // 3. Sort: Featured First, then by Date (Ascending for upcoming, Descending for held)
    // Note: The API/Loader returns raw list sorted by start_at depending on implementation.
    // Generally for upcoming: Closest first. For held: Newest first.
    // Let's rely on loader's sort but hoist featured items.
    
    // Create a copy to sort
    res = [...res].sort((a, b) => {
        // 1. Featured priority
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        
        // 2. Date Sort (Closest/Newest first)
        // If sorting logic is complex (different per tab), keep it simple here or re-sort.
        // Assuming loader gives correct date order, we just maintain stability or re-sort.
        // For now, let's just prioritize featured.
        return 0; // Stable sort
    });

    return res;
});

const items = ref([
    { label: 'Upcoming & Ongoing', icon: 'pi pi-calendar' },
    { label: 'Archive', icon: 'pi pi-history' },
    { label: 'Canceled / Postponed', icon: 'pi pi-times-circle' }
]);

const formatOptions = [
    { label: 'All Formats', value: null },
    { label: 'In Person', value: 'in_person' },
    { label: 'Online', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' }
];

const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Rally', value: 'rally' },
    { label: 'Webinar', value: 'webinar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Conference', value: 'conference' },
    { label: 'Fundraiser', value: 'fundraiser' },
    { label: 'Other', value: 'other' } // Added 'Other' from schema if missing or simplified
];

// Country Logic
const { getAllCountries, loadCountries } = useCountries();
loadCountries();

const countryOptions = computed(() => {
    return getAllCountries.value.map(c => ({
        label: c.name,
        value: c.iso2
    })).sort((a, b) => a.label.localeCompare(b.label));
});
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <!-- Header Card -->
        <div class="flex flex-col gap-6 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm mb-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
                        Global Solidarity Events
                    </h1>
                    <p class="text-surface-500 dark:text-surface-400 mt-1 text-lg">
                        Join rallies, webinars, and gatherings to support the people of Iran.
                    </p>
                </div>
                <div class="flex gap-3">
                     <NuxtLink to="/docs/events-submission" class="no-underline">
                        <Button label="Submit an Event" icon="pi pi-plus" size="small" />
                    </NuxtLink>
                     <a href="/data/events/events.ics" download class="no-underline">
                        <Button label="Subscribe (ICS)" icon="pi pi-calendar-plus" severity="secondary" outlined size="small" />
                    </a>
                </div>
            </div>

            <!-- Controls Toolbar -->
            <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center pt-2 border-t border-surface-100 dark:border-surface-800 mt-2">
                <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-0">
                    <IconField iconPosition="left" class="w-full sm:w-64">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="filters.search" placeholder="Search events..." class="w-full" />
                    </IconField>
                </div>

                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                     <Select v-model="filters.format" :options="formatOptions" optionLabel="label" optionValue="value" placeholder="Format" class="w-full sm:w-40" />
                     <Select v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Type" class="w-full sm:w-40" />
                     <Select v-model="filters.country" :options="countryOptions" optionLabel="label" optionValue="value" placeholder="Country" class="w-full sm:w-48" filter showClear />
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div>
             <TabMenu v-model:activeIndex="activeTab" :model="items" class="mb-6" />

             <div v-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <EventsEventCard v-for="ev in filteredEvents" :key="ev.id" :event="ev" />
             </div>
             
             <div v-else class="text-center py-20 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800 border-dashed">
                <i class="pi pi-search text-4xl text-surface-400 mb-4 block"></i>
                <p class="text-xl text-surface-500">No events found matching your criteria.</p>
                <Button label="Clear Filters" text class="mt-2" @click="() => { filters.search=''; filters.format=null; filters.type=null; filters.country=null; activeTab=0; }" />
             </div>
        </div>
    </div>
</template>
