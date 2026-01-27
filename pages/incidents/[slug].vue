<template>
  <div class="px-4 py-8 max-w-7xl mx-auto">
    <div v-if="incident">
      <!-- Header -->
      <IncidentsIncidentHeader :incident="incident" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <!-- Main Content Column (Left/Center) -->
        <div class="lg:col-span-8 space-y-10">
            
            <!-- Key Claims & Narrative -->
            <section>
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-2xl font-bold">What We Know</h2>
                </div>
                
                <div class="prose dark:prose-invert max-w-none mb-6">
                    <p>{{ incident.narrative }}</p>
                </div>

                <div class="bg-surface-50 dark:bg-surface-900 rounded-lg p-6 border-l-4 border-primary-500">
                    <h3 class="font-bold text-lg mb-3">Key Claims</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-200">
                        <li v-for="(claim, idx) in incident.key_claims" :key="idx">{{ claim }}</li>
                    </ul>
                </div>

                <div v-if="incident.limitations.length" class="mt-8">
                    <Accordion :pt="{ root: { class: '!bg-transparent !border-none' } }">
                        <AccordionPanel value="limitations" :pt="{ root: { class: '!border-none' } }">
                           <AccordionHeader :pt="{ root: { class: '!bg-surface-100 dark:!bg-surface-800 !border-none rounded-lg' } }">
                                <span class="font-semibold text-surface-600 dark:text-surface-300">Limitations</span>
                           </AccordionHeader>
                           <AccordionContent :pt="{ content: { class: '!bg-transparent !dark:bg-transparent' } }">
                               <ul class="list-disc list-inside space-y-1 mb-4">
                                   <li v-for="(lim, idx) in incident.limitations" :key="idx">{{ lim }}</li>
                               </ul>
                           </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </section>

             <!-- Evidence Gallery -->
            <section id="evidence" v-if="incident.evidence?.length > 0">
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
            <Card class="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 shadow-sm">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-verified text-4xl text-primary-500 mb-2"></i>
                        <h3 class="font-bold text-lg mb-1">Have more information?</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Submit evidence, suggest corrections, or verify details anonymously.</p>
                        <Button label="Submit Update" icon="pi pi-send" @click="showSubmitModal = true" class="w-full" />
                    </div>
                </template>
            </Card>


            <!-- Verification Status -->
             <section>
                 <IncidentsVerificationBlock :incident="incident" mode="status" />
             </section>

            <!-- Timeline -->
            <section class="sticky top-4">
                 <h2 class="text-xl font-bold mb-4">Timeline</h2>
                 <IncidentsTimelineBlock :events="incident.timeline" @view-evidence="scrollToEvidence" />
            </section>

            <!-- Review History -->
             <section>
                 <IncidentsVerificationBlock :incident="incident" mode="history" />
             </section>

        </div>
      </div>
    
      <!-- Modals -->
      <IncidentsSubmitUpdateModal v-model:visible="showSubmitModal" />
      
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

const route = useRoute();
const slug = route.params.slug as string;
const showSubmitModal = ref(false);

const { data: incident, pending, error } = await useAsyncData<Incident>(`incident-${slug}`, async () => {
  try {
    // Glob import all yaml files in data/incidents recursively
    const incidents = import.meta.glob('~/data/incidents/**/*.yaml');
    
    // Find the file that matches the slug. 
    // We assume slugs are unique across all folders.
    // The key is the path, e.g., "../data/incidents/2026/01/incident.yaml"
    const matchPath = Object.keys(incidents).find(path => {
       // We'll have to lazy load to check the slug, or rely on filename? 
       // The user request implies the slug is inside the file.
       // However, loading ALL files to check slug is expensive.
       // But wait, earlier code assumed filename matches slug? 
       // "Import YAML directly based on the slug." -> return await import(`~/data/incidents/${slug}.yaml`);
       // The new structure is date based. "martial-law-karaj-jan2026" is the slug, but file is "incident.yaml" inside "2026/01".
       // This implies I can't find it easily by filename unless the filename IS the slug.
       // But the user said: "Refactor `data/incidents` to `data/incidents/YYYY/MM/`" and "Move existing `incident.yaml` to `data/incidents/2026/01/`".
       // If I name the file `incident.yaml`, I can't look it up by slug without reading it.
       // UNLESS, I iterate and search. Since this generates a static site or runs on server, it might be okay.
       // ALTERNATIVE: The file name IS the slug. `data/incidents/2026/01/martial-law-karaj-jan2026.yaml`.
       // This is much better for lookup.
       // Let's assume I should rename the file to the slug Name.
       return path.endsWith(`/${slug}.yaml`);
    });

    if (matchPath) {
        let incidentData = await incidents[matchPath]();
        incidentData = unwrapModule(incidentData);

        // Load generated metadata
        // In a real prod build, this JSON should be imported or fetched.
        // For SSG, importing it allows Vite to bundle it.
        // We use a try-catch to avoid breaking if file doesn't exist yet.
        let metadata = {};
        try {
            const metaModule = await import('~/data/generated/evidence-metadata.json');
            metadata = unwrapModule(metaModule);
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
// Using import() returns a module with 'default', accessing it:
const unwrapModule = (mod: any) => mod?.default || mod;

if (incident.value) {
    incident.value = unwrapModule(incident.value);
}

useHead({
  title: incident.value ? `${incident.value.title} - IranArchive` : 'Incident Not Found',
});

const scrollToEvidence = (id: string) => {
    const el = document.getElementById(`evidence-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: highlight effect
        el.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2'), 2000);
    }
};
</script>
