<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CountryData } from '@/types/countries';

const { t } = useI18n();
import { 
  getDiplomacyLabel, getMissionStatusLabel, getExpelledDiplomatsLabel,
  getIRGCLabel, 
  getUNPostureLabel, 
  getSecurityPostureLabel
} from '@/utils/countryLabels';
import { 
  TIER_COLORS, TIER_LABELS, DIPLOMACY_COLORS, IRGC_COLORS, UN_COLORS, SECURITY_COLORS 
} from '@/utils/countryColors';
import { useCampaigns } from '~/composables/useCampaigns';
import { useCountries } from '@/composables/useCountries';

const { getCampaignsForCountry } = useCampaigns();
const { getCountryFlagUrl } = useCountries();

const props = defineProps<{
  visible: boolean;
  country: CountryData | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// Helper for task progress
const getTaskStatus = (
  isCompleted: boolean, 
  isInProgress: boolean, 
  isOpposed = false
) => {
  if (isCompleted) return { label: 'Completed', color: 'green', icon: 'pi pi-check-circle' };
  if (isOpposed) return { label: 'Opposed', color: 'red', icon: 'pi pi-times-circle' };
  if (isInProgress) return { label: 'In Progress', color: 'orange', icon: 'pi pi-spinner' };
  return { label: 'Not Started', color: 'gray', icon: 'pi pi-circle' };
};

// Logic for tasks
const tasks = computed(() => {
  if (!props.country) return [];
  const c = props.country;

  // 1. Expel Diplomats
  const dip = c.diplomacy;
  const expelCompleted = dip.expelled_diplomats === 'all' || 
                        (['severed', 'no_resident_mission'].includes(dip.status) && dip.iran_mission_status === 'none');
  const expelProgress = ['limited', 'major'].includes(dip.expelled_diplomats) || dip.status === 'downgraded';
  
  // 2. IRGC
  const irgc = c.irgc_designation;
  const irgcCompleted = irgc.status === 'designated_full';
  const irgcProgress = irgc.status === 'designated_partial' || irgc.status === 'under_consideration';
  
  // 3. UN
  const un = c.un_posture;
  const unCompleted = un.status === 'leads_accountability';
  const unProgress = un.status === 'supports_accountability';
  const unNotStarted = ['neutral_inconsistent', 'opposes_accountability', 'protects_regime'].includes(un.status);

  // 4. Security
  const sec = c.security_posture;
  const secCompleted = sec.status === 'explicit_support';
  const secProgress = sec.status === 'conditional_support';
  const secOpposed = sec.status === 'opposed';

  return [
    { name: 'Expel Diplomats', ...getTaskStatus(expelCompleted, expelProgress) },
    { name: 'IRGC Designation', ...getTaskStatus(irgcCompleted, irgcProgress) },
    { name: 'UN Accountability', ...getTaskStatus(unCompleted, unProgress) },
    { name: 'Security Support', ...getTaskStatus(secCompleted, secProgress, secOpposed) },
  ];
});

// Helper for formatted date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const relevantCampaigns = computed(() => {
  if (!props.country) return [];
  return getCampaignsForCountry(props.country.iso2);
});

</script>

