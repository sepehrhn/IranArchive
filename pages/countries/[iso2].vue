<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div v-if="pending" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>
    <div v-else-if="!country" class="flex justify-center py-20 text-center">
      <div>
        <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold">Country Not Found</h2>
        <NuxtLink to="/countries">
          <Button label="Back to Directory" icon="pi pi-arrow-left" class="mt-4" />
        </NuxtLink>
      </div>
    </div>
    <div v-else>
      <!-- Country Profile Header -->
      <div class="mb-10 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl p-8 flex items-center gap-6">
        <div class="text-[5rem] drop-shadow-md">
           {{ getFlagEmoji(country.iso2) }}
        </div>
        <div>
          <h1 class="text-4xl font-bold mb-2">{{ country.name }}</h1>
          <div class="flex items-center gap-4 text-surface-600 dark:text-surface-400">
            <span class="flex items-center gap-1"><i class="pi pi-map-marker"></i> {{ country.region }} / {{ country.subregion }}</span>
            <span class="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold">
              Total Score: {{ country.overall_score || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Campaign Status Grid -->
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <i class="pi pi-check-square text-primary-500"></i>
        {{ $t('Campaign Alignments') || 'Campaign Alignments' }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card v-for="c in campaigns" :key="c.code" class="h-full border border-surface-200 dark:border-surface-700">
          <template #title>
             <NuxtLink :to="`/campaigns/${c.code}`" class="text-lg hover:underline flex items-start gap-2">
               <span class="text-primary-500 text-sm mt-1">#{{ c.demand_number }}</span>
               <span class="leading-tight">{{ c.title }}</span>
             </NuxtLink>
          </template>
          <template #content>
            <div class="flex flex-col h-full gap-4 pt-2">
              <div class="flex items-center gap-3">
                 <LevelBadge :level="country.campaign_statuses?.[c.code]?.level || 0" :campaign="c" />
              </div>
              <p class="text-sm text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 p-3 rounded-md flex-grow border border-surface-100 dark:border-surface-800 shadow-sm font-mono text-xs">
                 {{ country.campaign_statuses?.[c.code]?.notes || 'No documented action.' }}
              </p>
              
              <div class="flex items-center justify-between text-xs text-surface-500 border-t border-surface-200 dark:border-surface-700 pt-3">
                 <span class="flex items-center gap-1">
                   <i class="pi pi-clock text-[10px]"></i>
                   {{ country.campaign_statuses?.[c.code]?.last_updated || 'Unknown' }}
                 </span>
                 <EvidenceListPopover :evidenceIds="country.campaign_statuses?.[c.code]?.evidence_ids || []" />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useFetch, useHead } from '#imports';
import LevelBadge from '~/components/campaigns/LevelBadge.vue';
import EvidenceListPopover from '~/components/campaigns/EvidenceListPopover.vue';

const route = useRoute();
const iso2 = route.params.iso2?.toUpperCase();

const { data: countriesList, pending: pendingCtry } = await useFetch('/index/countries.json');
const { data: campaignsList, pending: pendingCamp } = await useFetch('/index/campaigns.json');

const pending = computed(() => pendingCtry.value || pendingCamp.value);

const campaigns = computed(() => campaignsList.value || []);
const country = computed(() => {
  if (!countriesList.value) return null;
  return countriesList.value.find(c => c.iso2 === iso2);
});

useHead({
  title: computed(() => country.value ? `${country.value.name} | Country Profile` : 'Country Profile | IranArchive')
});

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};
</script>
