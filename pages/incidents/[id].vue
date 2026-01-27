<template>
  <div class="min-h-screen bg-surface-50/50 dark:bg-surface-950">
    <div class="px-4 py-8 max-w-7xl mx-auto" v-if="incident">
      
      <!-- Hero / Header -->
      <IncidentsIncidentHeader :incident="incident" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 items-start">
        
        <!-- Main Content (Left) -->
        <div class="lg:col-span-8 space-y-10">
            
            <!-- What We Know -->
            <section>
                <div class="flex items-center justify-between mb-8 border-b border-surface-200 dark:border-surface-800 pb-4">
                  <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 tracking-tight">The Narrative</h2>
                </div>
                
                <div class="prose dark:prose-invert max-w-none mb-10 text-surface-700 dark:text-surface-300 leading-relaxed">
                    <div class="mb-6 text-surface-900 dark:text-surface-100" v-html="renderMarkdown(incident.narrative)"></div>
                </div>

                <!-- Key Claims Box -->
                <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-8 border border-surface-200 dark:border-surface-800 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                    <h2 class="text-2xl font-black mb-8 flex items-center gap-2 text-surface-900 dark:text-surface-0 tracking-tight">
                        <i class="pi pi-verified text-primary-500"></i> Key Claims
                    </h2>
                    <ul class="space-y-4">
                        <li v-for="(claim, idx) in incident.key_claims" :key="idx" class="flex gap-4 items-start">
                            <span class="font-bold text-primary-500 mt-0.5">•</span>
                            <span class="text-surface-800 dark:text-surface-200 leading-relaxed">{{ claim }}</span>
                        </li>
                    </ul>
                </div>

                <div v-if="incident.limitations.length" class="mt-8">
                    <Accordion :pt="{ root: { class: '!bg-transparent !border-none' } }">
                        <AccordionPanel value="limitations" :pt="{ root: { class: '!border-none' } }">
                            <AccordionHeader :pt="{ root: { class: '!bg-surface-100 dark:!bg-surface-800 !border-none rounded-lg !p-4' } }">
                                <span class="font-bold text-xl text-surface-800 dark:text-surface-100">Limitations</span>
                            </AccordionHeader>
                           <AccordionContent :pt="{ content: { class: '!bg-transparent !dark:bg-transparent' } }">
                               <ul class="list-disc list-inside space-y-2 text-surface-600 dark:text-surface-400 mt-2 ml-2">
                                   <li v-for="(lim, idx) in incident.limitations" :key="idx">{{ lim }}</li>
                               </ul>
                           </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </section>

             <!-- Evidence Gallery -->
            <section id="evidence" class="scroll-mt-20" v-if="incident.evidence?.length > 0">
                <IncidentsEvidenceGallery :evidence="incident.evidence" />
            </section>

            <!-- Sources -->
            <section id="sources" class="scroll-mt-20">
                <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 tracking-tight mb-8 border-b border-surface-200 dark:border-surface-800 pb-4">Sources</h2>
                <IncidentsSourcesBlock :sources="incident.sources" />
            </section>

             <!-- Related Entities -->
            <section id="related" v-if="incident.victims?.length || incident.related_incidents?.length">
                <h2 class="text-xl font-bold mb-6">Related Context</h2>
                <IncidentsRelatedEntities :victims="incident.victims" :related="incident.related_incidents" @victim-click="openVictim" />
            </section>

        </div>

        <!-- Sidebar (Right) -->
        <div class="lg:col-span-4 space-y-8 sticky top-8">
            <!-- Verification Status -->
             <section>
                 <IncidentsVerificationBlock :incident="incident" mode="status" />
             </section>

            <!-- Timeline -->
            <section>
                 <div class="flex items-center gap-2 mb-6">
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">Timeline</h2>
                 </div>
                 <IncidentsTimelineBlock :events="incident.timeline" :sources="incident.sources" @view-evidence="scrollToEvidence" @view-source="scrollToSource"/>
            </section>

            <!-- Review History -->
             <section>
                 <IncidentsVerificationBlock :incident="incident" mode="history" />
             </section>
        </div>
      </div>
    
    </div>
    
    <!-- Loading / Error States -->
    <div v-else-if="pending" class="flex items-center justify-center min-h-[50vh]">
        <ProgressSpinner />
    </div>
    <div v-else class="text-center py-40">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 mb-6">
            <i class="pi pi-search text-4xl text-surface-400"></i>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-surface-900 dark:text-surface-0">Incident Not Found</h1>
        <p class="text-surface-500 mb-8 max-w-md mx-auto">The incident record you are looking for does not exist or has been removed.</p>
        <NuxtLink to="/">
            <Button label="Return Home" severity="secondary" />
        </NuxtLink>
    </div>
  </div>

    <!-- Victim Detail Dialog -->
    <Dialog 
        v-model:visible="showVictimDialog" 
        modal 
        :dismissableMask="true"
        :draggable="false"
        class="victim-detail-dialog"
        :style="{ width: '80rem', maxWidth: '95vw' }"
        :breakpoints="{ '960px': '90vw', '640px': '98vw' }"
        :showHeader="true"
    >
        <template #header>
             <div class="flex items-center gap-2">
                <span class="font-bold text-xl">Victim Details</span>
            </div>
        </template>
        <VictimDetail 
            v-if="selectedVictimId" 
            :victim-id="selectedVictimId" 
            :headless="true"
        />
    </Dialog>
