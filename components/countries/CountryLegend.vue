<script setup lang="ts">
import { computed } from 'vue';
import { 
  OverallTier, 
  DiplomacyStatus, 
  IRGCDesignationStatus, 
  UNPostureStatus, 
  SecurityPostureStatus 
} from '@/types/countries';
import { 
  getDiplomacyLabel,
  getIRGCLabel,
  getUNPostureLabel,
  getSecurityPostureLabel
} from '@/utils/countryLabels';
import {
  TIER_COLORS as C_TIER,
  TIER_LABELS,
  DIPLOMACY_COLORS as C_DIP,
  IRGC_COLORS as C_IRGC,
  UN_COLORS as C_UN,
  SECURITY_COLORS as C_SEC
} from '@/utils/countryColors';

const props = defineProps<{
  mode: 'Unknown' | 'Overall' | 'Diplomacy' | 'IRGC' | 'UN' | 'Security';
}>();

const allItems = computed(() => {
  let items: { color: string; label: string }[] = [];
  
  switch (props.mode) {
    case 'Diplomacy':
      items = Object.values(DiplomacyStatus).filter(s => s !== DiplomacyStatus.Unknown).map(status => ({
        color: C_DIP[status],
        label: getDiplomacyLabel(status)
      }));
      break;
    case 'IRGC':
      items = Object.values(IRGCDesignationStatus).filter(s => s !== IRGCDesignationStatus.Unknown).map(status => ({
        color: C_IRGC[status],
        label: getIRGCLabel(status)
      }));
      break;
    case 'UN':
      items = Object.values(UNPostureStatus).filter(s => s !== UNPostureStatus.Unknown).map(status => ({
        color: C_UN[status],
        label: getUNPostureLabel(status)
      }));
      break;
    case 'Security':
      items = Object.values(SecurityPostureStatus).filter(s => s !== SecurityPostureStatus.Unknown).map(status => ({
        color: C_SEC[status],
        label: getSecurityPostureLabel(status)
      }));
      break;
    case 'Overall':
    default:
      items = Object.values(OverallTier).filter(t => t !== OverallTier.Unknown).map(tier => ({
        color: C_TIER[tier],
        label: TIER_LABELS[tier]
      }));
      break;
  }
  
  // Add Unknown to the end for all modes
  items.push({
    color: '#D7DBDD',
    label: 'Unknown / Not Assessed'
  });
  
  return items;
});

const columns = computed(() => {
  const items = allItems.value;
  // Special case for Overall to match user request: A-D in col 1 (4 items), E-Unknown in col 2 (4 items)
  // Overall items (excluding known) is 7. +1 Unknown = 8. Split 4/4.
  const mid = Math.ceil(items.length / 2);
  return [
    items.slice(0, mid),
    items.slice(mid)
  ];
});
</script>

<template>
  <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
    <h3 class="text-sm font-semibold mb-3 text-surface-900 dark:text-surface-0">
      Legend: {{ mode === 'Overall' ? 'Pressure Tiers' : mode + ' Posture' }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      <div v-for="(col, idx) in columns" :key="idx" class="flex flex-col gap-2">
        <div v-for="item in col" :key="item.label" class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></span>
          <span class="text-surface-700 dark:text-surface-200">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
