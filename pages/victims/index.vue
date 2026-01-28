<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useVictims } from '@/composables/useVictims';
import type { Victim } from '@/types/victims';
import VictimGalleryCard from '@/components/victims/VictimGalleryCard.vue';
import VictimDetail from '@/components/victims/VictimDetail.vue';
import VictimSkeleton from '@/components/victims/VictimSkeleton.vue';
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
const route = useRoute();
const router = useRouter();

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
const showSubmitDialog = ref(false);
const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');

// Pagination
const currentPage = ref(0); // PrimeVue Paginator uses 0-based index for first
const pageSize = ref(15);



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





// Pagination -> Infinite Scroll
const itemsPerPage = 20;
const displayedCount = ref(itemsPerPage);

const displayedVictims = computed(() => {
    return filteredVictims.value.slice(0, displayedCount.value);
});

const hasMore = computed(() => {
    return displayedCount.value < filteredVictims.value.length;
});

const loadMore = () => {
    if (hasMore.value) {
        displayedCount.value += itemsPerPage;
    }
};


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
        status: selectedStatus.value
    });
    // Reset scroll position/count
    resetScroll();
};

const resetScroll = () => {
    displayedCount.value = itemsPerPage;
};





const submissionStepTitle = ref('Submit New Victim');

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
watch([searchQuery, selectedCity, selectedProvince, selectedStatus], () => {
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

// Infinite Scroll Observer
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
    loadData();
});

// Intersection Observer Logic
const connectObserver = () => {
    if (observer) observer.disconnect();
    
    if (!loadMoreSentinel.value) return;

    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading.value) {
            loadMore();
        }
    }, {
        rootMargin: '200px',
        threshold: 0.1
    });
    
    observer.observe(loadMoreSentinel.value);
};

// Re-connect whenever the sentinel element renders/changes
watch(loadMoreSentinel, (newEl) => {
    if (newEl) {
        connectObserver();
    }
});

// Ensure we clean up
onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});


// Victim Detail Modal Logic
const selectedVictimId = ref<string | null>(null);

// Sync URL query to state
watch(() => route.query.victim, (newId) => {
    selectedVictimId.value = (newId as string) || null;
}, { immediate: true });

const openVictim = (id: string) => {
    router.push({ query: { ...route.query, victim: id } });
};

const closeVictim = () => {
    const query = { ...route.query };
    delete query.victim;
    router.push({ query });
};

const showVictimDialog = computed({
    get: () => !!selectedVictimId.value,
    set: (val) => {
        if (!val) closeVictim();
    }
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
                        Documenting and honoring those who lost their lives or went missing during the Lion and Sun Revolution of Iran
                    </p>
                    
                    <!-- Stats -->
                    <div class="flex flex-wrap gap-6 mb-8">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-red-400">
                                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z" />
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

                <div class="absolute top-8 right-8 md:top-12 md:right-8">
                    <Button
                        label="Submit a Victim"
                        icon="pi pi-plus"
                        @click="showSubmitDialog = true"
                        class="hidden md:flex shadow-lg"
                    />
                </div>
            </div>
        </div>

        <!-- Filters Section -->
        <div class="sticky-trigger sticky top-0 z-40 bg-surface-0/95 dark:bg-surface-900/95 backdrop-blur-md rounded-xl border border-surface-200 dark:border-surface-700 p-5 shadow-md">
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

                </div>
            </div>





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

        <!-- Results Grid -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <VictimSkeleton v-for="i in 10" :key="i" />
        </div>

        <div v-else-if="displayedVictims.length > 0" class="space-y-8">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <VictimGalleryCard 
                    v-for="victim in displayedVictims" 
                    :key="victim.id" 
                    :victim="victim" 
                    @click="openVictim"
                />
            </div>
            
            <!-- Scroll Sentinel -->
            <div ref="loadMoreSentinel" class="h-20 flex items-center justify-center">
                <div v-if="hasMore" class="flex items-center gap-2 text-surface-500">
                    <i class="pi pi-spin pi-spinner text-xl"></i>
                    <span>Loading more...</span>
                </div>
                <div v-else-if="filteredVictims.length > itemsPerPage" class="text-surface-400 text-sm italic">
                    You've reached the end of the list
                </div>
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

        </div>
    </div>

    <!-- Submit Dialog -->
    <Dialog 
        v-model:visible="showSubmitDialog" 
        modal 
        :header="submissionStepTitle" 
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
        <VictimSubmissionForm v-else :submitting="submitting" @submit="handleSubmission" @update:step-title="submissionStepTitle = $event" />
    </Dialog>

    <!-- Victim Detail Dialog -->
    <Dialog 
        v-model:visible="showVictimDialog" 
        modal 
        :dismissableMask="true"
        :draggable="false"
        class="victim-detail-dialog bg-surface-0 dark:bg-surface-900"
        :style="{ width: '50rem', maxWidth: '95vw', borderRadius: '1.5rem', overflow: 'hidden' }"
        :breakpoints="{ '960px': '90vw', '640px': '98vw' }"
        :showHeader="false"
        :contentStyle="{ padding: '0', borderRadius: '1.5rem' }"
    >
        <div class="relative">
            <Button 
                icon="pi pi-times" 
                text 
                rounded 
                severity="secondary" 
                @click="showVictimDialog = false" 
                class="absolute top-4 right-4 z-50 !bg-surface-900/10 dark:!bg-surface-0/10 hover:!bg-surface-900/20 dark:hover:!bg-surface-0/20 !text-surface-900 dark:!text-surface-0 backdrop-blur-sm w-10 h-10 !p-0 flex items-center justify-center transition-all duration-200"
            />
            <VictimDetail 
                v-if="selectedVictimId" 
                :victim-id="selectedVictimId" 
                :headless="true"
            />
        </div>
    </Dialog>
</template>
