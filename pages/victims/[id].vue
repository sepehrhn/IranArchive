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
        { name: 'description', content: computed(() => victim.value?.description || 'Victim details') }
    ]
});

// Formatted dates
const formattedDeathDate = computed(() => {
    if (!victim.value?.date_of_death) return 'Unknown';
    const date = formatDate(victim.value.date_of_death);
    const precision = victim.value.date_of_death_precision;
    return precision === 'Approximate' ? `~${date}` : date;
});

const formattedBirthDate = computed(() => {
    if (!victim.value?.birth_date) return null;
    return formatDate(victim.value.birth_date);
});

// Location string
const incidentLocation = computed(() => {
    const parts = [];
    if (victim.value?.incident_city) parts.push(victim.value.incident_city);
    if (victim.value?.incident_province) parts.push(victim.value.incident_province);
    if (victim.value?.country) parts.push(victim.value.country);
    return parts.join(', ') || 'Unknown';
});

const birthLocation = computed(() => {
    const parts = [];
    if (victim.value?.birth_city) parts.push(victim.value.birth_city);
    if (victim.value?.birth_province) parts.push(victim.value.birth_province);
    return parts.join(', ') || null;
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
        <div v-else class="max-w-5xl mx-auto space-y-8">
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
                        class="shadow-lg rounded-xl"
                    />
                </div>

                <!-- Primary Info -->
                <div class="md:col-span-2 flex flex-col gap-6">
                    <!-- Name and Status -->
                    <div class="flex items-start justify-between gap-4 flex-wrap">
                        <h1 class="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-0">{{ victim.name }}</h1>
                        <VictimStatusBadge :status="victim.status" class="mt-1" />
                    </div>

                    <!-- Quick Info Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <!-- Age -->
                        <div v-if="victim.age" class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                            <span class="text-surface-500 text-xs uppercase tracking-wide">Age</span>
                            <p class="font-semibold text-lg text-surface-900 dark:text-surface-0">{{ victim.age }}</p>
                        </div>
                        
                        <!-- Gender -->
                        <div v-if="victim.gender" class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                            <span class="text-surface-500 text-xs uppercase tracking-wide">Gender</span>
                            <p class="font-semibold text-lg text-surface-900 dark:text-surface-0">{{ victim.gender }}</p>
                        </div>
                        
                        <!-- Occupation -->
                        <div v-if="victim.occupation" class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                            <span class="text-surface-500 text-xs uppercase tracking-wide">Occupation</span>
                            <p class="font-semibold text-lg text-surface-900 dark:text-surface-0">{{ victim.occupation }}</p>
                        </div>
                        
                        <!-- Cause of Death (Killed only) -->
                        <div v-if="victim.status === 'Killed' && victim.cause_of_death" class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                            <span class="text-surface-500 text-xs uppercase tracking-wide">Cause of Death</span>
                            <p class="font-semibold text-lg text-surface-900 dark:text-surface-0">{{ victim.cause_of_death }}</p>
                        </div>
                        
                        <!-- Disappearance Circumstances (Missing only) -->
                        <div v-if="victim.status === 'Missing' && victim.disappearance_circumstances" class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                            <span class="text-surface-500 text-xs uppercase tracking-wide">Circumstances</span>
                            <p class="font-semibold text-lg text-surface-900 dark:text-surface-0">{{ victim.disappearance_circumstances }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Details Sections -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Death/Disappearance Information Card -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-4 flex items-center gap-2">
                        <i :class="victim.status === 'Missing' ? 'pi pi-question-circle text-orange-500' : 'pi pi-calendar text-red-500'"></i>
                        {{ victim.status === 'Missing' ? 'Disappearance Information' : 'Death Information' }}
                    </h2>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-surface-500">{{ victim.status === 'Missing' ? 'Last Seen Date' : 'Date' }}</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ formattedDeathDate }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-surface-500">{{ victim.status === 'Missing' ? 'Last Seen Location' : 'Location' }}</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0 text-right">{{ incidentLocation }}</span>
                        </div>
                        <div v-if="victim.status === 'Killed' && victim.cause_of_death" class="flex justify-between">
                            <span class="text-surface-500">Cause</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.cause_of_death }}</span>
                        </div>
                        <div v-if="victim.status === 'Missing' && victim.disappearance_circumstances" class="flex justify-between">
                            <span class="text-surface-500">Circumstances</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0 text-right">{{ victim.disappearance_circumstances }}</span>
                        </div>
                        <div v-if="victim.status === 'Missing' && victim.suspected_actor" class="flex justify-between">
                            <span class="text-surface-500">Suspected Actor</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.suspected_actor }}</span>
                        </div>
                    </div>
                </div>

                <!-- Personal Information Card -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-4 flex items-center gap-2">
                        <i class="pi pi-user text-primary-500"></i>
                        Personal Information
                    </h2>
                    <div class="space-y-3">
                        <div v-if="victim.age" class="flex justify-between">
                            <span class="text-surface-500">Age</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.age }} years</span>
                        </div>
                        <div v-if="victim.gender" class="flex justify-between">
                            <span class="text-surface-500">Gender</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.gender }}</span>
                        </div>
                        <div v-if="victim.occupation" class="flex justify-between">
                            <span class="text-surface-500">Occupation</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ victim.occupation }}</span>
                        </div>
                        <div v-if="formattedBirthDate" class="flex justify-between">
                            <span class="text-surface-500">Birth Date</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ formattedBirthDate }}</span>
                        </div>
                        <div v-if="birthLocation" class="flex justify-between">
                            <span class="text-surface-500">Birth Place</span>
                            <span class="font-medium text-surface-900 dark:text-surface-0 text-right">{{ birthLocation }}</span>
                        </div>
                        <p v-if="!victim.age && !victim.gender && !victim.occupation && !formattedBirthDate && !birthLocation" class="text-surface-500 italic text-sm">
                            No personal information available.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div v-if="victim.description" class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-4 flex items-center gap-2">
                    <i class="pi pi-file-edit text-primary-500"></i>
                    Description
                </h2>
                <div class="prose dark:prose-invert max-w-none text-surface-700 dark:text-surface-200">
                    <div v-html="renderMarkdown(victim.description)"></div>
                </div>
            </div>

            <!-- Linked Incidents -->
            <div class="space-y-4">
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
                    <i class="pi pi-exclamation-triangle text-orange-500"></i>
                    Linked Incidents
                </h2>
                <div v-if="victim.incident_ids && victim.incident_ids.length > 0" class="flex flex-wrap gap-3">
                    <NuxtLink 
                        v-for="inc in victim.enrichedIncidents" 
                        :key="inc.id"
                        :to="`/incidents/${inc.id}`" 
                        class="block"
                    >
                        <Button :label="inc.title" icon="pi pi-link" outlined size="small" />
                    </NuxtLink>
                </div>
                <p v-else class="text-surface-500 italic">No linked incidents.</p>
            </div>

            <!-- Sources -->
            <div class="border-t border-surface-200 dark:border-surface-700 pt-6">
                <VictimSources 
                    :source-type="victim.source_type"
                    :social-media-link="victim.source_social_media_link"
                />
            </div>
        </div>
    </div>
</template>
