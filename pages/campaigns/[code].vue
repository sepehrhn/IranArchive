<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div v-if="pending" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>
    <div v-else-if="error || !campaign" class="flex justify-center py-20">
      <div class="text-center">
        <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold">{{ $t('Campaign Not Found') || 'Campaign Not Found' }}</h2>
        <NuxtLink to="/campaigns">
          <Button :label="$t('Back to Campaigns') || 'Back to Campaigns'" icon="pi pi-arrow-left" class="mt-4" />
        </NuxtLink>
      </div>
    </div>
    <div v-else>
      <!-- Header -->
      <div class="mb-12 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl p-8 relative overflow-hidden">
        <div class="relative z-10 w-full md:w-2/3">
          <div class="flex items-center gap-3 mb-4">
            <span class="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
              {{ $t('Demand') || 'Demand' }} {{ campaign.demand_number }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-surface-900 dark:text-surface-0">{{ campaign.title }}</h1>
          <p class="text-xl text-surface-600 dark:text-surface-300 leading-relaxed">{{ campaign.summary }}</p>
        </div>
      </div>

      <!-- Rubric Info -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">{{ $t('Scoring Rubric') || 'Scoring Rubric' }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div v-for="level in 5" :key="level-1" class="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800">
            <div class="flex items-center gap-2 mb-2">
              <LevelBadge :level="level-1" :campaign="campaign" />
            </div>
            <p class="text-sm text-surface-600 dark:text-surface-300 mt-2">{{ campaign.rubric[`level_${level-1}`] }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content: Scoreboards -->
        <div class="lg:col-span-2 flex flex-col gap-8">
          <!-- Countries Matrix -->
          <div class="bg-surface-0 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-6 overflow-hidden">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold m-0 flex items-center gap-2">
                <i class="pi pi-globe text-primary-500"></i>
                {{ $t('Country Alignment') || 'Country Alignment' }}
              </h2>
            </div>
            
            <ScoreTable 
              :items="countriesWithData" 
              :campaign="campaign" 
              :entityMode="false" 
            />
          </div>

          <!-- Entities Matrix -->
          <div class="bg-surface-0 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-6 overflow-hidden">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold m-0 flex items-center gap-2">
                <i class="pi pi-users text-primary-500"></i>
                {{ $t('Entity Alignment') || 'Entity Alignment' }}
              </h2>
            </div>
            
            <ScoreTable 
              :items="entitiesWithData" 
              :campaign="campaign" 
              :entityMode="true" 
            />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-8">
          <!-- Action Kit -->
          <Card>
            <template #title>
               <div class="flex items-center gap-2">
                  <i class="pi pi-bolt text-yellow-500"></i>
                  {{ $t('Action Kit') || 'Action Kit' }}
               </div>
            </template>
            <template #content>
              <p class="text-surface-600 dark:text-surface-300 text-sm mb-4">
                {{ $t('Help advance this campaign by taking action.') || 'Help advance this campaign by taking action.' }}
              </p>
              <ul class="flex flex-col gap-3">
                <li>
                  <Button :label="$t('Email Officials') || 'Email Officials'" icon="pi pi-envelope" size="small" class="w-full" outlined />
                </li>
                <li>
                  <Button :label="$t('Share this campaign') || 'Share this campaign'" icon="pi pi-share-alt" size="small" class="w-full" outlined />
                </li>
              </ul>
            </template>
          </Card>

          <!-- Timeline Updates -->
          <Card>
            <template #title>
              <div class="flex items-center gap-2">
                 <i class="pi pi-history text-blue-500"></i>
                 {{ $t('Recent Updates') || 'Recent Updates' }}
              </div>
            </template>
            <template #content>
              <div v-if="campaignUpdates.length === 0" class="text-sm text-surface-500 italic">
                {{ $t('No updates yet.') || 'No updates yet.' }}
              </div>
              <ul v-else class="list-none p-0 m-0 flex flex-col gap-4">
                <li v-for="update in campaignUpdates" :key="update.date + update.subject.id" class="border-l-2 border-primary-500 pl-3">
                  <span class="text-xs text-surface-500 font-mono">{{ update.date }}</span>
                  <p class="text-sm my-1 font-semibold text-surface-900 dark:text-surface-0">
                    <NuxtLink v-if="update.subject.kind === 'country'" :to="`/countries/${update.subject.id}`" class="hover:underline">{{ update.subject.id.toUpperCase() }}</NuxtLink>
                    <NuxtLink v-else :to="`/entities/${update.subject.id}`" class="hover:underline">{{ update.subject.id }}</NuxtLink>
                    moved from L{{ update.change?.from_level }} to L{{ update.change?.to_level }}
                  </p>
                  <p class="text-xs text-surface-600 dark:text-surface-300">{{ update.summary }}</p>
                </li>
              </ul>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useFetch, useHead } from '#imports';
import LevelBadge from '~/components/campaigns/LevelBadge.vue';
import ScoreTable from '~/components/campaigns/ScoreTable.vue';

const route = useRoute();
const campaignCode = route.params.code;

// Fetch data
const { data: campaignsList, pending: pendingC } = await useFetch('/index/campaigns.json');
const { data: countriesList, pending: pendingCtry } = await useFetch('/index/countries.json');
const { data: entitiesList, pending: pendingEnt } = await useFetch('/index/entities.json');
const { data: updatesList, pending: pendingUpd } = await useFetch('/index/updates.json');

const pending = computed(() => pendingC.value || pendingCtry.value || pendingEnt.value || pendingUpd.value);

const campaign = computed(() => {
  if (!campaignsList.value) return null;
  return campaignsList.value.find(c => c.code === campaignCode);
});

const error = computed(() => !campaign.value);

useHead({
  title: computed(() => campaign.value ? `${campaign.value.title} | IranArchive` : 'Campaign Not Found | IranArchive')
});

// Filter items that have status level > 0 OR explicitly set to 0 but with notes
// But actually we want everyone who is relevant. Let's show everyone, since ScoreTable has sorting and pagination.
// Wait, to keep it clean, maybe we filter those whose level is > 0 OR have notes that don't match the default.
const defaultNote = "No documented action in IranArchive yet.";

const countriesWithData = computed(() => {
  if (!countriesList.value) return [];
  return countriesList.value.filter(c => {
    const status = c.campaign_statuses?.[campaignCode];
    if (!status) return false;
    return status.level > 0 || (status.notes && status.notes !== defaultNote);
  });
});

const entitiesWithData = computed(() => {
  if (!entitiesList.value) return [];
  return entitiesList.value.filter(e => {
    const status = e.campaign_positions?.[campaignCode];
    if (!status) return false;
    return status.level > 0 || (status.notes && status.notes !== defaultNote);
  });
});

const campaignUpdates = computed(() => {
  if (!updatesList.value) return [];
  return updatesList.value.filter(u => u.campaign === campaignCode).slice(0, 10);
});
</script>
