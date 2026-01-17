<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-center justify-between bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
      <div class="flex flex-wrap gap-2">
         <span class="text-sm font-semibold self-center mr-2 text-surface-600 dark:text-surface-400">Filter:</span>
         <Button 
            v-for="type in types" 
            :key="type" 
            :label="type.charAt(0).toUpperCase() + type.slice(1)" 
            :severity="selectedType === type ? 'primary' : 'secondary'" 
            size="small"
            rounded
            variant="outlined"
            @click="selectedType = selectedType === type ? null : type"
            class="capitalize"
         />
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in filteredEvidence" :key="item.id" :id="`evidence-${item.id}`" class="flex flex-col group h-full">
        <div 
            class="bg-surface-0 dark:bg-surface-900 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            :class="{'ring-2 ring-red-500/50': isSensitive(item)}"
        >
            <!-- Media Preview -->
            <div class="relative h-48 bg-surface-100 dark:bg-surface-800 overflow-hidden cursor-pointer group-inner" @click="openMedia(item)">
                <!-- Sensitive Overlay -->
                <div 
                    v-if="isSensitive(item)"
                    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center backdrop-blur-md bg-surface-900/60 transition-all duration-300 group-inner-hover:backdrop-blur-sm"
                >
                    <i class="pi pi-exclamation-triangle text-3xl mb-2 text-red-500"></i>
                    <span class="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-900/30 px-2 py-1 rounded">Sensitive Content</span>
                </div>
                
                <!-- Helper Overlay when NOT sensitive or hovered -->
                <div 
                    v-else 
                    class="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-inner-hover:bg-black/20 transition-colors"
                >
                    <div class="opacity-0 group-inner-hover:opacity-100 transform translate-y-4 group-inner-hover:translate-y-0 transition-all duration-300">
                        <Button icon="pi pi-eye" rounded severity="contrast" />
                    </div>
                </div>

                <!-- Media Content -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <img v-if="item.type === 'image'" :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover" loading="lazy" />
                    <video v-else-if="item.type === 'video'" :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover" preload="metadata"></video>
                    <i v-else :class="getTypeIcon(item.type)" class="text-6xl text-surface-300 dark:text-surface-700"></i>
                </div>
                
                <!-- Type Badge -->
                <div class="absolute top-2 right-2 z-20">
                    <Badge :icon="getTypeIcon(item.type)" :value="item.type" severity="secondary" class="shadow-sm" />
                </div>
            </div>

            <!-- Content -->
            <div class="p-4 flex-1 flex flex-col">
                <div class="mb-3">
                    <h3 class="font-semibold text-lg leading-tight text-surface-900 dark:text-surface-0 mb-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" @click="openMedia(item)">
                        {{ item.title }}
                    </h3>
                    <div class="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                        <i class="pi pi-calendar"></i>
                        <span>{{ formatDate(item.captured_at) }}</span>
                    </div>
                </div>

                <p class="text-sm text-surface-600 dark:text-surface-300 mb-4 line-clamp-3 flex-1">{{ item.description }}</p>

                <!-- Footer / Meta -->
                <div class="pt-3 border-t border-surface-100 dark:border-surface-800 text-xs space-y-2">
                     <div class="flex justify-between text-surface-500">
                        <span>Source:</span>
                         <span class="font-medium text-surface-700 dark:text-surface-200 truncate max-w-[150px]">{{ item.provenance.submitted_by || 'Unknown' }}</span>
                     </div>
                     <div class="flex gap-1" v-if="item.flags.length">
                         <Tag v-for="flag in item.flags" :key="flag" :value="flag" severity="warning" class="text-[10px] py-0.5 h-auto" />
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    
    <div v-if="filteredEvidence.length === 0" class="flex flex-col items-center justify-center py-12 text-surface-500 bg-surface-50 dark:bg-surface-900 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700">
        <i class="pi pi-filter-slash text-4xl mb-3 opacity-50"></i>
        <p>No evidence matches your filter criteria.</p>
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
        :pt="{
            root: { class: 'bg-surface-0 dark:bg-surface-900' },
            header: { class: 'bg-surface-0 dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800' },
            content: { class: 'p-0 bg-black' },
            footer: { class: 'bg-surface-0 dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800' }
        }"
    >
        <div v-if="selectedEvidence" class="flex flex-col items-center justify-center min-h-[400px] bg-black">
            <template v-if="selectedEvidence.type === 'image'">
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
                 <div class="p-10 text-center text-white/70">
                    <i :class="getTypeIcon(selectedEvidence.type)" class="text-6xl mb-4"></i>
                    <p>This content cannot be previewed directly.</p>
                 </div>
            </template>
        </div>
        <template #footer>
            <div class="flex justify-between items-center w-full py-2">
                 <div class="text-sm text-surface-500 dark:text-surface-400 max-w-full truncate">
                    {{ selectedEvidence?.description }}
                 </div>
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

const types: EvidenceType[] = ['video', 'image', 'document'];
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
        case 'image': return 'pi pi-image';
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
