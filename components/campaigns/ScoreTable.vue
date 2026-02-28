<template>
  <div>
    <DataTable 
      :value="items" 
      :paginator="true" 
      :rows="10" 
      responsiveLayout="scroll"
      :globalFilterFields="globalFilterFields"
      class="p-datatable-sm w-full"
      :loading="loading"
      stripedRows
      removableSort
    >
      <Column v-if="entityMode" field="name" :header="$t('Entity') || 'Entity'" sortable class="font-bold">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span class="text-xl" v-if="data.country">{{ getFlagEmoji(data.country) }}</span>
            <NuxtLink :to="`/entities/${data.slug || data.id}`" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ data.names?.primary || data.name || data.id }}
            </NuxtLink>
            <Tag v-if="data.entity_type" :value="data.entity_type" severity="secondary" size="small" />
          </div>
        </template>
      </Column>
      
      <Column v-else field="name" :header="$t('Country') || 'Country'" sortable class="font-bold">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span class="text-xl" v-if="data.iso2">{{ getFlagEmoji(data.iso2) }}</span>
            <NuxtLink :to="`/countries/${data.iso2?.toLowerCase() || ''}`" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ data.name }}
            </NuxtLink>
          </div>
        </template>
      </Column>

      <Column :header="$t('Alignment Level') || 'Alignment Level'" sortable :field="getLevelField" :sortField="getLevelField">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <LevelBadge :level="getLevel(data)" :campaign="campaign" />
            <span class="text-xs text-surface-500 max-w-[200px] truncate" v-if="notesVisible" :title="getNotes(data)">
              {{ getNotes(data) }}
            </span>
          </div>
        </template>
      </Column>
      
      <Column :header="$t('Last Updated') || 'Last Updated'" sortable :field="getLastUpdatedField" :sortField="getLastUpdatedField">
        <template #body="{ data }">
          <span class="text-sm text-surface-600 dark:text-surface-300">{{ getLastUpdated(data) || '-' }}</span>
        </template>
      </Column>

      <Column :header="$t('Evidence') || 'Evidence'">
        <template #body="{ data }">
          <EvidenceListPopover :evidenceIds="getEvidenceIds(data)" />
        </template>
      </Column>

      <Column v-if="showOverall" field="overall_score" :header="$t('Overall Score') || 'Overall Score'" sortable>
        <template #body="{ data }">
          <span class="font-bold">{{ data.overall_score || 0 }} / 24</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LevelBadge from './LevelBadge.vue';
import EvidenceListPopover from './EvidenceListPopover.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  campaign: {
    type: Object,
    required: true // If we are showing a specific campaign columns
  },
  entityMode: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  showOverall: {
    type: Boolean,
    default: false
  },
  notesVisible: {
    type: Boolean,
    default: true
  }
});

const globalFilterFields = computed(() => {
  return props.entityMode ? ['names.primary', 'id'] : ['name', 'iso2'];
});

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Accessors for fields based on entityMode
const getLevel = (item) => {
  const node = props.entityMode ? item.campaign_positions : item.campaign_statuses;
  if (!node || !props.campaign) return 0;
  return node[props.campaign.code]?.level || 0;
};

const getLevelField = (item) => getLevel(item);

const getNotes = (item) => {
  const node = props.entityMode ? item.campaign_positions : item.campaign_statuses;
  if (!node || !props.campaign) return '';
  return node[props.campaign.code]?.notes || '';
};

const getLastUpdated = (item) => {
  const node = props.entityMode ? item.campaign_positions : item.campaign_statuses;
  if (!node || !props.campaign) return '';
  return node[props.campaign.code]?.last_updated || '';
};

const getLastUpdatedField = (item) => getLastUpdated(item);

const getEvidenceIds = (item) => {
  const node = props.entityMode ? item.campaign_positions : item.campaign_statuses;
  if (!node || !props.campaign) return [];
  return node[props.campaign.code]?.evidence_ids || [];
};
</script>
