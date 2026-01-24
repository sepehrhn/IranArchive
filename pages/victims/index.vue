<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVictims } from '@/composables/useVictims';
import type { Victim } from '@/types/victims';
import VictimGalleryCard from '@/components/victims/VictimGalleryCard.vue';
import VictimSubmissionForm from '~/components/submissions/VictimSubmissionForm.vue';
import { submitToAPI } from '~/utils/submissionsClient';

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
const showSubmitDialog = ref(false);
const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');

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

const handleSubmission = async (payload: any) => {
    submitting.value = true;
    submitError.value = '';
    submitSuccess.value = false;

    try {
        await submitToAPI(payload);
        submitSuccess.value = true;
        setTimeout(() => {
            showSubmitDialog.value = false;
            submitSuccess.value = false;
        }, 3000);
    } catch (error) {
        submitError.value = error instanceof Error ? error.message : 'Submission failed';
    } finally {
        submitting.value = false;
    }
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
        <!-- Header Card -->
        <div class="flex flex-col gap-6 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm mb-6">
            <!-- Title & Actions -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">Victims</h1>
                    <p class="text-surface-500 dark:text-surface-400 mt-1">
                        {{ filteredVictims.length }} records found
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <Button
                        label="Submit Victim"
                        icon="pi pi-plus"
                        @click="showSubmitDialog = true"
                        class="text-sm"
                    />
                    <NuxtLink to="/docs/victims-submission">
                        <Button label="Documentation" icon="pi pi-book" severity="secondary" outlined class="text-sm" />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm mb-8">
            <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-0">
                <IconField iconPosition="left" class="w-full sm:w-64">
                     <InputIcon class="pi pi-search"></InputIcon>
                     <InputText v-model="searchQuery" placeholder="Search victims..." class="w-full" />
                 </IconField>
            </div>

            <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                 <Dropdown v-model="selectedCity" :options="cities" placeholder="City" showClear class="w-full sm:w-40" />
                 <Dropdown v-model="selectedProvince" :options="provinces" placeholder="Province" showClear class="w-full sm:w-40" />
                 
                 <Dropdown v-model="selectedStatus" :options="statuses" placeholder="Status" showClear class="w-full sm:w-40">
                    <template #option="{ option }">
                        {{ formatStatusLabel(option) }}
                    </template>
                     <template #value="{ value, placeholder }">
                        <span v-if="value">{{ formatStatusLabel(value) }}</span>
                        <span v-else>{{ placeholder }}</span>
                    </template>
                 </Dropdown>

                 <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label" optionValue="value" placeholder="Sort Order" class="w-full sm:w-40" />
            </div>
            
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

    <!-- Submit Dialog -->
    <Dialog v-model:visible="showSubmitDialog" modal header="Submit New Victim" :style="{ width: '50rem' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }">
        <div v-if="submitSuccess" class="text-center py-6">
            <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Submission Successful!</h3>
            <p class="text-surface-600 dark:text-surface-400">Thank you for your submission. It will be reviewed shortly.</p>
        </div>
        <div v-else-if="submitError" class="text-center py-6">
            <i class="pi pi-times-circle text-6xl text-red-500 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2 text-red-600">Submission Failed</h3>
            <p class="text-surface-600 dark:text-surface-400">{{ submitError }}</p>
            <Button label="Try Again" @click="submitError = ''" class="mt-4" />
        </div>
        <VictimSubmissionForm v-else :submitting="submitting" @submit="handleSubmission" />
    </Dialog>
</template>
