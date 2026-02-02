<script setup lang="ts">
import { computed, onMounted } from 'vue';
const { t } = useI18n();
import { useCampaigns, calculateGoal } from '~/composables/useCampaigns';
import { useCampaignSigning } from '~/composables/useCampaignSigning';
import { useCountries } from '~/composables/useCountries';
import { getMediaUrl } from '~/utils/mediaUrl';

const { getAllCampaigns } = useCampaigns();
const allCampaigns = getAllCampaigns();

// Signing Logic
const { loadSigned, isSigned, markSigned } = useCampaignSigning();

const isMounted = ref(false);
const loading = ref(true);

const stats = computed(() => {
    const active = allCampaigns.filter(c => c.status === 'active').length;
    const victories = allCampaigns.filter(c => c.status === 'victory').length;
    return { active, victories };
});

onMounted(async () => {
    loadSigned();
    isMounted.value = true;
    
    // Live Updates
    // Fetch live stats for all active/victory campaigns
    const promises = allCampaigns.map(async (campaign) => {
        if (campaign.status === 'closed' || !campaign.url.includes('change.org')) return;

        try {
            const data = await $fetch(`/api/campaign-stats`, {
                query: { url: campaign.url }
            }) as any;

            if (data && data.signatures) {
                campaign.signatures = data.signatures;
                if (data.author) campaign.author = data.author;
                campaign.goal = calculateGoal(campaign.signatures, campaign.status);
            }
        } catch (e) {
            console.error('Failed to fetch live stats for', campaign.url);
        }
    });

    await Promise.all(promises);
    loading.value = false;
});

const showSubmitDialog = ref(false);

// SEO
useHead({
  title: t('campaignsPage.title'),
  meta: [
    { name: 'description', content: t('campaignsPage.description') }
  ]
});

// Campaign Image URL Generation
const getCampaignImageUrl = (filename: string | undefined) => {
  if (!filename) return getMediaUrl({ kind: 'campaign_img', relativePath: 'campaign-placeholder.jpg' });
  return getMediaUrl({ kind: 'campaign_img', relativePath: filename });
};

// Filtering & Sorting (Default sort: Signed first, then featured)
const filteredCampaigns = computed(() => {
  let result = [...allCampaigns];

  // Only apply signed-based sorting on the client after mount to prevent hydration mismatch
  if (isMounted.value) {
      result.sort((a, b) => {
        // 1. Unsigned first (Visual priority) - CLIENT ONLY
        const aSigned = isSigned(a.id);
        const bSigned = isSigned(b.id);
        if (aSigned !== bSigned) return aSigned ? 1 : -1;

        // 2. Featured
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        
        // 3. Fallback to Created Date if present, else A-Z by ID
        const aDate = a.created_at || '';
        const bDate = b.created_at || '';
        if (aDate && bDate && aDate !== bDate) return bDate.localeCompare(aDate);
        
        return a.id.localeCompare(b.id);
      });
  } else {
      // Server-side / Initial consistent sort (Matches useCampaigns default)
      // This MUST match the server's render perfectly
       result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        
        const aDate = a.created_at || '';
        const bDate = b.created_at || '';
        if (aDate && bDate && aDate !== bDate) return bDate.localeCompare(aDate);
        
        return a.id.localeCompare(b.id);
      });
  }

  return result;
});

const getStatusSeverity = (status: string) => {
    switch(status) {
        case 'active': return 'success';
        case 'victory': return 'info';
        case 'closed': return 'secondary';
        default: return 'secondary';
    }
};

const { getCountryByIso, loadCountries } = useCountries();
loadCountries();

const formatCountries = (codes: string[]) => {
    if (!codes || codes.length === 0) return t('countries.International');
    
    // Resolve names
    const names = codes.map(code => {
        const country = getCountryByIso(code);
        // Special case for 'International', otherwise try to get name from country object or fallback to code
        if (code === 'International') return t('countries.International');
        return t(`countries.${code}`, country ? country.name : code);
    });

    const display = names.slice(0, 3); // Showing 3 names max
    let str = display.join(', ');
    if (names.length > 3) {
        str += ` +${names.length - 3}`;
    }
    return str;
};

// Formatting & Helpers
const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    const formatted = new Intl.NumberFormat('en-US').format(num);
    return useNuxtApp().$nFa(formatted);
};

