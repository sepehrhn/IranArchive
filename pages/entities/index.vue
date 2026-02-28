<template>
  <div class="container mx-auto px-4 py-8 max-w-[1400px]">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">{{ $t('Entities Directory') || 'Entities Directory' }}</h1>
      <p class="text-xl text-surface-600 dark:text-surface-300">
        {{ $t('Explore organizational and individual alignment to the 6 canonical demands.') || 'Explore organizational and individual alignment to the 6 canonical demands.' }}
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 mb-8 flex flex-wrap justify-between gap-4 items-center">
      <div class="flex gap-4 w-full md:w-auto flex-wrap sm:flex-nowrap">
        <IconField iconPosition="left" class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" :placeholder="$t('Search entity...') || 'Search entity...'" class="w-full" />
        </IconField>
        
        <Select 
          v-model="entityType" 
          :options="typeOptions" 
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('Any Type') || 'Any Type'" 
          class="w-full sm:w-48" 
        />
        
        <Select 
          v-model="minScore" 
          :options="scoreOptions" 
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('Min Overall Score') || 'Min Overall Score'" 
          class="w-full sm:w-48" 
        />
      </div>

      <NuxtLink to="/campaigns">
        <Button :label="$t('View Campaign Details') || 'View Campaign Details'" icon="pi pi-flag" outlined />
      </NuxtLink>
    </div>

    <div v-if="pending" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div v-else class="bg-surface-0 dark:bg-surface-800 rounded-xl shadow border border-surface-200 dark:border-surface-700 overflow-hidden">
      <!-- Matrix Table -->
      <DataTable 
        :value="filteredEntities" 
        :paginator="true" 
        :rows="20"
        responsiveLayout="scroll"
        class="p-datatable-sm w-full"
        stripedRows
        removableSort
        :globalFilterFields="['id', 'names.primary', 'names.native']"
      >
        <Column field="names.primary" :header="$t('Entity') || 'Entity'" sortable class="font-bold min-w-[250px]" frozen>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="text-xl" v-if="data.country" :title="data.country">{{ getFlagEmoji(data.country) }}</span>
              <div class="flex flex-col">
                <NuxtLink :to="`/entities/${data.slug || data.id}`" class="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  {{ data.names?.primary || data.id }}
                </NuxtLink>
                <div class="flex gap-1 mt-1">
                  <Tag :value="data.entity_type" severity="secondary" size="small" class="text-[10px]" />
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Dynamic Columns per Campaign -->
        <Column v-for="c in campaigns" :key="c.code" :header="c.title" sortable :field="`campaigns_sort_${c.code}`" class="min-w-[160px] text-center">
          <template #body="{ data }">
            <div class="flex flex-col items-center gap-1">
              <NuxtLink :to="`/campaigns/${c.code}`" class="hover:opacity-80 transition-opacity" :title="data.campaign_positions?.[c.code]?.notes || ''">
                <LevelBadge :level="data.campaign_positions?.[c.code]?.level || 0" :campaign="c" :showLabel="true" />
              </NuxtLink>
              <EvidenceListPopover v-if="data.campaign_positions?.[c.code]?.evidence_ids?.length > 0" :evidenceIds="data.campaign_positions?.[c.code]?.evidence_ids" countOnly />
            </div>
          </template>
        </Column>

        <!-- Overall Score sum -->
        <Column field="overall_score" :header="$t('Total') || 'Total'" sortable class="font-bold border-l border-surface-200 dark:border-surface-700 w-[100px] text-center" alignFrozen="right" frozen>
          <template #body="{ data }">
            <span class="text-lg" :class="data.overall_score > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'">
              {{ data.overall_score || 0 }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFetch, useHead } from '#imports';
import LevelBadge from '~/components/campaigns/LevelBadge.vue';
import EvidenceListPopover from '~/components/campaigns/EvidenceListPopover.vue';

useHead({ title: 'Entities | IranArchive' });

const { data: entitiesList, pending: pendingEnt } = await useFetch('/index/entities.json');
const { data: campaignsList, pending: pendingCamp } = await useFetch('/index/campaigns.json');

const pending = computed(() => pendingEnt.value || pendingCamp.value);

const campaigns = computed(() => campaignsList.value || []);
const entities = computed(() => {
  if (!entitiesList.value) return [];
  return entitiesList.value.map(e => {
    const sortProps = {};
    if (campaigns.value) {
      campaigns.value.forEach(camp => {
        sortProps[`campaigns_sort_${camp.code}`] = e.campaign_positions?.[camp.code]?.level || 0;
      });
    }
    return { ...e, ...sortProps };
  });
});

const searchQuery = ref('');
const entityType = ref('');
const minScore = ref(0);

const typeOptions = computed(() => {
  const types = new Set();
  entities.value.forEach(e => { if (e.entity_type) types.add(e.entity_type); });
  const arr = Array.from(types).map(t => ({ label: t.replace(/_/g, ' '), value: t }));
  arr.unshift({ label: 'Any Type', value: '' });
  return arr;
});

const scoreOptions = [
  { label: 'Any Score', value: 0 },
  { label: 'Score > 5', value: 6 },
  { label: 'Score > 10', value: 11 },
];

const filteredEntities = computed(() => {
  let res = entities.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(e => 
      e.id.toLowerCase().includes(q) || 
      (e.names?.primary && e.names.primary.toLowerCase().includes(q))
    );
  }
  if (entityType.value) {
    res = res.filter(e => e.entity_type === entityType.value);
  }
  if (minScore.value > 0) {
    res = res.filter(e => (e.overall_score || 0) >= minScore.value);
  }
  return res;
});

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};
</script>
