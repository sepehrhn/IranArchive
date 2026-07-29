<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
const { t } = useI18n();
import { useVictims } from '@/composables/useVictims';
import { usePersianNumbers } from '@/composables/usePersianNumbers';
const { pn } = usePersianNumbers();
import type { Victim } from '@/types/victims';
import VictimGalleryCard from '@/components/victims/VictimGalleryCard.vue';
import VictimDetail from '@/components/victims/VictimDetail.vue';
import VictimSkeleton from '@/components/victims/VictimSkeleton.vue';
import VictimSubmissionForm from '~/components/submissions/VictimSubmissionForm.vue';
import PosterGeneratorModal from '@/components/victims/PosterGeneratorModal.vue';
import { initUpload, uploadToR2, completeSubmission } from '~/utils/submissionsClient';

import type { UploadedFileInfo } from '~/utils/submissionsClient';
import { useStickyHeader } from '~/composables/useStickyHeader';

const { headerOffset, headerHeight, isMobile, registerStickyTrigger } = useStickyHeader()

const filterBarRef = ref<HTMLElement | null>(null)

useSeoMeta({
    title: t('victimsPage.title'),
    ogTitle: t('victimsPage.title'),
    description: t('victimsPage.description'),
    ogDescription: t('victimsPage.description'),
    ogImage: 'https://iranarchive.com/og-image-victims.jpg',
    twitterCard: 'summary_large_image',
})

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
const selectedStatus = ref<string>('Killed');
const selectedCategory = ref<string>();
const showSubmitDialog = ref(false);
const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');

// Poster Generator
const showPosterModal = ref(false);
const selectedPosterVictim = ref<Victim | null>(null);

// Pagination
const currentPage = ref(0); // PrimeVue Paginator uses 0-based index for first
const pageSize = ref(15);



const statusOptions = computed(() => [
    { label: t('victimsPage.killed'), value: 'Killed' },
    { label: t('victimsPage.missing'), value: 'Missing' }
]);

const provinceOptions = computed(() => {
    return allProvinces.value.map(p => ({
        label: t(`provinces.${p}`, p),
        value: p
    }));
});

// Computed: Cities filtered by selected province
const availableCities = computed(() => {
    if (selectedProvince.value && provinceCityMap.value[selectedProvince.value]) {
        return provinceCityMap.value[selectedProvince.value];
    }
    return []; // Return empty if no province selected
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

        status: selectedStatus.value,
        category: selectedCategory.value
    });
    // Reset scroll position/count
    resetScroll();
};

const resetScroll = () => {
    displayedCount.value = itemsPerPage;
};





const submissionStepTitle = ref(t('victimsPage.submitDialogTitle'));

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

const categoryOptions = computed(() => {
    const totalMale = allVictims.value.filter(v => v.gender?.toLowerCase() === 'male').length;
    const totalFemale = allVictims.value.filter(v => v.gender?.toLowerCase() === 'female').length;
    const totalChild = allVictims.value.filter(v => v.child === true).length;

    return [
        { label: `${t('victimsPage.male')} (${pn(totalMale)})`, value: 'Male' },
        { label: `${t('victimsPage.female')} (${pn(totalFemale)})`, value: 'Female' },
        { label: `${t('victimsPage.children')} (${pn(totalChild)})`, value: 'Child' }
    ];
});

