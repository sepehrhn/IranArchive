<template>
  <div class="px-4 py-8 max-w-7xl mx-auto">
    <div v-if="incident">
      <!-- Header -->
      <IncidentsIncidentHeader :incident="incident" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <!-- Main Content Column (Left/Center) -->
        <div class="lg:col-span-8 space-y-12">
            
            <!-- Key Claims & Narrative -->
            <section>
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-2xl font-bold">What We Know</h2>
                </div>
                
                <div class="prose dark:prose-invert max-w-none mb-6">
                    <div class="lead text-lg" v-html="renderMarkdown(incident.narrative)"></div>
                </div>

                <div class="bg-surface-50 dark:bg-surface-900 rounded-lg p-6 border-l-4 border-primary-500">
                    <h3 class="font-bold text-lg mb-3">Key Claims</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-200">
                        <li v-for="(claim, idx) in incident.key_claims" :key="idx">{{ claim }}</li>
                    </ul>
                </div>

                <div v-if="incident.limitations.length" class="mt-6">
                    <Accordion>
                        <AccordionPanel value="limitations">
                           <AccordionHeader>Limitations & Unknowns</AccordionHeader>
                           <AccordionContent>
                               <ul class="list-disc list-inside space-y-1 mb-4">
                                   <li v-for="(lim, idx) in incident.limitations" :key="idx">{{ lim }}</li>
                               </ul>
                           </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </section>

             <!-- Evidence Gallery -->
            <section id="evidence">
                 <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold">Evidence Gallery</h2>
                    <Badge :value="incident.evidence.length" severity="secondary" />
                </div>
                <IncidentsEvidenceGallery :evidence="incident.evidence" />
            </section>

            <!-- Sources -->
            <section id="sources">
                <h2 class="text-2xl font-bold mb-6">Sources</h2>
                <IncidentsSourcesBlock :sources="incident.sources" />
            </section>

             <!-- Related Entities -->
            <section id="related">
                <h2 class="text-xl font-bold mb-6">Related Context</h2>
                <IncidentsRelatedEntities :victims="incident.victims" :related="incident.related_incidents" />
            </section>

        </div>

        <!-- Sidebar (Right) -->
        <div class="lg:col-span-4 space-y-8">
            
            <!-- Submit CTA -->


            <!-- Verification Status -->
             <section>
                 <IncidentsVerificationBlock :incident="incident" />
             </section>

            <!-- Timeline -->
            <section class="sticky top-4">
                 <h2 class="text-xl font-bold mb-4">Timeline</h2>
                 <IncidentsTimelineBlock :events="incident.timeline" :sources="incident.sources" @view-evidence="scrollToEvidence" @view-source="scrollToSource"/>
            </section>

        </div>
      </div>
    
      <!-- Modals -->

      
    </div>
    
    <!-- Loading / Error States -->
    <div v-else-if="pending" class="flex items-center justify-center min-h-[50vh]">
        <ProgressSpinner />
    </div>
    <div v-else class="text-center py-20">
        <h1 class="text-3xl font-bold mb-4">Incident Not Found</h1>
        <p class="text-gray-500 mb-6">The incident record you are looking for does not exist or has been removed.</p>
        <NuxtLink to="/">
            <Button label="Return Home" />
        </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Incident, type Evidence } from '~/types/incident';
import MarkdownIt from 'markdown-it';

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
</script>
