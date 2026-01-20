<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useVictims } from '@/composables/useVictims';
import { useIncidents } from '@/composables/useIncidents';
import type { Victim } from '@/types/victims';
import VictimPhoto from '@/components/victims/VictimPhoto.vue';
import VictimStatusBadge from '@/components/victims/VictimStatusBadge.vue';
import VictimSources from '@/components/victims/VictimSources.vue';
import { formatDate } from '@/utils/formatters';
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
const id = route.params.id as string;
const { getVictimById } = useVictims();
const { getIncidentById } = useIncidents();

// Use async data to fetch server/client side compatible
const { data: victim, error } = await useAsyncData(`victim-${id}`, async () => {
    const v = await getVictimById(id);
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
});

useHead({
    title: computed(() => victim.value ? `${victim.value.name} — Victims` : 'Victim Not Found'),
    meta: [
        { name: 'description', content: computed(() => victim.value?.summary || 'Victim details') }
    ]
});

const formattedDate = computed(() => {
    if (!victim.value?.date_of_death) return 'Unknown';
    return formatDate(victim.value.date_of_death);
});
</script>

<template>
    <div>
        <!-- Not Found -->
        <div v-if="!victim" class="text-center py-20">
            <h1 class="text-3xl font-bold mb-4">Victim not found</h1>
            <p class="text-surface-500 mb-8">The requested victim record could not be found.</p>
            <NuxtLink to="/victims">
                <Button label="Back to Victims" icon="pi pi-arrow-left" />
            </NuxtLink>
        </div>

        <!-- Content -->
        <div v-else class="max-w-4xl mx-auto space-y-8">
            <!-- Back Link -->
            <NuxtLink to="/victims" class="inline-flex items-center gap-2 text-surface-500 hover:text-primary-500 transition-colors">
                <i class="pi pi-arrow-left"></i>
                <span>Back to Victims List</span>
            </NuxtLink>

            <!-- Header Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Photo -->
                <div class="md:col-span-1">
                    <VictimPhoto 
                        :src="victim.photo" 
                        :alt="victim.name" 
                        aspect="portrait"
                        size="lg"
                        class="shadow-md"
                    />
                </div>

                <!-- Info -->
                <div class="md:col-span-2 flex flex-col gap-4">
                    <div class="flex items-start justify-between gap-4">
                        <h1 class="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-0">{{ victim.name }}</h1>
                        <VictimStatusBadge :status="victim.status" class="mt-2" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg mt-2">
                        <div class="flex flex-col">
                            <span class="text-surface-500 text-sm">Date of Death</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ formattedDate }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-surface-500 text-sm">Location</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.city }}{{ victim.province ? `, ${victim.province}` : '' }}{{ victim.country ? `, ${victim.country}` : '' }}</span>
                        </div>
                        <div class="flex flex-col" v-if="victim.age">
                            <span class="text-surface-500 text-sm">Age</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.age }}</span>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Summary -->
            <div v-if="victim.summary" class="bg-surface-50 dark:bg-surface-800 rounded-lg border-l-4 border-primary-500 p-6">
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Summary</h2>
                <p class="text-lg leading-relaxed text-surface-700 dark:text-surface-200">{{ victim.summary }}</p>
            </div>

            <!-- Incidents -->
            <div class="space-y-4">
                <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Linked Incidents</h2>
                <div v-if="victim.incident_ids.length > 0" class="flex flex-wrap gap-4">
                    <NuxtLink 
                        v-for="inc in victim.enrichedIncidents" 
                        :key="inc.id"
                        :to="`/incidents/${inc.id}`" 
                        class="block"
                    >
                         <Button :label="inc.title" icon="pi pi-exclamation-triangle" outlined size="small" />
                    </NuxtLink>
                </div>
                <p v-else class="text-surface-500 italic">No linked incidents yet.</p>
            </div>

            <!-- Notes -->
            <div v-if="victim.notes" class="space-y-4">
                <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Notes</h2>
                <div class="prose dark:prose-invert max-w-none">
                     <div class="lead text-lg" v-html="renderMarkdown(victim.notes)"></div>
                </div>
            </div>

            <!-- Sources -->
            <div class="border-t border-surface-200 dark:border-surface-800 pt-8">
                 <VictimSources :sources="victim.sources" />
            </div>
        </div>
    </div>
</template>
