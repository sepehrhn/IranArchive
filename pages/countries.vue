<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCountries } from '@/composables/useCountries';
import { useHead } from '#imports';
import { 
  OverallTier, 
  DiplomacyStatus,
  IRGCDesignationStatus,
  UNPostureStatus,
  SecurityPostureStatus
} from '@/types/countries';
import CountryMap from '@/components/countries/CountryMap.vue';
import CountryLegend from '@/components/countries/CountryLegend.vue';
import CountryDrawer from '@/components/countries/CountryDrawer.vue';
import MethodologyModal from '@/components/countries/MethodologyModal.vue';

// SEO
useHead({
  title: 'Global Pressure Tracker - IranArchive',
  meta: [
    { name: 'description', content: 'Tracking global policy posture towards the Islamic Republic of Iran across Diplomacy, IRGC Designation, UN Accountability, and Security Support.' }
  ]
});

// Data
const { loadCountries, getAllCountries, getCountryByIso, getCountryFlagUrl } = useCountries();
const loading = ref(true);

onMounted(async () => {
  await loadCountries();
  loading.value = false;
});

// State
const searchQuery = ref('');
const colorMode = ref<'Overall' | 'Diplomacy' | 'IRGC' | 'UN' | 'Security'>('Overall');
const selectedTier = ref<OverallTier[]>([]);
const sortMode = ref<'Name' | 'Score' | 'Reviewed'>('Name');

const selectedIso = ref<string | null>(null);
const drawerVisible = ref(false);
const methodologyVisible = ref(false);

const colorModes = [
  { label: 'Overall Pressure', value: 'Overall' },
  { label: 'Diplomacy', value: 'Diplomacy' },
  { label: 'IRGC Designation', value: 'IRGC' },
  { label: 'UN Posture', value: 'UN' },
  { label: 'Security Support', value: 'Security' }
];

const tiers = Object.values(OverallTier).filter(t => t !== OverallTier.Unknown);

// Filtering
const filteredCountries = computed(() => {
  let result = getAllCountries.value;

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.iso2.toLowerCase().includes(q)
    );
  }

  // Tier Filter (Available in Overall mode mostly, but useful always)
  if (selectedTier.value.length > 0) {
    result = result.filter(c => selectedTier.value.includes(c.derived_tier || OverallTier.Unknown));
  }

  // Sorting
  return result.sort((a, b) => {
    if (sortMode.value === 'Score') {
      return (b.derived_scores?.overall || 0) - (a.derived_scores?.overall || 0);
    }
    if (sortMode.value === 'Reviewed') {
      return (b.last_reviewed_at || '').localeCompare(a.last_reviewed_at || '');
    }
    return a.name.localeCompare(b.name);
  });
});

const selectedCountry = computed(() => {
  return selectedIso.value ? getCountryByIso(selectedIso.value) : null;
});

const handleMapSelect = (iso: string) => {
  selectedIso.value = iso;
  drawerVisible.value = true;
};

const handleListSelect = (iso: string) => {
  selectedIso.value = iso;
  drawerVisible.value = true;
  // Scroll map into view on mobile?
};
</script>

<template>
  <div class="min-h-screen pb-12">
    <!-- Header Card -->
    <div class="flex flex-col gap-6 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm mb-6">
      <!-- Title & Main Actions -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
            Global Pressure Tracker
          </h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1 max-w-2xl text-sm md:text-base">
            Visualizing the international community's policy posture towards the Islamic Republic.
          </p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <Button label="Methodology" icon="pi pi-info-circle" severity="secondary" @click="methodologyVisible = true" class="w-full md:w-auto" />
        </div>
      </div>
    </div>

    <!-- Controls Toolbar (Sticky) -->
    <div class="sticky-trigger sticky top-0 z-40 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-surface-0/95 dark:bg-surface-900/95 backdrop-blur-md p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-md mb-8">
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-0">
        <IconField iconPosition="left" class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Search Country" class="w-full" />
        </IconField>
        
        <div class="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <SelectButton v-model="colorMode" :options="colorModes" optionLabel="label" optionValue="value" class="whitespace-nowrap min-w-max" />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
         <Dropdown v-model="sortMode" :options="['Name', 'Score', 'Reviewed']" placeholder="Sort By" class="w-32" />
      </div>
    </div>

      <!-- Map & List Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Map Column -->
        <div class="lg:col-span-8 space-y-4">
          <CountryMap 
            :countries="filteredCountries" 
            :mode="colorMode"
            :selectedIso="selectedIso"
            @select="handleMapSelect"
          />
          <CountryLegend :mode="colorMode" />
        </div>

        <!-- List Column -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col max-h-[600px]">
            <div class="p-4 border-b border-surface-200 dark:border-surface-700 font-semibold flex justify-between items-center">
              <span>Countries ({{ filteredCountries.length }})</span>
            </div>
            <div class="overflow-y-auto flex-1 p-2 space-y-1">
              <div 
                v-for="country in filteredCountries" 
                :key="country.iso2"
                class="p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer flex justify-between items-center group"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800': selectedIso === country.iso2 }"
                @click="handleListSelect(country.iso2)"
              >
                <div class="flex items-center gap-3">
                  <img :src="getCountryFlagUrl(country.iso2)" class="w-6 h-6 object-contain" :alt="country.name" />
                  <span class="font-medium">{{ country.name }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <span class="text-sm font-bold text-surface-500">{{ country.derived_tier }}</span>
                   <i class="pi pi-chevron-right text-surface-400 opacity-0 group-hover:opacity-100 transition"></i>
                </div>
              </div>
              <div v-if="filteredCountries.length === 0" class="p-8 text-center text-surface-500">
                No countries found matching your criteria.
              </div>
            </div>
          </div>
        </div>

      </div>

    <!-- Components -->
    <CountryDrawer 
      v-model:visible="drawerVisible" 
      :country="selectedCountry"
    />
    
    <MethodologyModal v-model:visible="methodologyVisible" />

  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