</template>

<script setup lang="ts">
import { type Incident, type Evidence } from '~/types/incident';
import MarkdownIt from 'markdown-it';
import { useVictims } from '~/composables/useVictims';
import VictimDetail from '@/components/victims/VictimDetail.vue';

const { fetchEvidenceById } = useEvidence();

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
});

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return md.render(text);
};

const route = useRoute();
// Using ID instead of slug
const id = route.params.id as string;


const { data: incident, pending, error } = await useAsyncData<Incident>(`incident-${id}`, async () => {
  try {
    const incidents = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });
    
    // Find the file name that matches the ID (id is from URL /incidents/{id})
    // Expecting file: inc-{id} ?? No, user said "incidents and evidences id is whatever their file name is"
    // So if URL is /incidents/inc-2026-00001, we look for inc-2026-00001.yaml
    
    const matchPath = Object.keys(incidents).find(path => {
       const parts = path.split('/');
       const filename = parts[parts.length - 1];
       const fileId = filename.replace('.yaml', '');
       return fileId === id;
    });

    if (matchPath) {
        let incidentData = (incidents[matchPath] as any).default || (incidents[matchPath] as any);
        incidentData = JSON.parse(JSON.stringify(incidentData));
        
        // Inject ID from filename
        incidentData.id = id;

        // Load Linked Evidence
        if (incidentData.evidence_ids && Array.isArray(incidentData.evidence_ids)) {
            const evidenceItems: Evidence[] = [];
            for (const evId of incidentData.evidence_ids) {
                const ev = fetchEvidenceById(evId);
                if (ev) {
                    // Inject ID is done in fetchEvidenceById
                    
                    // Inject Technical Metadata
                    // We can move the metadata injection logic here or keep it simple
                     try {
                        // TODO: Refactor metadata injection to be per-evidence or global lookup
                        // For now, let's just push it.
                        // Assuming metadata injection happens if we had the file_path.
                        evidenceItems.push(ev);
                    } catch (e) {
                        console.error(`Failed to process evidence ${evId}`, e);
                    }
                }
            }
            incidentData.evidence = evidenceItems;
        } else {
             incidentData.evidence = [];
        }

        // Load generated metadata (Legacy support or new support?)
        // The previous code injected technical details based on file path.
        // We should replicate that if possible.
        try {
            const metaModule = await import('~/data/generated/evidence-metadata.json');
            const metadata = (metaModule as any).default || metaModule;
             incidentData.evidence = incidentData.evidence.map((ev: Evidence) => {
                if (ev.file_path && metadata[ev.file_path]) {
                    ev.technical = { ...ev.technical, ...metadata[ev.file_path] };
                }
                return ev;
            });
        } catch (e) {
             // Metadata might not exist or match
        }



        // Enrich Victims
        if (incidentData.victims && Array.isArray(incidentData.victims)) {
            const { getVictimById } = useVictims();
            const enrichedVictims = [];
            
            // incidentData.victims is now string[]
            for (const vId of incidentData.victims) {
                // Ensure vId is a string before using it
                if (typeof vId === 'string') {
                    const fullVictim = await getVictimById(vId);
                    if (fullVictim) {
                        enrichedVictims.push({
                            id: vId,
                            name: fullVictim.name,
                            ...fullVictim
                        });
                    } else {
                         // Fallback if not found: create a minimal object
                         enrichedVictims.push({ id: vId, name: vId });
                    }
                }
            }
            incidentData.victims = enrichedVictims as any;
        }

        return incidentData;
    }
    return null;
  } catch (e) {
    if (import.meta.dev) console.error(e);
    return null;
  }
});

useHead({
  title: incident.value ? `${incident.value.title} - IranArchive` : 'Incident Not Found',
});

const scrollToEvidence = (id: string) => {
    const el = document.getElementById(`evidence-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2'), 2000);
    }
};

const scrollToSource = (id: string) => {
    const el = document.getElementById(`source-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 2000);
    }
};

onMounted(() => {
    // Optional: if markdown content has links, we can process them here
});

const selectedVictimId = ref<string | null>(null);

const openVictim = (id: string) => {
    selectedVictimId.value = id;
};

const showVictimDialog = computed({
    get: () => !!selectedVictimId.value,
    set: (val) => {
        if (!val) selectedVictimId.value = null;
    }
});
</script>
