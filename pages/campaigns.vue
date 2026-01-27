<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCampaigns } from '~/composables/useCampaigns';
import { useCampaignSigning } from '~/composables/useCampaignSigning';
import { useCountries } from '~/composables/useCountries';
import { getMediaUrl } from '~/utils/mediaUrl';

const { getAllCampaigns } = useCampaigns();
const allCampaigns = getAllCampaigns();

// Signing Logic
const { loadSigned, isSigned, markSigned } = useCampaignSigning();

onMounted(() => {
  loadSigned();
});

// SEO
useHead({
  title: 'Campaigns - IranArchive',
  meta: [
    { name: 'description', content: 'Petitions and campaigns hosted on Change.org pressuring the Islamic Republic. Join the global call for justice.' }
  ]
});

// Campaign Image URL Generation
const getCampaignImageUrl = (filename: string | undefined) => {
  if (!filename) return '/campaign-placeholder.svg';
  return getMediaUrl({ kind: 'campaign_img', relativePath: filename });
};

// Filtering & Sorting (Default sort: Signed first, then featured)
const filteredCampaigns = computed(() => {
  let result = [...allCampaigns];

  result.sort((a, b) => {
    // 1. Unsigned first (Visual priority)
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

  return result;
});

const getStatusSeverity = (status: string) => {
    switch(status) {
        case 'active': return 'success';
        case 'victory': return 'info';
        case 'closed': return 'secondary';
        case 'unknown': return 'contrast';
        default: return 'secondary';
    }
};

const { getCountryByIso, loadCountries } = useCountries();
loadCountries();

const formatCountries = (codes: string[]) => {
    if (!codes || codes.length === 0) return 'International';
    
    // Resolve names
    const names = codes.map(code => {
        const country = getCountryByIso(code);
        return country ? country.name : code;
    });

    const display = names.slice(0, 3); // Showing 3 names max
    let str = display.join(', ');
    if (names.length > 3) {
        str += ` +${names.length - 3}`;
    }
    return str;
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
                        Campaigns
                    </h1>
                    <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                        Petitions and collective actions pressuring the regime.
                    </p>
                    

                </div>

                <!-- Action Button in Top Right -->
                <div class="absolute top-8 right-8 md:top-12 md:right-8">
                    <NuxtLink to="/docs/campaigns-submission">
                        <Button
                            label="Submit Campaign"
                            icon="pi pi-plus"
                            class="shadow-lg"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Grid -->
        <div v-if="filteredCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <a 
                v-for="campaign in filteredCampaigns"
                :key="campaign.id"
                :href="campaign.url"
                @click="markSigned(campaign.id)"
                target="_blank"
                rel="noopener noreferrer"
                class="group block bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
                <!-- Thumbnail -->
                <div class="h-48 relative overflow-hidden">
                    <!-- Image -->
                    <img 
                        :src="getCampaignImageUrl(campaign.thumbnail)" 
                        :alt="campaign.title"
                        loading="lazy"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        :class="{ 'opacity-50 grayscale contrast-125': isSigned(campaign.id) }"
                    />
                    
                    <!-- Overlay Gradient -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                    <!-- Status Badge -->
                    <div class="absolute top-3 right-3 z-10">
                        <Badge :value="campaign.status.toUpperCase()" :severity="getStatusSeverity(campaign.status)" class="!text-[10px] !font-bold shadow-sm" />
                    </div>

                    <!-- Signed Stamp -->
                    <div v-if="isSigned(campaign.id)" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div class="seal text-white px-4 py-1 text-lg tracking-[0.2em] font-black uppercase border-4 border-white/90 bg-black/40 -rotate-12 backdrop-blur-sm shadow-2xl">
                            Signed
                        </div>
                    </div>
                </div>

                <div class="p-5 flex flex-col flex-1 relative">
                    <!-- Countries -->
                    <div class="mb-3 flex items-center gap-2 text-xs font-medium text-surface-500 dark:text-surface-400">
                        <i class="pi pi-globe text-primary-500"></i>
                        <span>{{ formatCountries(campaign.countries) }}</span>
                    </div>

                    <h3 class="font-bold text-lg text-surface-900 dark:text-surface-0 mb-4 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ campaign.title }}
                    </h3>

                    <div class="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                        <span>View Campaign</span>
                        <i class="pi pi-arrow-right text-xs"></i>
                    </div>
                </div>
            </a>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800 border-dashed">
            <i class="pi pi-file-excel text-4xl text-surface-400 mb-4 display-block" />
            <p class="text-xl text-surface-500">No campaigns found.</p>
        </div>
    </div>
  </div>
</template>


