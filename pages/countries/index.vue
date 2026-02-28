<template>
  <div class="container mx-auto px-4 py-8 max-w-[1400px]">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">{{ $t('Country Alignment Data') || 'Country Alignment Data' }}</h1>
      <p class="text-xl text-surface-600 dark:text-surface-300">
        {{ $t('Explore how nations align with the 6 canonical demands of the Iranian people.') || 'Explore how nations align with the 6 canonical demands of the Iranian people.' }}
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 mb-8 flex flex-wrap justify-between gap-4 items-center">
      <div class="flex gap-4 w-full md:w-auto">
        <IconField iconPosition="left" class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" :placeholder="$t('Search country...') || 'Search country...'" class="w-full" />
        </IconField>
        
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
        :value="filteredCountries" 
        :paginator="true" 
        :rows="20"
        responsiveLayout="scroll"
        class="p-datatable-sm w-full"
        stripedRows
        removableSort
        :globalFilterFields="['name', 'iso2']"
      >
        <Column field="name" :header="$t('Country') || 'Country'" sortable class="font-bold min-w-[200px]" frozen>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="text-xl" v-if="data.iso2">{{ getFlagEmoji(data.iso2) }}</span>
              <NuxtLink :to="`/countries/${data.iso2?.toLowerCase() || ''}`" class="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                {{ data.name }}
              </NuxtLink>
            </div>
          </template>
        </Column>

        <!-- Dynamic Columns per Campaign -->
        <Column v-for="c in campaigns" :key="c.code" :header="c.title" sortable :field="`campaigns_sort_${c.code}`" class="min-w-[160px] text-center">
          <template #body="{ data }">
            <div class="flex flex-col items-center gap-1">
              <NuxtLink :to="`/campaigns/${c.code}`" class="hover:opacity-80 transition-opacity" :title="data.campaign_statuses?.[c.code]?.notes || ''">
                <LevelBadge :level="data.campaign_statuses?.[c.code]?.level || 0" :campaign="c" :showLabel="true" />
              </NuxtLink>
              <EvidenceListPopover v-if="data.campaign_statuses?.[c.code]?.evidence_ids?.length > 0" :evidenceIds="data.campaign_statuses?.[c.code]?.evidence_ids" countOnly />
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

useHead({ title: 'Countries | IranArchive' });

const { data: countriesList, pending: pendingCtry } = await useFetch('/index/countries.json');
const { data: campaignsList, pending: pendingCamp } = await useFetch('/index/campaigns.json');

const pending = computed(() => pendingCtry.value || pendingCamp.value);

const campaigns = computed(() => campaignsList.value || []);
const countries = computed(() => {
  if (!countriesList.value) return [];
  return countriesList.value.map(c => {
    const sortProps = {};
    if (campaigns.value) {
      campaigns.value.forEach(camp => {
        sortProps[`campaigns_sort_${camp.code}`] = c.campaign_statuses?.[camp.code]?.level || 0;
      });
    }
    return { ...c, ...sortProps };
  });
});

const searchQuery = ref('');
const minScore = ref(0);
const scoreOptions = [
  { label: 'Any Score', value: 0 },
  { label: 'Score > 5', value: 6 },
  { label: 'Score > 10', value: 11 },
  { label: 'Score > 15', value: 16 },
];

const filteredCountries = computed(() => {
  let res = countries.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(c => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase().includes(q));
  }
  if (minScore.value > 0) {
    res = res.filter(c => (c.overall_score || 0) >= minScore.value);
  }
  return res;
});

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};
</script>
