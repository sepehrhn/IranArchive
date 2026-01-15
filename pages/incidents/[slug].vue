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
                    <p class="lead text-lg">{{ incident.narrative }}</p>
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
    // In a real app, this might fetch from an API or a content module.
    // Here we import the JSON directly based on the slug.
    return await import(`~/data/incidents/${slug}.json`);
  } catch (e) {
    if (import.meta.dev) console.error(e);
    // Return null to trigger the "Not Found" state
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