const getProgress = (signatures?: number, goal?: number) => {
    if (!signatures || !goal || goal === 0) return 0;
    return Math.min(100, (signatures / goal) * 100);
};
import confetti from 'canvas-confetti';

const handleConfetti = (event: MouseEvent, status: string) => {
    if (status !== 'victory') return;

    // Get the element's position relative to the viewport
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Calculate center of the card
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FFFFFF'], // Gold, Orange, White
        disableForReducedMotion: true,
        zIndex: 10000,
    });
};
</script>

<template>
  <div class="min-h-screen pb-12">
    <div class="container mx-auto px-4 mt-6 space-y-8">
      
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 rounded-2xl overflow-hidden">
            <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
            <div class="relative px-8 py-10 md:py-12">
                <div class="max-w-3xl">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                        {{ t('campaignsPage.heroTitle') }}
                    </h1>
                    <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                        {{ t('campaignsPage.heroSubtitle') }}
                    </p>
                    
                    <!-- Stats -->
                    <div class="flex flex-wrap gap-6 mb-2">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <i class="pi pi-megaphone text-primary-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white">
                                    <Skeleton v-if="loading || !isMounted" width="2rem" height="2.5rem" class="!bg-white/20" />
                                    <span v-else>{{ $nFa(stats.active) }}</span>
                                </p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">{{ t('campaignsPage.active') }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <i class="pi pi-trophy text-amber-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white">
                                    <Skeleton v-if="loading || !isMounted" width="2rem" height="2.5rem" class="!bg-white/20" />
                                    <span v-else>{{ $nFa(stats.victories) }}</span>
                                </p>
                                <p class="text-sm text-surface-300 dark:text-surface-400">{{ t('campaignsPage.victory') }}</p>
                            </div>
                        </div>
                    </div>
                    

                </div>

                <!-- Action Button in Top Right -->
                <div class="absolute top-8 right-8 md:top-12 md:right-8">
                    <Button
                        :label="t('campaignsPage.submit')"
                        icon="pi pi-plus"
                        @click="showSubmitDialog = true"
                        class="hidden md:flex shadow-lg"
                    />
                </div>
            </div>
        </div>

        <!-- Mobile Submit Button (Floating) -->
        <div class="fixed bottom-6 right-6 z-20 md:hidden">
            <Button 
                icon="pi pi-plus" 
                rounded
                raised
                size="large"
                class="!w-14 !h-14 !shadow-2xl shadow-primary-500/30"
                @click="showSubmitDialog = true"
            />
        </div>

        <!-- Grid -->
        <div v-if="filteredCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <a 
                v-for="campaign in filteredCampaigns"
                :key="campaign.id"
                :href="campaign.url"
                @mouseenter="handleConfetti($event, campaign.status)"
                @click="campaign.status !== 'victory' && markSigned(campaign.id)"
                target="_blank"
                rel="noopener noreferrer"
                class="group block bg-surface-0 dark:bg-surface-900 border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                :class="[
                    campaign.status === 'victory' 
                        ? 'border-amber-400 dark:border-amber-500/50 shadow-amber-100 dark:shadow-amber-900/10 hover:shadow-amber-200/50 dark:hover:shadow-amber-700/20' 
                        : 'border-surface-200 dark:border-surface-700 hover:border-primary-500/50'
                ]"
            >
                <!-- Thumbnail -->
                <div class="h-48 relative overflow-hidden">
                    <!-- Image -->
                    <img 
                        :src="getCampaignImageUrl(campaign.thumbnail)" 
                        :alt="campaign.title"
                        loading="lazy"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        :class="{ 'opacity-50 grayscale contrast-125': isSigned(campaign.id) && campaign.status !== 'victory' }"
                    />
                    
                    <!-- Overlay Gradient -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                    <!-- Status Badge -->
                    <div class="absolute top-3 right-3 z-10">
                        <Badge 
                            v-if="campaign.status === 'victory'"
                            :value="t('campaignsPage.victory')" 
                            class="!bg-amber-400 !text-black !font-black !text-[11px] shadow-lg shadow-amber-900/30"
                        >
                            <i class="pi pi-trophy mr-1 text-[10px]"></i> {{ t('campaignsPage.victory') }}
                        </Badge>
                        <Badge 
                            v-else
                            :value="campaign.status.toUpperCase()" 
                            :severity="getStatusSeverity(campaign.status)" 
                            class="!text-[10px] !font-bold shadow-sm" 
                        />
                    </div>

                    <!-- Victory Overlay/Effect -->
                     <div v-if="campaign.status === 'victory'" class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-amber-500/10 to-transparent mix-blend-overlay"></div>

                    <!-- Signed Stamp -->
                    <div v-if="isSigned(campaign.id)" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div class="seal text-white px-4 py-1 text-lg tracking-[0.2em] font-black uppercase border-4 border-white/90 bg-black/40 -rotate-12 backdrop-blur-sm shadow-2xl">
                            {{ t('campaignsPage.signed') }}
                        </div>
                    </div>
                </div>

                <div 
                    class="p-5 flex flex-col flex-1 relative"
                    :class="{ 'bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10': campaign.status === 'victory' }"
                >
                    <!-- Countries -->
                    <div class="mb-3 flex items-center gap-2 text-xs font-medium text-surface-500 dark:text-surface-400">
                        <i class="pi pi-globe text-primary-500" :class="{ '!text-amber-600 dark:!text-amber-500': campaign.status === 'victory' }"></i>
                        <span :class="{ 'text-amber-700 dark:text-amber-400': campaign.status === 'victory' }">{{ formatCountries(campaign.countries) }}</span>
                    </div>

                    <h3 class="font-bold text-lg text-surface-900 dark:text-surface-0 mb-1 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ campaign.title }}
                    </h3>

                    <!-- Author -->
                    <div v-if="campaign.author" class="text-xs text-surface-500 dark:text-surface-400 mb-4 font-medium">
                        {{ t('campaignsPage.by') }} {{ campaign.author }}
                    </div>

                    <!-- Progress -->
                    <div v-if="campaign.signatures" class="mb-5 ">
                        <!-- Stats Text -->
                        <div class="flex items-center gap-2 text-xs font-bold text-surface-700 dark:text-surface-200 mb-1.5">
                            <i class="pi pi-users text-primary-500 text-[10px]" />
                            <span>{{ formatNumber(campaign.signatures) }} {{ t('campaignsPage.signatures') }}</span>
                        </div>
                        
                        <!-- Bar -->
                        <div v-if="campaign.goal" class="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                                class="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                :style="{ width: `${getProgress(campaign.signatures, campaign.goal)}%` }"
                            ></div>
                        </div>
                        <div v-if="campaign.goal" class="text-[10px] text-surface-500 mt-1 font-medium">
                            <span class="font-bold text-surface-700 dark:text-surface-300">{{ $nFa(Math.round(getProgress(campaign.signatures, campaign.goal))) }}%</span> {{ t('campaignsPage.to') }} {{ formatNumber(campaign.goal) }}
                        </div>
                    </div>

                    <div class="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-sm font-medium group-hover:translate-x-1 transition-transform duration-300"
                        :class="campaign.status === 'victory' ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30' : 'text-primary-600 dark:text-primary-400'"
                    >
                        <span>{{ isSigned(campaign.id) ? t('campaignsPage.viewCampaign') : (campaign.status === 'victory' ? t('campaignsPage.viewVictory') : t('campaignsPage.signCampaign')) }}</span>
                        <i class="pi text-xs" :class="campaign.status === 'victory' ? 'pi-trophy' : 'pi-arrow-right'"></i>
                    </div>
                </div>
            </a>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800 border-dashed">
            <i class="pi pi-file-excel text-4xl text-surface-400 mb-4 display-block" />
            <p class="text-xl text-surface-500">{{ t('campaignsPage.noCampaigns') }}</p>
        </div>

        <!-- Submit Campaign Dialog -->
        <Dialog 
            v-model:visible="showSubmitDialog" 
            modal 
            :header="t('campaignsPage.dialogTitle')" 
            :style="{ width: '90vw', maxWidth: '700px' }"
            :draggable="false"
            class="submission-dialog"
        >
            <SubmissionsCampaignSubmissionForm @cancel="showSubmitDialog = false" />
        </Dialog>
    </div>
  </div>
</template>

<style scoped>
:deep(.submission-dialog) .p-dialog-header {
    @apply px-6 pt-6 md:px-8 md:pt-8;
}
:deep(.submission-dialog) .p-dialog-content {
    @apply px-6 pb-6 md:px-8 md:pb-8;
}
</style>


