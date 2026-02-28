<template>
  <Card class="h-full flex flex-col campaign-card transition-all hover:shadow-lg dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
    <template #title>
      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
          {{ campaign.demand_number }}
        </div>
        <h3 class="text-xl font-bold m-0 text-surface-900 dark:text-surface-0">{{ campaign.title }}</h3>
      </div>
    </template>
    
    <template #content>
      <div class="flex-grow flex flex-col gap-4">
        <p class="text-surface-600 dark:text-surface-300 leading-relaxed min-h-[4rem]">
          {{ campaign.summary }}
        </p>
        
        <div class="flex flex-col gap-2 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg border border-surface-100 dark:border-surface-700 mt-auto">
          <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('Global Alignment') || 'Global Alignment' }}</span>
          <div class="flex gap-4">
            <div class="flex flex-col">
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ alignedCountries }}</span>
              <span class="text-xs text-surface-500">{{ $t('Countries') || 'Countries' }} (L3+)</span>
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ alignedEntities }}</span>
              <span class="text-xs text-surface-500">{{ $t('Entities') || 'Entities' }} (L3+)</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <NuxtLink :to="`/campaigns/${campaign.code}`" class="block w-full">
        <Button 
          :label="$t('View Campaign') || 'View Campaign'"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="w-full"
          outlined
        />
      </NuxtLink>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  countriesData: {
    type: Array,
    default: () => []
  },
  entitiesData: {
    type: Array,
    default: () => []
  }
});

const alignedCountries = computed(() => {
  if (!props.countriesData || !props.campaign) return 0;
  return props.countriesData.filter(c => 
    c.campaign_statuses?.[props.campaign.code]?.level >= 3
  ).length;
});

const alignedEntities = computed(() => {
  if (!props.entitiesData || !props.campaign) return 0;
  return props.entitiesData.filter(e => 
    e.campaign_positions?.[props.campaign.code]?.level >= 3
  ).length;
});
</script>

<style scoped>
.campaign-card :deep(.p-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.campaign-card :deep(.p-card-content) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