// Watchers
watch([searchQuery, selectedCity, selectedProvince, selectedStatus, selectedCategory], () => {
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

    if (filterBarRef.value) {
        registerStickyTrigger(filterBarRef.value)
    }
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
    if (observer) {
        observer.disconnect();
    }
    // No explicit reset needed
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

const showMobileFilters = ref(false);

const activeFilterCount = computed(() => {
    let count = 0;
    if (selectedProvince.value) count++;
    if (selectedCity.value) count++;
    if (selectedCategory.value) count++;
    return count;
});

const showVictimDialog = computed({
    get: () => !!selectedVictimId.value,
    set: (val) => {
        if (!val) closeVictim();
    }
});

const openPosterGenerator = (victim: Victim) => {
    selectedPosterVictim.value = victim;
    showPosterModal.value = true;
};
</script>

<template>
    <div class="space-y-6">
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 rounded-2xl overflow-hidden">
            <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
            <div class="relative px-8 py-10 md:py-12">
                <div class="max-w-3xl">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                        {{ t('victimsPage.heroTitle') }}
                    </h1>
                    <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                        {{ t('victimsPage.heroSubtitle') }}
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
                                <p class="text-3xl font-bold text-white">
                                    <Skeleton v-if="loading" width="2rem" height="2.5rem" class="!bg-white/20" />
                                    <span v-else>{{ pn(killedCount) }}</span>
                                </p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">{{ t('victimsPage.killed') }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <i class="pi pi-search text-orange-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white">
                                    <Skeleton v-if="loading" width="2rem" height="2.5rem" class="!bg-white/20" />
                                    <span v-else>{{ pn(missingCount) }}</span>
                                </p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">{{ t('victimsPage.missing') }}</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="absolute top-8 right-8 md:top-12 md:right-8">
                    <Button
                        :label="t('victimsPage.submit')"
                        icon="pi pi-plus"
                        @click="showSubmitDialog = true"
                        class="hidden md:flex shadow-lg"
                    />
                </div>
            </div>
        </div>

        <!-- Filters Section (Sticky only on desktop) -->
        <div 
            ref="filterBarRef"
            class="z-40 px-4 md:px-0 transition-all duration-300"
            :class="isMobile ? 'relative mb-6' : 'sticky-trigger sticky'"
            :style="{ top: (isMobile ? 0 : headerOffset) + 'px' }"
        >
            <div class="w-full mx-auto bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-xl rounded-2xl border border-surface-200/50 dark:border-surface-700/50 shadow-xl shadow-surface-900/5 overflow-hidden transition-all duration-300">
                
                <!-- Desktop Unified Bar -->
                <div class="flex flex-col md:flex-row">
                    <!-- Killed/Missing Tabs (Segmented Control style) -->
                    <div class="p-2 md:pr-0 flex-shrink-0">
                        <div class="bg-surface-100 dark:bg-surface-800 p-1 rounded-xl inline-flex w-full md:w-auto h-full items-center">
                            <button 
                                v-for="status in statusOptions" 
                                :key="status.value"
                                @click="selectedStatus = status.value"
                                class="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out"
                                :class="[
                                    selectedStatus === status.value 
                                        ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                                        : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-200/50 dark:hover:bg-surface-700/50'
                                ]"
                            >
                                {{ status.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="hidden md:block w-px bg-surface-200 dark:bg-surface-700 my-3 mx-2"></div>

                    <!-- Search Input -->
                    <div class="flex-1 relative group border-t md:border-t-0 border-surface-200 dark:border-surface-700">
                        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 group-hover:text-primary-500 transition-colors"></i>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            :placeholder="t('victimsPage.searchPlaceholder')"
                            class="w-full h-full bg-transparent border-none outline-none pl-11 pr-4 py-4 text-surface-900 dark:text-surface-0 placeholder:text-surface-400 focus:ring-0 text-base"
                        />
                    </div>

                    <!-- Mobile Filter Toggle -->
                    <div class="md:hidden flex border-t border-surface-200 dark:border-surface-700">
                        <button 
                            @click="showMobileFilters = !showMobileFilters" 
                            class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                        >
                            <i class="pi" :class="showMobileFilters ? 'pi-chevron-up' : 'pi-filter'"></i>
                            {{ showMobileFilters ? t('victimsPage.hideFilters') : t('victimsPage.showFilters') }}
                            <Badge v-if="activeFilterCount > 0" :value="pn(activeFilterCount)" size="small" severity="primary" />
                        </button>
                    </div>

                    <!-- Desktop Filters (Integrated) -->
                    <div class="hidden md:flex items-center gap-2 pr-2">
                        <div class="w-px bg-surface-200 dark:bg-surface-700 h-8 self-center mx-1"></div>
                        
                        <Select 
                            v-model="selectedProvince" 
                            :options="provinceOptions" 
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="t('victimsPage.filterProvince')" 
                            showClear 
                            class="w-36 !border-0 !bg-transparent !shadow-none"
                            :pt="{
                                root: { class: 'hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors' },
                                input: { class: '!py-2 !px-3 font-medium text-sm' }
                            }"
                        />
                        
                        <Select 
                            v-model="selectedCity" 
                            :options="availableCities" 
                            :placeholder="t('victimsPage.filterCity')" 
                            showClear 
                            class="w-36 !border-0 !bg-transparent !shadow-none"
                            :disabled="!selectedProvince"
                            :pt="{
                                root: { class: (!selectedProvince ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-100 dark:hover:bg-surface-800') + ' rounded-lg transition-colors' },
                                input: { class: '!py-2 !px-3 font-medium text-sm' }
                            }"
                        />

                        <!-- Category Tags -->
                        <div class="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-1 ml-2">
                            <button 
                                v-for="cat in categoryOptions"
                                :key="cat.value"
                                @click="selectedCategory === cat.value ? selectedCategory = undefined : selectedCategory = cat.value"
                                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-white dark:hover:bg-surface-700 whitespace-nowrap"
                                :class="{ '!bg-white dark:!bg-surface-600 !text-primary-600 dark:!text-primary-300 shadow-sm': selectedCategory === cat.value }"
                            >
                                {{ cat.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Expanded Filters -->
                <div v-show="showMobileFilters" class="md:hidden border-t border-surface-200 dark:border-surface-700 p-4 bg-surface-50/50 dark:bg-surface-900/50 space-y-4 animate-fade-in-down">
                    <Select 
                        v-model="selectedProvince" 
                        :options="provinceOptions" 
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="t('victimsPage.filterProvince')" 
                        showClear 
                        class="w-full"
                    />
                    <Select 
                        v-model="selectedCity" 
                        :options="availableCities" 
                        :placeholder="t('victimsPage.filterCity')" 
                        showClear 
                        class="w-full"
                        :class="{ 'opacity-50 cursor-not-allowed': !selectedProvince }"
                        :disabled="!selectedProvince"
                    />
                    <SelectButton 
                        v-model="selectedCategory" 
                        :options="categoryOptions" 
                        optionLabel="label"
                        optionValue="value"
                        :allowEmpty="true"
                        class="w-full"
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
                    @create-poster="openPosterGenerator"
                />
            </div>
            
            <!-- Scroll Sentinel -->
            <div ref="loadMoreSentinel" class="h-20 flex items-center justify-center">
                <div v-if="hasMore" class="flex items-center gap-2 text-surface-500">
                    <i class="pi pi-spin pi-spinner text-xl"></i>
                    <span>{{ t('victimsPage.loadingMore') }}</span>
                </div>
                <div v-else-if="filteredVictims.length > itemsPerPage" class="text-surface-400 text-sm italic">
                    {{ t('victimsPage.endOfList') }}
                </div>
            </div>
        </div>


        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-surface-50 dark:bg-surface-900 rounded-2xl border-2 border-dashed border-surface-300 dark:border-surface-700">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
                <i class="pi pi-search text-3xl text-surface-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">{{ t('victimsPage.emptyTitle') }}</h3>
            <p class="text-surface-500 mb-6 max-w-md mx-auto">
                {{ t('victimsPage.emptyDescription') }}
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
            <h3 class="text-2xl font-bold mb-2 text-surface-900 dark:text-surface-0">{{ t('victimsPage.successTitle') }}</h3>
            <p class="text-surface-600 dark:text-surface-400">{{ t('victimsPage.successMessage') }}</p>
        </div>
        <div v-else-if="submitError" class="text-center py-8">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i class="pi pi-times text-4xl text-red-500"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-red-600">{{ t('victimsPage.failedTitle') }}</h3>
            <p class="text-surface-600 dark:text-surface-400 mb-4">{{ submitError }}</p>
            <Button :label="t('victimsPage.tryAgain')" icon="pi pi-refresh" @click="submitError = ''" />
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

    <!-- Poster Generator Quick Access -->
    <PosterGeneratorModal 
        v-if="selectedPosterVictim" 
        v-model:visible="showPosterModal" 
        :victim="selectedPosterVictim" 
    />
</template>
