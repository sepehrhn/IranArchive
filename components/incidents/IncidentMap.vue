<template>
  <div ref="mapContainer" class="w-full h-full min-h-[12rem] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-700">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
      <div class="flex flex-col items-center text-gray-400">
        <i class="pi pi-spin pi-spinner text-2xl mb-2"></i>
        <span class="text-xs">Loading Map...</span>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10 px-4">
      <div class="text-center text-gray-500">
        <i class="pi pi-exclamation-triangle text-2xl mb-2 text-yellow-500"></i>
        <p class="text-xs">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const props = defineProps<{
  lat: number;
  lng: number;
  zoom?: number;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const config = useRuntimeConfig();

let map: google.maps.Map | null = null;
let marker: google.maps.Marker | null = null;

onMounted(async () => {
  const apiKey = config.public.googleMapsApiKey;
  
  if (!apiKey) {
    error.value = 'Google Maps API Key is missing.';
    loading.value = false;
    return;
  }

  try {
    // Determine if we need to set options (only if not already loaded essentially, 
    // but setOptions handles some idempotency or we trust it doesn't crash if called again with same params before load)
    // Actually, to be safe, we can just call it. Usage of js-api-loader implies it manages the bootstrap.
    // However, the types say 'key' and 'v' instead of 'apiKey' and 'version'.
    
    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    const { Map } = await importLibrary('maps');
    const { Marker } = await importLibrary('marker') as google.maps.MarkerLibrary;

    if (mapContainer.value) {
      map = new Map(mapContainer.value, {
        center: { lat: props.lat, lng: props.lng },
        zoom: props.zoom || 13,
        mapId: 'DEMO_MAP_ID', 
        disableDefaultUI: true, 
        zoomControl: true, 
      });

      marker = new Marker({
        position: { lat: props.lat, lng: props.lng },
        map: map,
      });

      loading.value = false;
    }
  } catch (e: any) {
    console.error('Error loading Google Maps:', e);
    // If it's already loaded, maybe we don't need setOptions, but importLibrary should still work?
    // If setOptions fails because it was already called, we might still proceed.
    // But usually it warns.
    
    error.value = 'Failed to load map.';
    loading.value = false;
  }
});

// Watch for prop changes
watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  if (map && marker) {
    const pos = { lat: newLat as number, lng: newLng as number };
    map.setCenter(pos);
    marker.setPosition(pos);
  }
});
</script>
