<script setup lang="ts">
import type { EntityType } from '@/types/entity';

const props = defineProps<{
    type: EntityType;
}>();

const { t } = useI18n();

const iconMap: Record<EntityType, string> = {
    celebrity: 'pi pi-star',
    politician: 'pi pi-building',
    organization: 'pi pi-sitemap',
    company: 'pi pi-briefcase',
    media: 'pi pi-megaphone',
    ngo: 'pi pi-heart',
    government_body: 'pi pi-flag',
    religious_figure: 'pi pi-moon',
    influencer: 'pi pi-users',
    academic: 'pi pi-book',
    other: 'pi pi-tag',
};
</script>

<template>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 ring-1 ring-surface-200/50 dark:ring-surface-700/50 whitespace-nowrap">
        <i :class="iconMap[type]" class="text-[10px] opacity-70"></i>
        {{ t(`entityTypes.${type}`) }}
    </span>
</template>
