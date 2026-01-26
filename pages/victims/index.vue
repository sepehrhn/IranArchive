<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVictims } from '@/composables/useVictims';
import type { Victim } from '@/types/victims';
import VictimGalleryCard from '@/components/victims/VictimGalleryCard.vue';
import VictimSubmissionForm from '~/components/submissions/VictimSubmissionForm.vue';
import { initUpload, uploadToR2, completeSubmission } from '~/utils/submissionsClient';
import type { UploadedFileInfo } from '~/utils/submissionsClient';

useHead({
    title: 'Victims - IranArchive',
    meta: [
        { name: 'description', content: 'Documented victims of the protests in Iran. Honor their memory and support justice.' }
    ]
});

const { listVictims, buildFilterOptions, applyVictimQuery } = useVictims();

// State
const loading = ref(true);
const allVictims = ref<Victim[]>([]);
const filteredVictims = ref<Victim[]>([]);

// Filter Options (populated from data)
const allCities = ref<string[]>([]);
const allProvinces = ref<string[]>([]);
const provinceCityMap = ref<Record<string, string[]>>({});

// Filter Models
const searchQuery = ref('');
const selectedCity = ref<string>();
const selectedProvince = ref<string>();
const selectedStatus = ref<string>();
const selectedSort = ref('recent');
const showSubmitDialog = ref(false);
const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');

// Pagination
const currentPage = ref(0); // PrimeVue Paginator uses 0-based index for first
const pageSize = ref(15);

const sortOptions = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' }
];

const statusOptions = [
    { label: 'Killed', value: 'Killed' },
    { label: 'Missing', value: 'Missing' }
];

// Computed: Cities filtered by selected province
const availableCities = computed(() => {
    if (selectedProvince.value && provinceCityMap.value[selectedProvince.value]) {
        return provinceCityMap.value[selectedProvince.value];
    }
    return allCities.value;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
    return searchQuery.value || selectedCity.value || selectedProvince.value || selectedStatus.value;
});

// Active filter chips
const activeFilters = computed(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    if (searchQuery.value) {
        filters.push({ key: 'search', label: 'Search', value: searchQuery.value });
    }
    if (selectedProvince.value) {
        filters.push({ key: 'province', label: 'Province', value: selectedProvince.value });
    }
    if (selectedCity.value) {
        filters.push({ key: 'city', label: 'City', value: selectedCity.value });
    }
    if (selectedStatus.value) {
        filters.push({ key: 'status', label: 'Status', value: selectedStatus.value });
    }
    return filters;
});

// Computed: Paginated Victims
const paginatedVictims = computed(() => {
    const start = currentPage.value * pageSize.value;
    const end = start + pageSize.value;
    return filteredVictims.value.slice(start, end);
});

// Methods
const loadData = async () => {
    loading.value = true;
    allVictims.value = await listVictims();
    
    // Build options from data
    const options = buildFilterOptions(allVictims.value);
    allCities.value = options.cities;
    allProvinces.value = options.provinces;
    provinceCityMap.value = options.provinceCityMap;
    
    applyFilters();
    loading.value = false;
};

const applyFilters = () => {
    filteredVictims.value = applyVictimQuery(allVictims.value, {
        q: searchQuery.value,
        city: selectedCity.value,
        province: selectedProvince.value,
        status: selectedStatus.value,
        sort: selectedSort.value
    });
    // Reset pagination
    currentPage.value = 0; 
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedCity.value = undefined;
    selectedProvince.value = undefined;
    selectedStatus.value = undefined;
    selectedSort.value = 'recent';
    applyFilters();
};

const removeFilter = (key: string) => {
    switch (key) {
        case 'search':
            searchQuery.value = '';
            break;
        case 'province':
            selectedProvince.value = undefined;
            // Also clear city if it was province-dependent
            selectedCity.value = undefined;
            break;
        case 'city':
            selectedCity.value = undefined;
            break;
        case 'status':
            selectedStatus.value = undefined;
            break;
    }
};

const handlePageChange = (event: any) => {
    currentPage.value = event.page;
};

