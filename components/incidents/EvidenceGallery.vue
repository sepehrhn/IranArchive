<template>
  <div class="space-y-8">
    <!-- Header & Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
           <div class="h-8 w-1 bg-primary-500 rounded-full"></div>
           <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Evidence Gallery</h3>
           <Badge :value="filteredEvidence.length" severity="secondary" class="ml-1" />
        </div>
        
        <div v-if="availableTypes.length > 2" class="flex p-1 bg-surface-100 dark:bg-surface-950 rounded-xl backdrop-blur-md border border-surface-200 dark:border-surface-800">
            <button 
                v-for="type in availableTypes" 
                :key="type"
                @click="selectedType = type === 'all' ? null : type"
                class="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden"
                :class="[
                    (selectedType === type || (type === 'all' && !selectedType)) 
                    ? 'bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5 font-bold' 
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-200/50 dark:hover:bg-surface-800/50'
                ]"
            >
                {{ capitalize(type) }}
            </button>
        </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="item in filteredEvidence" :key="item.id" :id="`evidence-${item.id}`" class="group relative flex flex-col h-full">
        <!-- Card -->
        <article 
            @click="openMedia(item)"
            class="flex flex-col h-full bg-surface-0 dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-900 cursor-pointer"
            :class="{'ring-2 ring-red-500/20 dark:ring-red-500/20': isSensitive(item)}"
        >
            <!-- Media Preview Area -->
            <div class="relative aspect-[4/3] bg-surface-100 dark:bg-surface-950 overflow-hidden">
                
                <!-- Content / Thumbnail -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <img v-if="item.type === 'image'" :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div v-else-if="item.type === 'video'" class="w-full h-full relative">
                         <video :src="getEvidenceUrl(item.file_path)" class="w-full h-full object-cover" preload="metadata"></video>
                         <!-- Play Overlay -->
                         <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl group-hover:scale-110 transition-transform">
                                <i class="pi pi-play text-white fill-current text-xl translate-x-0.5"></i>
                            </div>
                         </div>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center text-surface-400">
                        <i :class="getTypeIcon(item.type)" class="text-6xl mb-3 opacity-50"></i>
                        <span class="text-xs uppercase font-bold tracking-wider">Document</span>
                    </div>
                </div>

                <!-- Gradient Overlay Bottom -->
                <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>

                <!-- Sensitive Overlay -->
                <div 
                    v-if="isSensitive(item)"
                    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl bg-surface-900/80 transition-all duration-300 opacity-100 hover:opacity-0"
                >
                    <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                         <i class="pi pi-eye-slash text-xl text-red-400"></i>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-wider text-surface-200 mb-1">Sensitive Content</span>
                    <span class="text-[10px] text-surface-400">Hover to view</span>
                </div>
                
                 <!-- Floating Type Badge -->
                <div class="absolute top-3 left-3 z-30">
                    <div class="backdrop-blur-xl bg-black/40 hover:bg-black/60 transition-colors text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border border-white/10 shadow-sm flex items-center gap-1.5">
                        <i :class="getTypeIcon(item.type)" class="text-[10px]"></i>
                        {{ item.type }}
                    </div>
                </div>

                <!-- Date Badge (Bottom Left) -->
                <div v-if="item.captured_at" class="absolute bottom-3 left-3 z-30 opacity-90">
                    <div class="text-white text-xs font-mono drop-shadow-md flex items-center gap-1.5">
                         <i :class="hasTime(item.captured_at) ? 'pi pi-clock' : 'pi pi-calendar'" class="text-[10px] opacity-80"></i>
                         {{ formatDate(item.captured_at) }}
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 p-5 flex flex-col relative">
                <div class="flex items-start justify-between gap-2 mb-3">
                    <h3 class="font-bold text-base leading-snug text-surface-900 dark:text-surface-0 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" :title="item.title">
                        {{ item.title }}
                    </h3>
                </div>

                <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-3 mb-5 flex-1 leading-relaxed">
                    {{ item.description }}
                </p>

                <!-- Footer -->
                <div class="pt-4 mt-auto border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs">
                     <div class="bg-surface-100 dark:bg-surface-800 rounded px-2 py-1 max-w-full truncate flex items-center gap-1.5 text-surface-600 dark:text-surface-300">
                        <i class="pi pi-user text-[10px] opacity-70"></i>
                        <span class="font-medium truncate">{{ item.provenance.submitted_by || 'Unknown' }}</span>
                     </div>
                </div>
            </div>
        </article>
      </div>
    </div>
    
    <div v-if="filteredEvidence.length === 0" class="flex flex-col items-center justify-center py-20 bg-surface-50 dark:bg-surface-900 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-800 text-center">
        <div class="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <i class="pi pi-images text-3xl text-surface-400"></i>
        </div>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-1">No media found</h3>
        <p class="text-surface-500 dark:text-surface-400 max-w-xs mx-auto">Try changing the filter type.</p>
    </div>

    <!-- Media Modal -->
    <Dialog 
        v-model:visible="displayModal" 
        modal 
        :dismissableMask="true"
        :closeOnEscape="true"
        :draggable="false"
        class="media-modal-v2"
        :pt="{
            root: { class: 'bg-surface-0 dark:bg-surface-900 border-none rounded-3xl overflow-hidden shadow-2xl max-w-[1200px] w-[95vw]' },
            header: { class: 'hidden' },
            content: { class: 'p-0 h-full' },
        }"
    >
        <div v-if="selectedEvidence" class="flex flex-col lg:flex-row min-h-[500px] lg:h-[80vh]">
            <!-- Media Panel (Left) -->
            <div class="lg:flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden group/modal">
                <template v-if="selectedEvidence.type === 'image'">
                    <img :src="getEvidenceUrl(selectedEvidence.file_path)" :alt="selectedEvidence.title" class="max-w-full max-h-full object-contain z-10" @contextmenu.prevent />
                </template>
                <template v-else-if="selectedEvidence.type === 'video'">
                    <video 
                        :src="getEvidenceUrl(selectedEvidence.file_path)" 
                        controls 
                        controlsList="nodownload" 
                        class="max-w-full max-h-full z-10 outline-none" 
                        autoplay
                        @contextmenu.prevent
                    ></video>
                </template>
                
                <!-- Close Button (Mobile) -->
                <button @click="displayModal = false" class="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white lg:hidden">
                    <i class="pi pi-times"></i>
                </button>
            </div>

            <!-- Details Panel (Right) -->
            <div class="w-full lg:w-[400px] bg-surface-0 dark:bg-surface-900 p-8 flex flex-col gap-8 overflow-y-auto border-l border-surface-100 dark:border-surface-800">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-primary-500/10 text-primary-500 border border-primary-500/20">
                            {{ selectedEvidence.type }}
                        </span>
                        <span v-if="selectedEvidence.captured_at" class="text-xs font-mono text-surface-400">
                            {{ formatDate(selectedEvidence.captured_at) }}
                        </span>
                    </div>
                    <button @click="displayModal = false" class="w-8 h-8 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center transition-colors text-surface-400">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div class="space-y-4">
                    <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 leading-tight">
                        {{ selectedEvidence.title }}
                    </h2>
                    
                    <div class="h-1 w-12 bg-primary-500 rounded-full"></div>
                    
                    <div class="prose dark:prose-invert max-w-none">
                        <p class="text-surface-600 dark:text-surface-300 leading-relaxed text-base">
                            {{ selectedEvidence.description }}
                        </p>
                    </div>
                </div>

                <!-- Metadata Sections -->
                <div class="mt-auto pt-8 border-t border-surface-100 dark:border-surface-800 space-y-6">
                    <!-- Provenance -->
                    <div v-if="selectedEvidence.provenance">
                        <h4 class="text-[10px] uppercase font-black tracking-widest text-surface-400 mb-3 ml-1">Provenance</h4>
                        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 border border-surface-100 dark:border-surface-800">
                            <div class="flex flex-col gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5">
                                        <i class="pi pi-user text-xs text-primary-500"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[10px] text-surface-400 leading-none">Submitted By</span>
                                        <span class="text-sm font-bold text-surface-700 dark:text-surface-200">{{ selectedEvidence.provenance.submitted_by || 'Anonymous' }}</span>
                                    </div>
                                </div>
                                <div v-if="selectedEvidence.provenance.first_published_url" class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5">
                                        <i class="pi pi-link text-xs text-blue-500"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[10px] text-surface-400 leading-none">Source URL</span>
                                        <a :href="selectedEvidence.provenance.first_published_url" target="_blank" class="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]">Link to Source</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Technical (Optional) -->
                    <div v-if="selectedEvidence.technical">
                        <h4 class="text-[10px] uppercase font-black tracking-widest text-surface-400 mb-3 ml-1">Technical Detail</h4>
                        <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                           <div v-if="selectedEvidence.technical.format" class="p-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-surface-500 flex justify-between">
                              <span>Format</span>
                              <span class="text-surface-800 dark:text-surface-200">{{ selectedEvidence.technical.format }}</span>
                           </div>
                           <div v-if="selectedEvidence.technical.file_size_bytes" class="p-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-surface-500 flex justify-between">
                              <span>Size</span>
                              <span class="text-surface-800 dark:text-surface-200">{{ (selectedEvidence.technical.file_size_bytes / 1024 / 1024).toFixed(2) }} MB</span>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { type Evidence, type EvidenceType } from '~/types/incident';
