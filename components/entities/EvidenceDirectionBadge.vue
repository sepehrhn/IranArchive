<script setup lang="ts">
import type { EvidenceDirection } from '@/types/entity';

const props = defineProps<{
    direction: EvidenceDirection;
}>();

const { t } = useI18n();

const colorMap: Record<EvidenceDirection, { bg: string; text: string }> = {
    supports_people: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    supports_regime: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
    neutral: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-300' },
    disputed: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
    context_needed: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
};

const colors = computed(() => colorMap[props.direction] || colorMap.neutral);
</script>

<template>
    <span
        class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap uppercase tracking-wider"
        :class="[colors.bg, colors.text]"
    >
        {{ t(`evidenceDirection.${direction}`) }}
    </span>
</template>
