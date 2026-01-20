<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVictims } from '@/composables/useVictims';
import type { Victim } from '@/types/victims';
import VictimGalleryCard from '@/components/victims/VictimGalleryCard.vue';

useHead({
    title: 'Victims - IranArchive',
    meta: [
        { name: 'description', content: 'Documented victims of the protests in Iran. This list includes verified, disputed, and unverified reports.' }
    ]
});

const { listVictims, buildFilterOptions, applyVictimQuery } = useVictims();

// State
const loading = ref(true);
const allVictims = ref<Victim[]>([]);
const filteredVictims = ref<Victim[]>([]);

// Filter Options
const cities = ref<string[]>([]);
const provinces = ref<string[]>([]);
const statuses = ref<string[]>([]);

// Filter Models
const searchQuery = ref('');
const selectedCity = ref<string>();
const selectedProvince = ref<string>();
const selectedStatus = ref<string>();
const dateRange = ref<Date[]>();
const selectedSort = ref('recent');

const sortOptions = [
    { label: 'Recent', value: 'recent' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' }
];

// Methods
const loadData = async () => {
    loading.value = true;
    allVictims.value = await listVictims();
    
    // Build options
    const options = buildFilterOptions(allVictims.value);
    cities.value = options.cities.map(c => c); // PrimeVue simple dropdown compatibility
    provinces.value = options.provinces.map(p => p);
    statuses.value = options.statuses.map(s => s);
    
    applyFilters();
    loading.value = false;
};

const applyFilters = () => {
    filteredVictims.value = applyVictimQuery(allVictims.value, {
        q: searchQuery.value,
        city: selectedCity.value,
        province: selectedProvince.value,
        status: selectedStatus.value,
        dateFrom: dateRange.value ? dateRange.value[0] : undefined,
        dateTo: dateRange.value ? dateRange.value[1] : undefined,
        sort: selectedSort.value
    });
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedCity.value = undefined;
    selectedProvince.value = undefined;
    selectedStatus.value = undefined;
    dateRange.value = undefined;
    selectedSort.value = 'recent';
    applyFilters();
};

const formatStatusLabel = (s: string) => {
    if (s === 'not_verified') return 'Not Verified';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

// Watchers
watch([searchQuery, selectedCity, selectedProvince, selectedStatus, dateRange, selectedSort], () => {
    applyFilters();
});

// Initialization
onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="space-y-6">
        <!-- Unified Header & Controls Card -->
        <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col gap-6">
            
            <!-- Top Row: Title/Count & Search -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">Victims</h1>
                    <p class="text-surface-500 dark:text-surface-400 mt-1">
                        {{ filteredVictims.length }} records found
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                     <IconField iconPosition="left" class="w-full sm:w-64">
                        <InputIcon class="pi pi-search"></InputIcon>
                        <InputText v-model="searchQuery" placeholder="Search victims..." class="w-full" />
                    </IconField>

                </div>
            </div>

            <!-- Filters Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <Dropdown v-model="selectedCity" :options="cities" placeholder="Filter by City" showClear class="w-full" />
                 <Dropdown v-model="selectedProvince" :options="provinces" placeholder="Filter by Province" showClear class="w-full" />
                 
                 <Dropdown v-model="selectedStatus" :options="statuses" placeholder="Filter by Status" showClear class="w-full">
                    <template #option="{ option }">
                        {{ formatStatusLabel(option) }}
                    </template>
                     <template #value="{ value, placeholder }">
                        <span v-if="value">{{ formatStatusLabel(value) }}</span>
                        <span v-else>{{ placeholder }}</span>
                    </template>
                 </Dropdown>

                 <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label" optionValue="value" placeholder="Sort Order" class="w-full" />
            </div>
            
            <!-- Mobile Clear Button -->
            <Button label="Clear Filters" icon="pi pi-filter-slash" outlined severity="secondary" @click="clearFilters" class="w-full md:hidden" />
        </div>

        <!-- Results -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="h-64 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="filteredVictims.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <VictimGalleryCard 
                v-for="victim in filteredVictims" 
                :key="victim.id" 
                :victim="victim" 
            />
        </div>

        <div v-else class="text-center py-12 bg-surface-50 dark:bg-surface-900 rounded-lg border border-dashed border-surface-300 dark:border-surface-700">
            <i class="pi pi-search text-4xl text-surface-400 mb-4"></i>
            <h3 class="text-xl font-medium text-surface-900 dark:text-surface-0">No victims found</h3>
            <p class="text-surface-500 mb-4">Try adjusting your search or filters.</p>
            <Button label="Clear Filters" text @click="clearFilters" />
        </div>
    </div>
</template>
