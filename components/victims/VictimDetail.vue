<script setup lang="ts">
import { useVictims } from '@/composables/useVictims';
import { useIncidents } from '@/composables/useIncidents';
import VictimPhoto from '@/components/victims/VictimPhoto.vue';
import VictimStatusBadge from '@/components/victims/VictimStatusBadge.vue';
import VictimSources from '@/components/victims/VictimSources.vue';
import PosterGeneratorModal from '@/components/victims/PosterGeneratorModal.vue';
import { formatDate } from '@/utils/formatters';
import MarkdownIt from 'markdown-it';
import { getMediaUrl } from '~/utils/mediaUrl';
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePersianNumbers } from '@/composables/usePersianNumbers';

const props = defineProps<{
    victimId: string;
    headless?: boolean;
}>();

const { t, locale } = useI18n();
const { pn } = usePersianNumbers();

const copied = ref(false);
const showPosterModal = ref(false);
const selectedPhotoIndex = ref(0);

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
});

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return md.render(text);
};

const { getVictimById } = useVictims();
const { getIncidentById } = useIncidents();

// Use async data to fetch server/client side compatible
// We watch props.victimId to refetch if it changes
const { data: victim, error, refresh, status } = useAsyncData(`victim-${props.victimId}`, async () => {
    const v = await getVictimById(props.victimId);
    if (!v) return null;

    // Fetch full incident details for display
    const enrichedIncidents = [];
    if (v.incident_ids && v.incident_ids.length > 0) {
        for (const incId of v.incident_ids) {
            const inc = await getIncidentById(incId);
            if (inc) {
                enrichedIncidents.push({
                    id: inc.id,
                    title: inc.title
                });
            } else {
                 enrichedIncidents.push({
                    id: incId,
                    title: incId // Fallback to ID if not found
                 });
            }
        }
    }
    
    return {
        ...v,
        enrichedIncidents
    };
}, {
    watch: [() => props.victimId]
});

// Reset photo selection when victim changes
watch(() => props.victimId, () => {
    selectedPhotoIndex.value = 0;
});

// Computed for current photo
const currentPhoto = computed(() => {
    if (!victim.value?.photos || victim.value.photos.length === 0) {
        return victim.value?.photo;
    }
    return victim.value.photos[selectedPhotoIndex.value];
});

const hasGallery = computed(() => {
    return victim.value?.photos && victim.value.photos.length > 1;
});

// Formatted dates
const formattedDeathDate = computed(() => {
    if (!victim.value?.date_of_death) return t('victimDetail.unknown');
    const date = formatDate(victim.value.date_of_death, locale.value);
    const precision = victim.value.date_of_death_precision;
    return precision === 'Approximate' ? `~${date}` : date;
});

const formattedBirthDate = computed(() => {
    if (!victim.value?.birth_date) return null;
    return formatDate(victim.value.birth_date, locale.value);
});

// Location string
const incidentLocation = computed(() => {
    const parts = [];
    if (victim.value?.incident_address) parts.push(victim.value.incident_address);
    if (victim.value?.incident_city) parts.push(victim.value.incident_city);
    if (victim.value?.incident_province) {
        // Translate province if possible
        const translatedProvince = t(`provinces.${victim.value.incident_province}`, victim.value.incident_province);
        parts.push(translatedProvince);
    }
    if (victim.value?.country) parts.push(victim.value.country);
    return parts.join(', ') || t('victimDetail.unknown');
});

const birthLocation = computed(() => {
    const parts = [];
    if (victim.value?.birth_city) parts.push(victim.value.birth_city);
    if (victim.value?.birth_province) {
        const translatedProvince = t(`provinces.${victim.value.birth_province}`, victim.value.birth_province);
        parts.push(translatedProvince);
    }
    return parts.join(', ') || null;
});

// X (Twitter) Share Logic
const xShareUrl = computed(() => {
    if (!victim.value?.name) return '';
    
    const nameHashtag = victim.value.name.replace(/\s+/g, '_');
    const text = `#IranMassacre #${nameHashtag}`;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    
    return url;
});

// Copy Link Logic
const copyLink = () => {
    if (typeof window !== 'undefined') {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    }
};

// Head Management (SEO)
if (!props.headless) {
    useHead({
        title: computed(() => victim.value ? `${victim.value.name} — ${t('common.victims')}` : t('victimDetail.notFoundTitle')),
        meta: [
            { name: 'description', content: computed(() => victim.value?.description || t('victimDetail.notFoundDescription')) }
        ]
    });
}
import VictimSubmissionForm from '@/components/submissions/VictimSubmissionForm.vue';
import { initUpload, uploadToR2, completeSubmission } from '~/utils/submissionsClient';
import type { UploadedFileInfo } from '~/utils/submissionsClient';
import Dialog from 'primevue/dialog';

