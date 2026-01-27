<script setup lang="ts">
import { useVictims } from '@/composables/useVictims';
import { useIncidents } from '@/composables/useIncidents';
import VictimPhoto from '@/components/victims/VictimPhoto.vue';
import VictimStatusBadge from '@/components/victims/VictimStatusBadge.vue';
import VictimSources from '@/components/victims/VictimSources.vue';
import { formatDate } from '@/utils/formatters';
import MarkdownIt from 'markdown-it';
import { computed, watch } from 'vue';

const props = defineProps<{
    victimId: string;
    headless?: boolean;
}>();

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
});

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return md.render(text);
};

const { getVictimById } = useVictims();
const { getIncidentById } = useIncidents();

// Use async data to fetch server/client side compatible
// We watch props.victimId to refetch if it changes
const { data: victim, error, refresh } = await useAsyncData(`victim-${props.victimId}`, async () => {
    const v = await getVictimById(props.victimId);
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
}, {
    watch: [() => props.victimId]
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

// X (Twitter) Share Logic
const xShareUrl = computed(() => {
    if (!victim.value?.name) return '';
    
    const nameHashtag = victim.value.name.replace(/\s+/g, '_');
    const text = `#IranMassacre #${nameHashtag}`;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    
    return url;
});

// Head Management (SEO)
if (!props.headless) {
    useHead({
        title: computed(() => victim.value ? `${victim.value.name} — Victims` : 'Victim Not Found'),
        meta: [
            { name: 'description', content: computed(() => victim.value?.description || 'Victim details') }
        ]
    });
}
</script>

<template>
    <div>
        <!-- Not Found -->
        <div v-if="!victim" class="text-center py-10">
            <h1 class="text-3xl font-bold mb-4">Victim not found</h1>
            <p class="text-surface-500 mb-8">The requested victim record could not be found.</p>
        </div>

        <!-- Content -->
        <!-- Redesigned Grid Layout -->
        <div v-else class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
                
                <!-- Left Column: Photo & primary actions (Sticky on Desktop) -->
                <div class="lg:sticky lg:top-8 flex flex-col gap-6">
                    <VictimPhoto 
                        :src="victim.photo" 
                        :alt="victim.name" 
                        aspect="portrait"
                        size="lg"
                        class="shadow-xl rounded-2xl w-full"
                    />
                    
                    <div class="flex flex-col gap-3">
                         <a 
                            :href="xShareUrl" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all font-bold shadow-md"
                        >
                            <i class="pi pi-twitter text-lg"></i>
                            <span>Share on 𝕏</span>
                        </a>
                    </div>
                </div>

                <!-- Right Column: Details -->
                <div class="flex flex-col gap-8 min-w-0">
                    
                    <!-- Header -->
                    <div class="border-b border-surface-200 dark:border-surface-700 pb-6">
                        <div class="flex items-center gap-3 mb-3">
                            <VictimStatusBadge :status="victim.status" />
                        </div>
                        <h1 class="text-4xl md:text-5xl font-black text-surface-900 dark:text-surface-0 tracking-tight leading-tight mb-2">
                            {{ victim.name }}
                        </h1>
                        <div class="text-lg md:text-xl text-surface-500 dark:text-surface-400 font-medium">
                            <span v-if="victim.age">{{ victim.age }} years old</span>
                            <span v-if="victim.age && victim.occupation"> • </span>
                            <span v-if="victim.occupation">{{ victim.occupation }}</span>
                        </div>
                    </div>

                    <!-- Key Timeline Info -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-100 dark:border-surface-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <i :class="victim.status === 'Missing' ? 'pi pi-calendar text-orange-500' : 'pi pi-calendar-times text-red-500'"></i>
                                <span class="text-xs font-bold uppercase tracking-wider text-surface-500">
                                    {{ victim.status === 'Missing' ? 'Date Missing' : 'Date of Death' }}
                                </span>
                            </div>
                            <div class="text-xl font-bold text-surface-900 dark:text-surface-0">
                                {{ formattedDeathDate }}
                            </div>
                        </div>

                        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-100 dark:border-surface-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="pi pi-map-marker text-primary-500"></i>
                                <span class="text-xs font-bold uppercase tracking-wider text-surface-500">Location</span>
                            </div>
                            <div class="text-xl font-bold text-surface-900 dark:text-surface-0">
                                {{ incidentLocation }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bio / Description -->
                    <div v-if="victim.description" class="prose prose-lg dark:prose-invert max-w-none text-surface-700 dark:text-surface-200 leading-relaxed">
                         <div v-html="renderMarkdown(victim.description)"></div>
                    </div>

                    <!-- Detailed Info Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <!-- Cause -->
                        <div v-if="victim.cause_of_death && victim.status === 'Killed'" class="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
                             <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 mb-1">Cause of Death</h3>
                             <p class="text-surface-600 dark:text-surface-300">{{ victim.cause_of_death }}</p>
                        </div>
                        
                         <!-- Circumstances -->
                        <div v-if="victim.disappearance_circumstances && victim.status === 'Missing'" class="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
                             <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 mb-1">Disappearance Circumstances</h3>
                             <p class="text-surface-600 dark:text-surface-300">{{ victim.disappearance_circumstances }}</p>
                        </div>

                        <!-- Suspected Actor -->
                         <div v-if="victim.suspected_actor && victim.status === 'Missing'" class="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
                             <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 mb-1">Suspected Actor</h3>
                             <p class="text-surface-600 dark:text-surface-300">{{ victim.suspected_actor }}</p>
                        </div>

                        <!-- Personal Info Extras -->
                        <div v-if="victim.gender" class="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-100 dark:border-surface-800 flex justify-between items-center">
                             <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0">Gender</h3>
                             <p class="text-surface-600 dark:text-surface-300">{{ victim.gender }}</p>
                        </div>

                         <div v-if="formattedBirthDate" class="bg-white dark:bg-surface-900 p-4 rounded-xl border border-surface-100 dark:border-surface-800 flex justify-between items-center">
                             <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0">Birth Date</h3>
                             <p class="text-surface-600 dark:text-surface-300">{{ formattedBirthDate }}</p>
                        </div>
                    </div>

                    <!-- Linked Incidents -->
                    <div v-if="victim.incident_ids && victim.incident_ids.length > 0" class="pt-6 border-t border-surface-200 dark:border-surface-700">
                         <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-4 flex items-center gap-2">
                            <i class="pi pi-link text-primary-500"></i>
                            Linked Incidents
                        </h3>
                        <div class="flex flex-wrap gap-3">
                            <NuxtLink 
                                v-for="inc in victim.enrichedIncidents" 
                                :key="inc.id"
                                :to="`/incidents/${inc.id}`" 
                                class="no-underline"
                            >
                                <Button :label="inc.title" icon="pi pi-arrow-right" size="small" outlined class="!rounded-lg" />
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Sources Footer -->
                    <div class="pt-6 border-t border-surface-200 dark:border-surface-700 opacity-80">
                        <VictimSources 
                            :source-type="victim.source_type"
                            :social-media-link="victim.source_social_media_link"
                        />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
