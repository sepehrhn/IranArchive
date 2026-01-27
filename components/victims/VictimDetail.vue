<script setup lang="ts">
import { useVictims } from '@/composables/useVictims';
import { useIncidents } from '@/composables/useIncidents';
import VictimPhoto from '@/components/victims/VictimPhoto.vue';
import VictimStatusBadge from '@/components/victims/VictimStatusBadge.vue';
import VictimSources from '@/components/victims/VictimSources.vue';
import { formatDate } from '@/utils/formatters';
import MarkdownIt from 'markdown-it';
import { getMediaUrl } from '~/utils/mediaUrl';
import { ref, computed } from 'vue';

const props = defineProps<{
    victimId: string;
    headless?: boolean;
}>();

const copied = ref(false);

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

// Copy Link Logic
const copyLink = () => {
    if (typeof window !== 'undefined') {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    }
};

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
        <div v-else class="flex flex-col">
            
            <!-- Hero / Photo Section -->
            <div class="relative w-full bg-surface-100 dark:bg-surface-950 flex justify-center group">
                <!-- blurred background -->
                <div class="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20 pointer-events-none">
                     <img 
                        :src="getMediaUrl({ kind: 'victim_photo', relativePath: victim.photo })" 
                        class="w-full h-full object-cover blur-3xl scale-110" 
                        alt="" 
                    />
                     <div class="absolute inset-0 bg-gradient-to-b from-transparent to-surface-0 dark:to-surface-900"></div>
                </div>

                <div class="relative py-8 md:py-10 px-6 w-full max-w-lg mx-auto z-10">
                    <VictimPhoto 
                        :src="victim.photo" 
                        :alt="victim.name" 
                        aspect="square"
                        size="xl"
                        class="shadow-2xl rounded-2xl w-full aspect-[4/5] object-cover ring-1 ring-surface-900/5 dark:ring-surface-0/10"
                    />
                </div>
            </div>

            <!-- Details Section -->
            <div class="relative px-6 pb-10 md:px-10 -mt-6 z-20">
                <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-100 dark:border-surface-800 p-6 md:p-10 max-w-4xl mx-auto">
                    
                    <!-- Header -->
                    <div class="text-center mb-10">
                        <div class="flex justify-center mb-4">
                            <VictimStatusBadge :status="victim.status" class="!px-4 !py-1.5 !text-sm !rounded-full" />
                        </div>
                        
                        <h1 class="text-3xl md:text-5xl font-black text-surface-900 dark:text-surface-0 tracking-tight leading-tight mb-3">
                            {{ victim.name }}
                        </h1>
                        
                        <div class="flex flex-wrap items-center justify-center gap-2 text-surface-500 dark:text-surface-400 font-medium text-lg">
                            <span v-if="victim.age">{{ victim.age }} years old</span>
                            <span v-if="victim.age && victim.occupation" class="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                            <span v-if="victim.occupation">{{ victim.occupation }}</span>
                            <span v-if="(victim.age || victim.occupation) && incidentLocation" class="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                            <span>{{ incidentLocation }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-center gap-3 mb-10">
                         <a 
                            :href="xShareUrl" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="no-underline"
                        >
                            <Button rounded class="!bg-black dark:!bg-white !text-white dark:!text-black !border-none !font-bold !px-6">
                                <i class="pi pi-twitter text-lg mr-2"></i>
                                Share Story
                            </Button>
                        </a>
                        <Button 
                            :icon="copied ? 'pi pi-check' : 'pi pi-link'" 
                            :label="copied ? 'Copied' : ''"
                            rounded 
                            outlined 
                            :severity="copied ? 'success' : 'secondary'"
                            class="!border-surface-200 dark:!border-surface-700 !text-surface-600 dark:!text-surface-300" 
                            @click="copyLink"
                        />
                    </div>


                    <!-- Info Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10">
                        <!-- Key Dates -->
                        <div class="space-y-6">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Timeline</h3>
                            
                            <div class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-calendar-times text-red-500 dark:text-red-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">Date of Incident</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ formattedDeathDate }}</p>
                                </div>
                            </div>

                             <div v-if="formattedBirthDate" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-calendar text-blue-500 dark:text-blue-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">Date of Birth</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ formattedBirthDate }}</p>
                                </div>
                            </div>
                        </div>

                         <!-- Key Details -->
                        <div class="space-y-6">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Details</h3>
                            
                            <div v-if="victim.cause_of_death && victim.status === 'Killed'" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-heart-fill text-surface-600 dark:text-surface-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">Cause of Death</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0 leading-tight">{{ victim.cause_of_death }}</p>
                                </div>
                            </div>

                             <div v-if="victim.disappearance_circumstances && victim.status === 'Missing'" class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-question text-orange-500 dark:text-orange-400 text-lg"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-surface-500 dark:text-surface-400">Circumstances</p>
                                    <p class="text-lg font-bold text-surface-900 dark:text-surface-0 leading-tight">{{ victim.disappearance_circumstances }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bio -->
                    <div v-if="victim.description" class="mb-10">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Story</h3>
                        <div class="prose prose-lg dark:prose-invert max-w-none text-surface-700 dark:text-surface-300 leading-relaxed">
                             <div v-html="renderMarkdown(victim.description)"></div>
                        </div>
                    </div>

                    <!-- Footer Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-surface-100 dark:border-surface-800">
                         <!-- Linked Incidents -->
                        <div v-if="victim.incident_ids && victim.incident_ids.length > 0">
                             <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0 mb-3">Linked Incidents</h4>
                             <div class="flex flex-wrap gap-2">
                                <NuxtLink 
                                    v-for="inc in victim.enrichedIncidents" 
                                    :key="inc.id"
                                    :to="`/incidents/${inc.id}`" 
                                    class="no-underline"
                                >
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                                        <i class="pi pi-link text-xs"></i>
                                        {{ inc.title }}
                                    </span>
                                </NuxtLink>
                            </div>
                        </div>

                        <!-- Sources -->
                        <div>
                            <VictimSources 
                                :source-type="victim.source_type"
                                :social-media-link="victim.source_social_media_link"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
