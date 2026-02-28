<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div v-if="pending" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>
    <div v-else-if="!entity" class="flex justify-center py-20 text-center">
      <div>
        <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold">Entity Not Found</h2>
        <NuxtLink to="/entities">
          <Button label="Back to Directory" icon="pi pi-arrow-left" class="mt-4" />
        </NuxtLink>
      </div>
    </div>
    <div v-else>
      <!-- Entity Profile Header -->
      <div class="mb-10 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl p-8">
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="flex-grow">
            <h1 class="text-4xl font-bold mb-2">{{ entity.names?.primary || entity.id }}</h1>
            <h2 v-if="entity.names?.native" class="text-2xl text-surface-600 dark:text-surface-400 mb-4">{{ entity.names.native }}</h2>
            
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <Tag :value="entity.entity_type" severity="secondary" />
              <div v-if="entity.country" class="flex items-center gap-1 text-surface-600 font-medium bg-surface-200 dark:bg-surface-800 px-2 py-1 rounded">
                <span>{{ getFlagEmoji(entity.country) }}</span>
                <span>{{ entity.country }}</span>
              </div>
              <span class="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold ml-auto">
                Total Score: {{ entity.overall_score || 0 }}
              </span>
            </div>
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
                 <LevelBadge :level="entity.campaign_positions?.[c.code]?.level || 0" :campaign="c" />
              </div>
              <p class="text-sm text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 p-3 rounded-md flex-grow border border-surface-100 dark:border-surface-800 shadow-sm font-mono text-xs">
                 {{ entity.campaign_positions?.[c.code]?.notes || 'No documented action.' }}
              </p>
              
              <div class="flex items-center justify-between text-xs text-surface-500 border-t border-surface-200 dark:border-surface-700 pt-3">
                 <span class="flex items-center gap-1">
                   <i class="pi pi-clock text-[10px]"></i>
                   {{ entity.campaign_positions?.[c.code]?.last_updated || 'Unknown' }}
                 </span>
                 <EvidenceListPopover :evidenceIds="entity.campaign_positions?.[c.code]?.evidence_ids || []" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Actions Timeline -->
      <div v-if="entityUpdates.length > 0">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <i class="pi pi-history text-primary-500"></i>
          {{ $t('Recent Actions & Updates') || 'Recent Actions & Updates' }}
        </h2>
        <div class="bg-surface-0 dark:bg-surface-800 p-6 rounded-xl border border-surface-200 dark:border-surface-700">
          <ul class="list-none p-0 m-0 flex flex-col gap-6">
            <li v-for="update in entityUpdates" :key="update.date + update.campaign" class="border-l-2 border-primary-500 pl-4 relative">
              <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary-500"></div>
              <span class="text-sm text-surface-500 font-mono block mb-1">{{ update.date }}</span>
              <p class="text-base my-0 font-semibold text-surface-900 dark:text-surface-0">
                <NuxtLink :to="`/campaigns/${update.campaign}`" class="text-primary-600 dark:text-primary-400 hover:underline">
                  {{ update.campaign }}
                </NuxtLink>
                changed from L{{ update.change?.from_level }} to L{{ update.change?.to_level }}
              </p>
              <p class="text-sm text-surface-600 dark:text-surface-300 mt-2">{{ update.summary }}</p>
              <div class="mt-3 flex gap-2" v-if="update.evidence_ids && update.evidence_ids.length > 0">
                <Badge :value="`${update.evidence_ids.length} Evidence`" severity="secondary" />
              </div>
            </li>
          </ul>
        </div>
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
const entityId = route.params.id;

const { data: entitiesList, pending: pendingEnt } = await useFetch('/index/entities.json');
const { data: campaignsList, pending: pendingCamp } = await useFetch('/index/campaigns.json');
const { data: updatesList, pending: pendingUpd } = await useFetch('/index/updates.json');

const pending = computed(() => pendingEnt.value || pendingCamp.value || pendingUpd.value);

const campaigns = computed(() => campaignsList.value || []);
const entity = computed(() => {
  if (!entitiesList.value) return null;
  return entitiesList.value.find(e => e.id === entityId || e.slug === entityId);
});

const entityUpdates = computed(() => {
  if (!updatesList.value || !entity.value) return [];
  return updatesList.value.filter(u => u.subject.kind === 'entity' && (u.subject.id === entity.value.id || u.subject.id === entity.value.slug));
});

useHead({
  title: computed(() => entity.value ? `${entity.value.names?.primary || entity.value.id} | Entity Profile` : 'Entity Profile | IranArchive')
});

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};
</script>
