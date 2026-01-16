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
                 <IncidentsTimelineBlock :events="incident.timeline" @view-evidence="scrollToEvidence" />
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
import { type Incident } from '~/types/incident';
import MarkdownIt from 'markdown-it';

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
    // Eagerly load all incidents. In a larger app, we might optimize this by year
    // based on the ID structure (inc-YYYY-...) if consistent.
    // e.g. inc-2026-0001 -> load ~/data/incidents/2026/**/*.yaml
    // For now, loading all is simplest and robust.
    const incidents = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });
    
    // Find the file that matches the ID.
    const matchPath = Object.keys(incidents).find(path => {
       const mod = incidents[path] as any;
       const data = mod.default || mod;
       return data.id === id;
    });

    if (matchPath) {
        let incidentData = (incidents[matchPath] as any).default || (incidents[matchPath] as any);
        // Deep copy to avoid mutating the original module if cached? 
        // Or just modify. Modifying module export is risky in dev HMR.
        // Let's clone it.
        incidentData = JSON.parse(JSON.stringify(incidentData));

        // Load generated metadata
        let metadata = {};
        try {
            const metaModule = await import('~/data/generated/evidence-metadata.json');
            metadata = (metaModule as any).default || metaModule;
        } catch (e) {
            console.warn('Evidence metadata not found, skipping technical details injection.');
        }

        // Inject technical details
        if (incidentData.evidence) {
            incidentData.evidence = incidentData.evidence.map((ev: any) => {
                if (ev.file_path && metadata[ev.file_path]) {
                    ev.technical = { ...ev.technical, ...metadata[ev.file_path] };
                }
                return ev;
            });
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

onMounted(() => {
    // Optional: if markdown content has links, we can process them here
});
</script>
