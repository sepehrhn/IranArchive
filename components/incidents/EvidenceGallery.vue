<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-surface-900 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
      <div class="flex flex-wrap gap-2">
         <span class="text-sm font-semibold self-center mr-2">Filter:</span>
         <Button 
            v-for="type in types" 
            :key="type" 
            :label="type.charAt(0).toUpperCase() + type.slice(1)" 
            :severity="selectedType === type ? 'primary' : 'secondary'" 
            size="small"
            rounded
            @click="selectedType = selectedType === type ? null : type"
         />
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in filteredEvidence" :key="item.id" :id="`evidence-${item.id}`" class="flex flex-col group">
        <Card class="flex-1 overflow-hidden" :class="{'border-red-500 border relative': isSensitive(item)}">
            <template #header>
                <div class="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer" @click="openMedia(item)">
                    <!-- Blur filter for sensitive content -->
                    <div 
                        class="absolute inset-0 z-10 transition-all duration-300 flex items-center justify-center p-4 text-center"
                        :class="[isSensitive(item) ? 'backdrop-blur-xl bg-gray-900/40 hover:backdrop-blur-sm' : '']"
                    >
                         <div v-if="isSensitive(item)" class="text-white drop-shadow-md">
                            <i class="pi pi-exclamation-triangle text-3xl mb-1 text-red-500"></i>
                            <div class="font-bold uppercase tracking-wider text-sm mt-1 bg-red-600 px-2 py-0.5 rounded text-white inline-block">Sensitive Content</div>
                        </div>
                        
                        <div v-if="!isSensitive(item)" class="text-center text-gray-500 group-hover:scale-110 transition-transform">
                             <i :class="getTypeIcon(item.type)" class="text-4xl mb-2"></i>
                            <div class="text-xs uppercase tracking-wider p-2">{{ item.type }}</div>
                        </div>
                    </div>

                    <!-- Underlying Content (Placeholder) -->
                     <!-- Content Display -->
                     <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                        <template v-if="item.type === 'video' || item.type === 'photo'">
                             <img v-if="item.type === 'photo'" :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover" />
                             <!-- For video thumbnail we could try to load it or just show icon -->
                             <video v-else-if="item.type === 'video'" :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover" preload="metadata"></video>
                             <i v-else :class="getTypeIcon(item.type)" class="text-6xl text-gray-300 dark:text-gray-700"></i>
                        </template>
                        <i v-else :class="getTypeIcon(item.type)" class="text-6xl text-gray-300 dark:text-gray-700"></i>
                     </div>
                </div>
            </template>
            <template #title>
                <div class="flex justify-between items-start gap-2">
                    <span class="text-lg leading-tight cursor-pointer hover:text-primary-500" @click="openMedia(item)">{{ item.title }}</span>
                </div>
            </template>
            <template #subtitle>
                <span class="text-xs">{{ formatDate(item.captured_at) }}</span>
            </template>
            <template #content>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{{ item.description }}</p>
                
                <div class="space-y-4">
                     <!-- Media Source -->
                     <!-- REMOVED DOWNLOAD LINK -->

                     <Divider />

                    <!-- Collapsible Details -->
                    <Accordion value="" class="text-sm">
                        <AccordionPanel value="details">
                            <AccordionHeader>Provenance & Technical</AccordionHeader>
                            <AccordionContent>
                                <div class="space-y-2 text-xs">
                                    <div v-if="item.provenance.first_published_at">
                                        <span class="text-gray-500 block">First Published:</span>
                                        {{ formatDateTime(item.provenance.first_published_at) }}
                                    </div>
                                    <div v-if="item.provenance.submitted_by">
                                        <span class="text-gray-500 block">Submitted By:</span>
                                        {{ item.provenance.submitted_by }}
                                    </div>
                                    <div v-if="item.technical.sha256">
                                        <span class="text-gray-500 block">SHA256:</span>
                                        <span class="font-mono break-all text-[10px]">{{ item.technical.sha256 }}</span>
                                    </div>
                                    <div v-if="item.flags.length" class="mt-2">
                                        <span class="text-gray-500 block mb-1">Analyst Flags:</span>
                                         <div class="flex flex-wrap gap-1">
                                             <Tag v-for="flag in item.flags" :key="flag" :value="flag" severity="warn" class="text-[10px]" />
                                         </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </template>
        </Card>
      </div>
    </div>
    
    <div v-if="filteredEvidence.length === 0" class="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
        No evidence matches your filter criteria.
    </div>

    <!-- Media Modal -->
    <Dialog 
        v-model:visible="displayModal" 
        modal 
        :header="selectedEvidence?.title" 
        :style="{ width: '80vw', maxWidth: '1000px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
        class="media-modal"
    >
        <div v-if="selectedEvidence" class="flex flex-col items-center justify-center p-0 overflow-hidden bg-black rounded-lg">
            <template v-if="selectedEvidence.type === 'photo'">
                <img :src="getEvidenceUrl(selectedEvidence.file_path)" :alt="selectedEvidence.title" class="max-w-full max-h-[70vh] object-contain" @contextmenu.prevent />
            </template>
            <template v-else-if="selectedEvidence.type === 'video'">
                <video 
                    :src="getEvidenceUrl(selectedEvidence.file_path)" 
                    controls 
                    controlsList="nodownload" 
                    class="max-w-full max-h-[70vh]" 
                    autoplay
                    @contextmenu.prevent
                ></video>
            </template>
            <template v-else>
                 <div class="p-10 text-center text-white">
                    <i :class="getTypeIcon(selectedEvidence.type)" class="text-6xl mb-4"></i>
                    <p>This content cannot be previewed directly.</p>
                 </div>
            </template>
        </div>
        <template #footer>
            <div class="flex justify-between items-center w-full">
                 <div class="text-sm text-gray-500">
                    {{ selectedEvidence?.description }}
                 </div>
                 <!-- No download button -->
            </div>
        </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { type Evidence, type EvidenceType } from '~/types/incident';
import { formatDate, formatDateTime } from '~/utils/formatters';

const props = defineProps<{
  evidence: Evidence[];
}>();

const config = useRuntimeConfig();
const getEvidenceUrl = (path: string) => {
    // Ensure base URL is handled correctly
    const baseUrl = config.app.baseURL.endsWith('/') ? config.app.baseURL : `${config.app.baseURL}/`;
    return `${baseUrl}evidences/${path}`;
};

const types: EvidenceType[] = ['video', 'photo', 'document'];
const selectedType = ref<EvidenceType | null>(null);

const displayModal = ref(false);
const selectedEvidence = ref<Evidence | null>(null);

const filteredEvidence = computed(() => {
    return props.evidence.filter(item => {
        if (selectedType.value && item.type !== selectedType.value) return false;
        return true;
    });
});

const isSensitive = (item: Evidence) => {
    return item.content_warning === 'graphic' || item.content_warning === 'violence';
};

const getTypeIcon = (type: EvidenceType) => {
    switch (type) {
        case 'video': return 'pi pi-video';
        case 'photo': return 'pi pi-image';
        case 'document': return 'pi pi-file';
        default: return 'pi pi-file';
    }
};

const openMedia = (item: Evidence) => {
    selectedEvidence.value = item;
    displayModal.value = true;
};
</script>

<style scoped>
/* Prevent image selection */
img, video {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    user-select: none;
}
</style>
