<template>
  <div 
    class="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold leading-none min-w-[1.5rem]"
    :class="badgeClass"
    v-tooltip.bottom="rubricText"
  >
    {{ showLabel ? `L${level}` : level }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    required: true,
    default: 0
  },
  campaign: {
    type: Object,
    default: null
  },
  showLabel: {
    type: Boolean,
    default: true
  }
});

const rubricText = computed(() => {
  if (!props.campaign || !props.campaign.rubric) return '';
  return props.campaign.rubric[`level_${props.level}`] || '';
});

const badgeClass = computed(() => {
  switch (props.level) {
    case 4: return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800';
    case 3: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
    case 1: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
    case 0:
    default:
      return 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 border border-surface-200 dark:border-surface-700';
  }
});
</script>
