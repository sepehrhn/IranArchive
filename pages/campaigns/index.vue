<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-12">
      <h1 class="text-4xl font-bold mb-4">{{ $t('Campaigns for Iran') || 'Campaigns for Iran' }}</h1>
      <p class="text-xl text-surface-600 dark:text-surface-300 max-w-3xl">
        {{ $t('The six canonical demands of the Iranian people. We measure international alignment against these concrete policy goals.') || 'The six canonical demands of the Iranian people. We measure international alignment against these concrete policy goals.' }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg">
      <p>{{ $t('Error loading campaigns:') || 'Error loading campaigns:' }} {{ error.message }}</p>
    </div>

    <!-- Campaigns Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CampaignCard 
        v-for="campaign in campaigns" 
        :key="campaign.code" 
        :campaign="campaign"
        :countriesData="countries"
        :entitiesData="entities"
      />
    </div>
  </div>
</template>

<script setup>
import { useFetch, useHead } from '#imports';
import CampaignCard from '~/components/campaigns/CampaignCard.vue';

useHead({
  title: 'Campaigns | IranArchive'
});

// Fetch all indexes parallel
const { data: campaigns, pending: pendingCampaigns, error: errorCampaigns } = await useFetch('/index/campaigns.json');
const { data: countries, pending: pendingCountries, error: errorCountries } = await useFetch('/index/countries.json');
const { data: entities, pending: pendingEntities, error: errorEntities } = await useFetch('/index/entities.json');

const pending = computed(() => pendingCampaigns.value || pendingCountries.value || pendingEntities.value);
const error = computed(() => errorCampaigns.value || errorCountries.value || errorEntities.value);
</script>
