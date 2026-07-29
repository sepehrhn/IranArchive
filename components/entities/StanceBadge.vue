<script setup lang="ts">
import type { StanceLabel } from '@/types/entity';

const props = defineProps<{
    label: StanceLabel;
    confidence?: number;
    size?: 'sm' | 'md' | 'lg';
}>();

const { t } = useI18n();

const colorMap: Record<StanceLabel, { bg: string; text: string; ring: string }> = {
    pro_people: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500/20' },
    pro_regime: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-500/20' },
    neutral: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-300', ring: 'ring-slate-500/20' },
    both_sides: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500/20' },
    unclear: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500 dark:text-gray-400', ring: 'ring-gray-500/20' },
};

const colors = computed(() => colorMap[props.label] || colorMap.unclear);

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'px-2 py-0.5 text-[10px]';
        case 'lg': return 'px-4 py-2 text-sm';
        default: return 'px-3 py-1 text-xs';
    }
});
</script>

<template>
    <span
        class="inline-flex items-center gap-1.5 font-semibold rounded-full ring-1 whitespace-nowrap"
        :class="[colors.bg, colors.text, colors.ring, sizeClasses]"
    >
        <span class="w-1.5 h-1.5 rounded-full" :class="colors.text.replace('text-', 'bg-')"></span>
        {{ t(`stanceLabels.${label}`) }}
        <span v-if="confidence !== undefined" class="opacity-70 font-normal">{{ confidence }}%</span>
    </span>
</template>
