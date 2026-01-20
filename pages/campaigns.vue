<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampaigns } from '~/composables/useCampaigns';
import { useCountries } from '~/composables/useCountries';
import type { CampaignStatus } from '~/types/campaign';

const { getAllCampaigns } = useCampaigns();
const allCampaigns = getAllCampaigns();

// SEO
useHead({
  title: 'Campaigns - IranArchive',
  meta: [
    { name: 'description', content: 'Petitions and campaigns hosted on Change.org pressuring the Islamic Republic. Join the global call for justice.' }
  ]
});

// State
const searchQuery = ref('');
const statusFilter = ref<CampaignStatus | 'all'>('all');
const sortOption = ref<'featured' | 'newest' | 'title'>('featured');

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Victory', value: 'victory' },
  { label: 'Closed', value: 'closed' },
  { label: 'Unknown', value: 'unknown' }
];

const sortOptions = [
  { label: 'Featured / Recommended', value: 'featured' },
  { label: 'Title (A-Z)', value: 'title' }
];

// Filtering & Sorting
const filteredCampaigns = computed(() => {
  let result = allCampaigns;

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => 
      c.title.toLowerCase().includes(q)
    );
  }

  // Status Filter
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.status === statusFilter.value);
  }

// Sorting
  // Create a copy to sort
  result = [...result].sort((a, b) => {
    if (sortOption.value === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default: Featured
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    
    // Fallback to Created Date if present, else A-Z by ID
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
    <div class="container mx-auto px-4 mt-6">
      
      <!-- Header Card -->
      <div class="flex flex-col gap-6 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm mb-6">
        
        <!-- Title & Main Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
              Campaigns
            </h1>
            <p class="text-surface-500 dark:text-surface-400 mt-1 max-w-2xl text-sm md:text-base">
              Petitions and collective actions pressuring the regime.
            </p>
          </div>
          <div class="flex gap-2 w-full md:w-auto">
             <div class="text-xs text-surface-500 italic max-w-xs text-right hidden md:block">
                Petitions are hosted on Change.org;<br>IranArchive is not affiliated.
             </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center pt-2">
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-0">
             <IconField iconPosition="left" class="w-full sm:w-64">
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Search campaigns" class="w-full" />
             </IconField>
          </div>

          <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
             <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Status" class="w-full sm:w-48" />
             <Select v-model="sortOption" :options="sortOptions" optionLabel="label" optionValue="value" placeholder="Sort By" class="w-full sm:w-64" />
          </div>
        </div>
      </div>

        <!-- Grid -->
        <div v-if="filteredCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <a 
                v-for="campaign in filteredCampaigns"
                :key="campaign.id"
                :href="campaign.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group block bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
                <!-- Thumbnail -->
                <div class="aspect-video w-full bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                    <img 
                        :src="campaign.thumbnailUrl || '/campaign-placeholder.svg'" 
                        :alt="campaign.title"
                        loading="lazy"
                        class="w-full h-full object-cover"
                    />
                     <div class="absolute top-3 right-3 flex gap-2">
                        <Badge :value="campaign.status.toUpperCase()" :severity="getStatusSeverity(campaign.status)" />
                     </div>
                </div>

                <div class="p-5 flex flex-col h-[calc(100%-aspect-video)]">
                    <h3 class="font-bold text-lg text-surface-900 dark:text-surface-0 mb-2 line-clamp-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ campaign.title }}
                    </h3>

                    <div class="space-y-3 mt-auto">
                        <div class="flex justify-between items-center text-xs text-surface-500">
                             <span>{{ formatCountries(campaign.countries) }}</span>
                        </div>
                        
                        <Button label="Open Campaign" icon="pi pi-external-link" size="small" outlined class="w-full" />
                    </div>
                </div>
            </a>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800 border-dashed">
            <i class="pi pi-file-excel text-4xl text-surface-400 mb-4 display-block" />
            <p class="text-xl text-surface-500">No campaigns found matching your criteria.</p>
            <Button label="Clear Filters" text class="mt-2" @click="() => { searchQuery=''; statusFilter='all'; }" />
        </div>
    </div>
  </div>
</template>