const handleSubmission = async (payload: any) => {
    submitting.value = true;
    submitError.value = '';
    submitSuccess.value = false;

    try {
        const { kind, data, files, turnstileToken } = payload;

        const fileInfos = await Promise.all(
            files.map(async (file: File) => ({
                name: file.name,
                size: file.size,
                mime: file.type,
                sha256: ''
            }))
        );

        const initResponse = await initUpload({
            turnstileToken,
            files: fileInfos,
            kind
        });

        const uploadedFiles: UploadedFileInfo[] = [];
        for (let i = 0; i < files.length; i++) {
            await uploadToR2(files[i], initResponse.uploads[i].putUrl);
            uploadedFiles.push({
                key: initResponse.uploads[i].key,
                originalName: files[i].name,
                name: files[i].name,
                size: files[i].size,
                mime: files[i].type,
                sha256: ''
            });
        }

        await completeSubmission({
            submissionId: initResponse.submissionId,
            kind,
            payload: data,
            uploadedFiles,
            turnstileToken
        });

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

// Stats
const killedCount = computed(() => allVictims.value.filter(v => v.status?.toLowerCase() === 'killed').length);
const missingCount = computed(() => allVictims.value.filter(v => v.status?.toLowerCase() === 'missing').length);

// Watchers
watch([searchQuery, selectedCity, selectedProvince, selectedStatus, selectedSort], () => {
    applyFilters();
});

// When province changes, clear city if it's not in the new province
watch(selectedProvince, (newProvince) => {
    if (newProvince && selectedCity.value) {
        const citiesInProvince = provinceCityMap.value[newProvince] || [];
        if (!citiesInProvince.includes(selectedCity.value)) {
            selectedCity.value = undefined;
        }
    }
});

// Initialization
onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="space-y-6">
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 rounded-2xl overflow-hidden">
            <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
            <div class="relative px-8 py-10 md:py-12">
                <div class="max-w-3xl">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                        Remembering the Victims
                    </h1>
                    <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                        This archive documents those who lost their lives or went missing during the protests in Iran. 
                        Their stories must be told. Their sacrifice must not be forgotten.
                    </p>
                    
                    <!-- Stats -->
                    <div class="flex flex-wrap gap-6 mb-8">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-red-400">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09l.4-.5C13.1 3.3 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.5L12 21.35zm0-16.3c-1.5 0-2.8.8-3.6 2.1l3.6 4.4L10 14l2 4-1.5 2.5 1.5.8 2-3L12 14l2-2.5-3.5-4.4c.7-1.3 2.1-2.1 3.5-2.1c2.2 0 4 1.8 4 4c0 2.8-2.5 5.3-7.5 9.8l1 1c5-4.5 7.5-7.5 7.5-10.8 0-3.3-2.7-6-6-6z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white">{{ killedCount }}</p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">Killed</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <i class="pi pi-search text-orange-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white">{{ missingCount }}</p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">Missing</p>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Action Button in Top Right -->
                <div class="absolute top-8 right-8 md:top-12 md:right-8">
                    <Button
                        label="Submit a Victim"
                        icon="pi pi-plus"
                        @click="showSubmitDialog = true"
                        class="shadow-lg"
                    />
                </div>
            </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 shadow-sm">
            <!-- Filter Row -->
            <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <!-- Search -->
                <div class="w-full lg:w-72">
                    <IconField iconPosition="left" class="w-full">
                        <InputIcon class="pi pi-search"></InputIcon>
                        <InputText 
                            v-model="searchQuery" 
                            placeholder="Search name, location, occupation..." 
                            class="w-full" 
                        />
                    </IconField>
                </div>

                <!-- Filter Dropdowns -->
                <div class="flex flex-wrap gap-3 w-full lg:w-auto lg:flex-1 lg:justify-end">
                    <Select 
                        v-model="selectedProvince" 
                        :options="allProvinces" 
                        placeholder="Province" 
                        showClear 
                        class="w-full sm:w-40"
                    />
                    <Select 
                        v-model="selectedCity" 
                        :options="availableCities" 
                        placeholder="City" 
                        showClear 
                        class="w-full sm:w-40"
                        :disabled="availableCities.length === 0"
                    />
                    <Select 
                        v-model="selectedStatus" 
                        :options="statusOptions" 
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Status" 
                        showClear 
                        class="w-full sm:w-32"
                    />
                    <Select 
                        v-model="selectedSort" 
                        :options="sortOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        class="w-full sm:w-36"
                    />
                </div>
            </div>

            <!-- Active Filters Chips -->
            <div v-if="activeFilters.length > 0" class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm text-surface-500">Active filters:</span>
                    <Chip 
                        v-for="filter in activeFilters" 
                        :key="filter.key"
                        :label="`${filter.label}: ${filter.value}`"
                        removable
                        @remove="removeFilter(filter.key)"
                        class="!bg-primary-100 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-300"
                    />
                    <Button 
                        label="Clear All" 
                        icon="pi pi-times" 
                        text 
                        size="small"
                        severity="secondary"
                        @click="clearFilters" 
                    />
                </div>
            </div>

            <!-- Results Count -->
            <div class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <p class="text-surface-500 text-sm">
                    Showing <span class="font-semibold text-surface-900 dark:text-surface-0">{{ paginatedVictims.length }}</span> 
                    of <span class="font-semibold text-surface-900 dark:text-surface-0">{{ filteredVictims.length }}</span> results 
                    <span v-if="filteredVictims.length !== allVictims.length">(filtered from {{ allVictims.length }})</span>
                </p>
                <div v-if="filteredVictims.length > pageSize">
                     <Paginator 
                        :first="currentPage * pageSize" 
                        :rows="pageSize" 
                        :totalRecords="filteredVictims.length" 
                        @page="handlePageChange"
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                        class="!bg-transparent !p-0"
                    />
                </div>
            </div>
        </div>

        <!-- Results Grid -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div v-for="i in 10" :key="i" class="aspect-[4/5] bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="paginatedVictims.length > 0" class="space-y-8">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <VictimGalleryCard 
                    v-for="victim in paginatedVictims" 
                    :key="victim.id" 
                    :victim="victim" 
                />
            </div>
            
             <!-- Bottom Pagination -->
            <div v-if="filteredVictims.length > pageSize" class="flex justify-center">
                <Paginator 
                    :first="currentPage * pageSize" 
                    :rows="pageSize" 
                    :totalRecords="filteredVictims.length" 
                    @page="handlePageChange"
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    class="!bg-transparent"
                />
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-surface-50 dark:bg-surface-900 rounded-2xl border-2 border-dashed border-surface-300 dark:border-surface-700">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
                <i class="pi pi-search text-3xl text-surface-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">No victims found</h3>
            <p class="text-surface-500 mb-6 max-w-md mx-auto">
                We couldn't find any victims matching your search criteria. Try adjusting your filters.
            </p>
            <Button label="Clear All Filters" icon="pi pi-refresh" @click="clearFilters" />
        </div>
    </div>

    <!-- Submit Dialog -->
    <Dialog 
        v-model:visible="showSubmitDialog" 
        modal 
        header="Submit New Victim" 
        :style="{ width: '50rem' }" 
        :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
        :dismissableMask="true"
        :draggable="false"
    >
        <div v-if="submitSuccess" class="text-center py-8">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i class="pi pi-check text-4xl text-green-500"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-surface-900 dark:text-surface-0">Submission Successful!</h3>
            <p class="text-surface-600 dark:text-surface-400">Thank you for your contribution. Your submission will be reviewed by our team.</p>
        </div>
        <div v-else-if="submitError" class="text-center py-8">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i class="pi pi-times text-4xl text-red-500"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-red-600">Submission Failed</h3>
            <p class="text-surface-600 dark:text-surface-400 mb-4">{{ submitError }}</p>
            <Button label="Try Again" icon="pi pi-refresh" @click="submitError = ''" />
        </div>
        <VictimSubmissionForm v-else :submitting="submitting" @submit="handleSubmission" />
    </Dialog>
</template>
