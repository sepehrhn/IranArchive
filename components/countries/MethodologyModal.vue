<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { computed } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});
</script>

<template>
  <Dialog v-model:visible="isVisible" modal header="Methodology & Scoring" :style="{ width: '50rem' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" :draggable="false">
    <div class="space-y-4 text-surface-700 dark:text-surface-200">
      <p>
        The <strong>Global Pressure Tracker</strong> evaluates each country’s policy posture toward the Islamic Republic of Iran across four key objectives. 
        Scores are aggregated to assign a pressure Tier (A–G).
      </p>

      <h3 class="font-bold text-lg">Scoring Breakdown (0–100)</h3>
      <ul class="list-disc list-inside space-y-1 ml-2">
        <li><strong>Diplomacy (30 pts):</strong> Status of diplomatic relations and mission presence.</li>
        <li><strong>IRGC Designation (25 pts):</strong> Formal terrorist designation of the IRGC.</li>
        <li><strong>UN Posture (25 pts):</strong> Voting record and support for accountability mechanisms.</li>
        <li><strong>Security (20 pts):</strong> Support for international security actions.</li>
      </ul>

      <h3 class="font-bold text-lg">Tiers</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#145A32]"></div> <strong>Tier A (80-100):</strong> Maximum Pressure</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#1E8449]"></div> <strong>Tier B (65-79):</strong> High Pressure</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#7DCEA0]"></div> <strong>Tier C (50-64):</strong> Targeted Pressure</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#95A5A6]"></div> <strong>Tier D (35-49):</strong> Neutral / Mixed</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#F5CBA7]"></div> <strong>Tier E (20-34):</strong> Engagement</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#E67E22]"></div> <strong>Tier F (10-19):</strong> Supportive Engagement</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-[#C0392B]"></div> <strong>Tier G (0-9):</strong> Regime-Aligned</div>
      </div>

      <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded text-sm mt-4">
        <strong>Disclaimer:</strong> This tracker relies on public records and verified submissions. 
        It is for informational purposes only. "Security Posture" reflects policy positions, not operational details.
      </div>
    </div>
  </Dialog>
</template>