import { formatDate, formatDateTime } from '~/utils/formatters';
import { getMediaUrl } from '~/utils/mediaUrl';

const props = defineProps<{
  evidence: Evidence[];
}>();

const getEvidenceUrl = (path: string) => {
    return getMediaUrl({ kind: 'evidence', relativePath: path });
};

const allPossibleTypes = ['all', 'video', 'image', 'document'];
const availableTypes = computed(() => {
    const presentTypes = new Set(props.evidence.map(ev => ev.type));
    // If only one type exists, we don't even need the "All" filter to be distinct from that type, 
    // but typically keeping "All" is fine if there's more than 1 type besides "All".
    // Actually, if there is only 1 type (e.g. only images), then "All" and "Image" are the same.
    // The user said: "If some type of evidence... isn't available, those types shouldn't be shown".
    // It implies if only types X and Y are available, show All, X, Y.
    return allPossibleTypes.filter(t => t === 'all' || presentTypes.has(t as any));
});
const selectedType = ref<string | null>(null);

const displayModal = ref(false);
const selectedEvidence = ref<Evidence | null>(null);

const filteredEvidence = computed(() => {
    return props.evidence.filter(item => {
        if (selectedType.value && selectedType.value !== 'all' && item.type !== selectedType.value) return false;
        return true;
    });
});

const isSensitive = (item: Evidence) => {
    return item.content_warning === true;
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

const hasTime = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.includes('T') || dateStr.includes(':');
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
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
