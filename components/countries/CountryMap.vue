<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import * as d3 from 'd3-geo';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import type { CountryData } from '@/types/countries';
import { getCountryColor } from '@/utils/countryColors';
import worldGeoJSON from '@/assets/geo/world-countries.json';

const props = defineProps<{
  countries: CountryData[];
  mode: 'Unknown' | 'Overall' | 'Diplomacy' | 'IRGC' | 'UN' | 'Security';
  selectedIso: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', iso: string): void;
}>();

// Map state
const width = 960;
const height = 450;
const projection = d3.geoMercator()
  .scale(140)
  .translate([width / 2, height / 1.5]);

const pathGenerator = d3.geoPath().projection(projection);
const svgRef = ref<SVGElement | null>(null);
const gRef = ref<SVGGElement | null>(null);
const zoomBehavior = ref<any>(null);

const currentZoom = ref(1);

// Process features
const features = computed(() => {
  if (!worldGeoJSON || !worldGeoJSON.features) return [];
  
  return worldGeoJSON.features.map((feature: any) => {
    // Helper to get the best ISO code
    const getIsoCode = (props: any) => {
      let iso = props.ISO_A2;
      const isoEh = props.ISO_A2_EH;
      
      // Fix for -99 (France, Norway, etc.)
      if (iso === '-99' && isoEh && isoEh !== '-99') {
        iso = isoEh;
      }
      
      // Fix for Taiwan (CN-TW -> TW)
      if (iso === 'CN-TW') {
        iso = 'TW';
      }

      // Explicit fallback for France/Norway if EH failed (though EH usually works)
      if (props.NAME === 'France') iso = 'FR';
      if (props.NAME === 'Norway') iso = 'NO';
      
      return iso;
    };

    const iso2 = feature.properties.NAME === 'Somaliland' ? 'SOL' : getIsoCode(feature.properties);
    const countryData = props.countries.find(c => c.iso2 === iso2);
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        iso2,
        fill: getCountryColor(countryData, props.mode),
        data: countryData
      }
    };
  });
});

const handleClick = (feature: any) => {
  if (feature.properties.iso2) {
    emit('select', feature.properties.iso2);
  }
};

onMounted(() => {
  if (svgRef.value && gRef.value) {
    const svg = select(svgRef.value);
    const g = select(gRef.value);

    zoomBehavior.value = zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        currentZoom.value = event.transform.k;
      });

    svg.call(zoomBehavior.value as any);
  }
});

const handleZoomIn = () => {
  if (svgRef.value && zoomBehavior.value) {
    select(svgRef.value)
      .transition()
      .call(zoomBehavior.value.scaleBy, 1.5);
  }
};

const handleZoomOut = () => {
  if (svgRef.value && zoomBehavior.value) {
    select(svgRef.value)
      .transition()
      .call(zoomBehavior.value.scaleBy, 0.75);
  }
};

const handleReset = () => {
  if (svgRef.value && zoomBehavior.value) {
     select(svgRef.value)
      .transition()
      .call(zoomBehavior.value.transform, zoomIdentity);
  }
};
</script>

<template>
  <div class="w-full overflow-hidden bg-[#F0F3F4] dark:bg-[#1a202c] rounded-xl border border-surface-200 dark:border-surface-700 relative group touch-none">
    <svg 
      ref="svgRef"
      :viewBox="`0 0 ${width} ${height}`" 
      class="w-full h-auto block cursor-move"
    >
      <g ref="gRef">
        <path
          v-for="feature in features"
          :key="feature.properties.iso2"
          :d="pathGenerator(feature) || undefined"
          :fill="feature.properties.fill"
          :stroke="selectedIso === feature.properties.iso2 ? '#000' : '#fff'"
          :stroke-width="selectedIso === feature.properties.iso2 ? 1.5/currentZoom : 0.5/currentZoom"
          class="transition-opacity duration-200 hover:opacity-80 cursor-pointer outline-none"
          @click.stop="handleClick(feature)"
        >
          <title>{{ feature.properties.NAME }}: {{ feature.properties.data?.derived_tier || 'Unknown' }}</title>
        </path>
      </g>
    </svg>
    
    <!-- Zoom Controls -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click="handleZoomIn" 
        class="bg-surface-0 dark:bg-surface-800 p-2 rounded shadow hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
        title="Zoom In"
      >
        <i class="pi pi-plus"></i>
      </button>
      <button 
        @click="handleZoomOut" 
        class="bg-surface-0 dark:bg-surface-800 p-2 rounded shadow hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
        title="Zoom Out"
      >
        <i class="pi pi-minus"></i>
      </button>
      <button 
        @click="handleReset" 
        class="bg-surface-0 dark:bg-surface-800 p-2 rounded shadow hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
        title="Reset View"
      >
        <i class="pi pi-refresh"></i>
      </button>
    </div>
    
    <div class="absolute bottom-2 left-2 text-[10px] text-surface-500 pointer-events-none">
      Map data: Natural Earth
    </div>
  </div>
</template>

<style scoped>
/* Add any specific SVG styles if needed */
</style>