// Update Logic
const showUpdateDialog = ref(false);
const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');
const submissionStepTitle = ref(t('victimsPage.submitDialogTitle')); // Reusing key for simplicity or add new one

const handleUpdateSubmission = async (payload: any) => {
    submitting.value = true;
    submitError.value = '';
    submitSuccess.value = false;

    try {
        const { kind, data, files, turnstileToken } = payload;
        
        const fileInfos = files ? await Promise.all(
            files.map(async (file: File) => ({
                name: file.name,
                size: file.size,
                mime: file.type,
                sha256: ''
            }))
        ) : [];

        const initResponse = await initUpload({
            turnstileToken,
            files: fileInfos,
            kind
        });

        const uploadedFiles: UploadedFileInfo[] = [];
        if (files) {
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
            showUpdateDialog.value = false;
            submitSuccess.value = false;
        }, 3000);
    } catch (error) {
        submitError.value = error instanceof Error ? error.message : 'Update failed';
    } finally {
        submitting.value = false;
    }
};
</script>

<template>
    <div>
        <!-- Loading -->
        <div v-if="status === 'pending'" class="flex justify-center items-center py-20">
            <i class="pi pi-spin pi-spinner text-4xl text-surface-400"></i>
        </div>

        <!-- Not Found -->
        <div v-else-if="!victim" class="text-center py-10">
            <h1 class="text-3xl font-bold mb-4">{{ t('victimDetail.notFoundTitle') }}</h1>
            <p class="text-surface-500 mb-8">{{ t('victimDetail.notFoundDescription') }}</p>
        </div>

        <!-- Content -->
        <div v-else class="flex flex-col">
            
            <!-- Hero / Photo Section -->
            <div class="relative w-full bg-surface-100 dark:bg-surface-950 flex justify-center group flex-col items-center">
                <!-- blurred background -->
                <div class="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20 pointer-events-none transition-opacity duration-700">
                     <img 
                        v-if="currentPhoto"
                        :key="currentPhoto"
                        :src="getMediaUrl({ kind: 'victim_photo', relativePath: currentPhoto })" 
                        class="w-full h-full object-cover blur-3xl scale-110 transition-all duration-700" 
                        alt="" 
                    />
                     <div class="absolute inset-0 bg-gradient-to-b from-transparent to-surface-0 dark:to-surface-900"></div>
                </div>

                <!-- Update Button (Top Left) -->
                <div class="absolute top-4 left-4 z-30">
                    <Button 
                        icon="pi pi-pencil" 
                        :label="t('common.update') || 'Update'" 
                        rounded 
                        severity="secondary" 
                        class="!bg-surface-0/50 dark:!bg-surface-900/50 backdrop-blur-md !border-surface-200 dark:!border-surface-700 !text-surface-900 dark:!text-surface-0 shadow-lg hover:!bg-surface-0 dark:hover:!bg-surface-900 transition-all"
                        @click="showUpdateDialog = true"
                    />
                </div>

                <div class="relative py-8 md:py-10 px-6 w-full max-w-lg mx-auto z-10 flex flex-col items-center">
                    <VictimPhoto 
                        :src="currentPhoto" 
                        :alt="victim.name" 
                        aspect="square"
                        size="xl"
                        class="shadow-2xl rounded-2xl w-full aspect-[4/5] object-cover ring-1 ring-surface-900/5 dark:ring-surface-0/10 transition-all duration-500"
                    />

                    <!-- Gallery Thumbnails -->
                    <div 
                        v-if="hasGallery" 
                        class="mt-6 flex gap-3 overflow-x-auto max-w-full pb-2 px-2 snap-x"
                    >
                        <button
                            v-for="(photo, index) in victim.photos"
                            :key="photo"
                            @click="selectedPhotoIndex = index"
                            class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ring-2 snap-center focus:outline-none"
                            :class="[ selectedPhotoIndex === index ? 'ring-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'ring-transparent opacity-60 hover:opacity-100 hover:scale-105' ]"
                        >
                            <VictimPhoto 
                                :src="photo" 
                                :alt="`${victim.name} ${index + 1}`" 
                                aspect="square"
                                class="w-full h-full object-cover"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Details Section -->
            <div class="relative px-6 pb-10 md:px-10 -mt-6 z-20">
                <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-100 dark:border-surface-800 p-6 md:p-10 max-w-4xl mx-auto">
                    
                    <!-- Header -->
                    <div class="text-center mb-10">
                        <div class="flex justify-center mb-4">
                            <VictimStatusBadge :status="victim.status" class="!px-4 !py-1.5 !text-sm !rounded-full" />
                        </div>
                        
                        <h1 class="text-3xl md:text-5xl font-black text-surface-900 dark:text-surface-0 tracking-tight leading-tight mb-2">
                            {{ victim.name }}
                        </h1>
                        <h2 v-if="victim.persian_name" class="text-xl md:text-2xl font-bold text-surface-500 dark:text-surface-400 font-fa mb-4" dir="rtl">
                            {{ victim.persian_name }}
                        </h2>
                        
                        <div class="flex flex-wrap items-center justify-center gap-2 text-surface-500 dark:text-surface-400 font-medium text-lg">
                            <span v-if="victim.age">{{ pn(victim.age) }} {{ t('victimDetail.yearsOld') }}</span>
                            <span v-if="victim.age && victim.occupation" class="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                            <span v-if="victim.occupation">{{ victim.occupation }}</span>
                            <span v-if="(victim.age || victim.occupation) && incidentLocation" class="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                            <span>{{ incidentLocation }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-center gap-3 mb-10">
                         <a 
                            :href="xShareUrl" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="no-underline"
                        >
                            <Button rounded class="!bg-black dark:!bg-white !text-white dark:!text-black !border-none !font-bold !px-6">
                                <i class="pi pi-twitter text-lg mr-2"></i>
                                {{ t('victimDetail.shareStory') }}
                            </Button>
                        </a>
                        <Button 
                            :icon="copied ? 'pi pi-check' : 'pi pi-link'" 
                            :label="copied ? t('victimDetail.copied') : ''"
                            rounded 
                            outlined 
                            :severity="copied ? 'success' : 'secondary'"
                            class="!border-surface-200 dark:!border-surface-700 !text-surface-600 dark:!text-surface-300" 
                            @click="copyLink"
                        />
                         <Button 
                            icon="pi pi-image" 
                            :label="t('victimDetail.createPoster') || 'Create Poster'"
                            rounded 
                            outlined 
                            severity="help"
                            class="!border-purple-200 dark:!border-purple-800 !text-purple-600 dark:!text-purple-300 hover:!bg-purple-50 dark:hover:!bg-purple-900/20" 
                            @click="showPosterModal = true"
                        />
                    </div>


                    <!-- Info Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10">
                        <!-- Key Dates -->
                        <div class="space-y-6">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">{{ t('victimDetail.timeline') }}</h3>
                            
                            <div class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-calendar-times text-red-500 dark:text-red-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">{{ t('victimDetail.dateOfIncident') }}</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ formattedDeathDate }}</p>
                                </div>
                            </div>

                             <div v-if="formattedBirthDate" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-calendar text-blue-500 dark:text-blue-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">{{ t('victimDetail.dateOfBirth') }}</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ formattedBirthDate }}</p>
                                </div>
                            </div>
                        </div>

                         <!-- Key Details -->
                        <div class="space-y-6">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">{{ t('victimDetail.details') }}</h3>
                            
                            <div v-if="victim.cause_of_death && victim.status === 'Killed'" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-heart-fill text-surface-600 dark:text-surface-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">{{ t('victimDetail.causeOfDeath') }}</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0 leading-tight">{{ victim.cause_of_death }}</p>
                                </div>
                            </div>

                             <div v-if="victim.disappearance_circumstances && victim.status === 'Missing'" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-question text-orange-500 dark:text-orange-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">{{ t('victimDetail.circumstances') }}</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0 leading-tight">{{ victim.disappearance_circumstances }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bio -->
                    <div v-if="victim.description" class="mb-10">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">{{ t('victimDetail.story') }}</h3>
                        <div class="prose prose-lg dark:prose-invert max-w-none text-surface-700 dark:text-surface-300 leading-relaxed">
                             <div v-html="renderMarkdown(victim.description)"></div>
                        </div>
                    </div>

                    <!-- Footer Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-surface-100 dark:border-surface-800">
                         <!-- Linked Incidents -->
                        <div v-if="victim.incident_ids && victim.incident_ids.length > 0">
                             <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0 mb-3">{{ t('victimDetail.linkedIncidents') }}</h4>
                             <div class="flex flex-wrap gap-2">
                                <NuxtLink 
                                    v-for="inc in victim.enrichedIncidents" 
                                    :key="inc.id"
                                    :to="`/incidents/${inc.id}`" 
                                    class="no-underline"
                                >
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                                        <i class="pi pi-link text-xs"></i>
                                        {{ inc.title }}
                                    </span>
                                </NuxtLink>
                            </div>
                        </div>

                        <!-- Sources -->
                        <div>
                            <VictimSources 
                                :sources="victim.source"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

      <!-- Update Dialog -->
    <Dialog 
        v-model:visible="showUpdateDialog" 
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
        <VictimSubmissionForm 
            v-else 
            :submitting="submitting" 
            :initial-data="victim"
            @submit="handleUpdateSubmission" 
            @update:step-title="submissionStepTitle = $event" 
        />
    </Dialog>

    <!-- Poster Generator Modal -->
    <PosterGeneratorModal 
        v-if="victim" 
        v-model:visible="showPosterModal" 
        :victim="victim" 
    />
</template>
