<script setup lang="ts">
const props = defineProps<{
    iso2: string;
}>();

const { t } = useI18n();

// Convert ISO2 to flag emoji
const flag = computed(() => {
    if (!props.iso2 || props.iso2.length < 2) return '🌍';
    const code = props.iso2.toUpperCase().slice(0, 2);
    return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
});

const countryName = computed(() => {
    return t(`countries.${props.iso2}`, props.iso2);
});
</script>

<template>
    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 whitespace-nowrap">
        <span>{{ flag }}</span>
        {{ countryName }}
    </span>
</template>