<template>
  <Drawer v-model:visible="isVisible" position="right" class="w-full md:w-[480px] p-0" :showCloseIcon="true">
    <template #header>
      <div class="flex items-center gap-3" v-if="country">
        <img :src="getCountryFlagUrl(country.iso2)" class="w-8 h-8 object-contain" :alt="country.name" />
        <h2 class="text-xl font-bold">{{ t(`countries.${country.iso2}`, country.name) }}</h2>
        <div class="px-2 py-1 rounded text-white text-xs font-bold" 
             :style="{ backgroundColor: TIER_COLORS[country.derived_tier || 'Unknown'] }">
          {{ country.derived_tier || '?' }}
        </div>
      </div>
    </template>

    <div v-if="country" class="px-1 py-2 space-y-6">
      <!-- Last Reviewed -->
      <div class="text-xs text-surface-500 flex justify-between">
        <span>Last reviewed: {{ formatDate(country.last_reviewed_at) }}</span>
        <span v-if="country.reviewer">By: {{ country.reviewer }}</span>
      </div>

      <!-- Score Breakdown -->
      <div class="bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
        <div class="flex justify-between items-end mb-2">
          <span class="font-semibold text-sm">Pressure Score</span>
          <span class="text-2xl font-mono font-bold">{{ country.derived_scores?.overall }}/100</span>
        </div>
        <div class="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-full overflow-hidden">
          <div class="h-full bg-primary-500" :style="{ width: `${country.derived_scores?.overall || 0}%` }"></div>
        </div>
        <div v-if="country.scores.force_tier" class="mt-2 text-orange-500 text-xs flex items-center gap-1">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Tier manually overridden due to exceptional circumstances.</span>
        </div>
      </div>

      <!-- Objectives Accordion/Details -->
      <div class="space-y-4">
        
        <!-- Diplomacy -->
        <div class="border-l-4 pl-3" :style="{ borderColor: DIPLOMACY_COLORS[country.diplomacy.status] }">
          <h3 class="font-bold text-sm uppercase text-surface-500">Diplomacy</h3>
          <div class="text-lg font-medium">{{ getDiplomacyLabel(country.diplomacy.status) }}</div>
          <div class="text-sm mt-1 mb-2">
             Mission: <span class="font-semibold">{{ getMissionStatusLabel(country.diplomacy.iran_mission_status) }}</span> • 
             Expelled: <span class="font-semibold">{{ getExpelledDiplomatsLabel(country.diplomacy.expelled_diplomats) }}</span>
          </div>
          <p class="text-sm text-surface-700 dark:text-surface-300">{{ country.diplomacy.summary }}</p>
        </div>

        <!-- IRGC -->
        <div class="border-l-4 pl-3" :style="{ borderColor: IRGC_COLORS[country.irgc_designation.status] }">
          <h3 class="font-bold text-sm uppercase text-surface-500">IRGC Designation</h3>
          <div class="text-lg font-medium">{{ getIRGCLabel(country.irgc_designation.status) }}</div>
          <p class="text-sm mt-1 text-surface-700 dark:text-surface-300">{{ country.irgc_designation.summary }}</p>
        </div>

        <!-- UN -->
        <div class="border-l-4 pl-3" :style="{ borderColor: UN_COLORS[country.un_posture.status] }">
          <h3 class="font-bold text-sm uppercase text-surface-500">UN Posture</h3>
          <div class="text-lg font-medium">{{ getUNPostureLabel(country.un_posture.status) }}</div>
          <div class="flex flex-wrap gap-1 my-2">
            <span v-if="country.un_posture.supports_un_investigations" class="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded">Investigations</span>
            <span v-if="country.un_posture.supports_sanctions_or_condemnation" class="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded">Sanctions</span>
          </div>
          <p class="text-sm text-surface-700 dark:text-surface-300">{{ country.un_posture.summary }}</p>
        </div>

        <!-- Security -->
        <div class="border-l-4 pl-3" :style="{ borderColor: SECURITY_COLORS[country.security_posture.status] }">
          <h3 class="font-bold text-sm uppercase text-surface-500">Security Support</h3>
          <div class="text-lg font-medium">{{ getSecurityPostureLabel(country.security_posture.status) }}</div>
          <p class="text-sm mt-1 text-surface-700 dark:text-surface-300">{{ country.security_posture.summary }}</p>
        </div>

      </div>

      <!-- Task Progress -->
      <div>
        <h3 class="font-bold text-lg mb-3">Action Plan Status</h3>
        <div class="space-y-2">
          <div v-for="task in tasks" :key="task.name" class="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-800 rounded">
            <span class="text-sm font-medium">{{ task.name }}</span>
            <div class="flex items-center gap-2">
              <i :class="task.icon" :style="{ color: task.color }"></i>
              <span class="text-xs uppercase font-bold" :style="{ color: task.color }">{{ task.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaigns -->
      <div v-if="relevantCampaigns.length > 0">
        <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
            <span>Campaigns</span>
            <span class="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{{ relevantCampaigns.length }}</span>
        </h3>
        <div class="space-y-3">
          <a
            v-for="camp in relevantCampaigns"
            :key="camp.id"
            :href="camp.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden hover:shadow-md hover:border-primary-500/50 transitionLink group"
          >
            <div class="flex">
                <div class="w-24 h-auto bg-surface-100 dark:bg-surface-700 relative shrink-0">
                    <img 
                        :src="camp.thumbnailUrl || '/campaign-placeholder.svg'" 
                        :alt="camp.title"
                        loading="lazy"
                        class="w-full h-full object-cover absolute inset-0"
                    />
                </div>
                <div class="p-3 flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-2 mb-1">
                        <h4 class="font-bold text-sm text-surface-900 dark:text-surface-0 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {{ camp.title }}
                        </h4>
                         <span v-if="camp.status === 'active'" class="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1"></span>
                    </div>
                    <div class="flex justify-end">
                         <span class="text-[10px] font-bold text-primary-600 dark:text-primary-400 flex items-center">
                            Open <i class="pi pi-arrow-up-right ml-1 text-[9px]"></i>
                         </span>
                    </div>
                </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Evidence -->
      <div v-if="country.evidence.length > 0">
        <h3 class="font-bold text-lg mb-3">Evidence & Sources</h3>
        <div class="space-y-3">
          <div v-for="(ev, idx) in country.evidence" :key="idx" class="border border-surface-200 dark:border-surface-700 p-3 rounded hover:bg-surface-50 dark:hover:bg-surface-800 transition">
            <a :href="ev.url" target="_blank" rel="noopener noreferrer" class="block group">
              <div class="text-sm font-bold text-primary-600 group-hover:underline mb-1">{{ ev.title }}</div>
              <div class="text-xs text-surface-500 mb-2">{{ ev.publisher }} • {{ formatDate(ev.date) }}</div>
              <p class="text-xs text-surface-700 dark:text-surface-300">{{ ev.summary }}</p>
            </a>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-surface-500 italic">
        No specific evidence entries listed.
      </div>

    </div>
  </Drawer>
</template>
