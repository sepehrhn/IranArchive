<script setup lang="ts">
import type { Entity } from '@/types/entity';
import StanceBadge from './StanceBadge.vue';
import EntityTypePill from './EntityTypePill.vue';
import CountryPill from './CountryPill.vue';
import EntityPhoto from './EntityPhoto.vue';

const props = defineProps<{
    entity: Entity;
}>();

const emit = defineEmits<{
    (e: 'click', slug: string): void;
}>();

const { t, locale } = useI18n();

const summary = computed(() => {
    const s = props.entity.stance.summary;
    return (locale.value === 'fa' ? s.fa : s.en) || s.en || s.fa;
});

const displayName = computed(() => {
    const n = props.entity.names;
    if (locale.value === 'fa' && n.native) return n.native;
    return n.primary;
});

const secondaryName = computed(() => {
    const n = props.entity.names;
    if (locale.value === 'fa') return n.primary;
    return n.native || '';
});
</script>

<template>
    <button
        @click="emit('click', entity.slug)"
        class="group w-full text-left bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
    >
        <!-- Top: Photo + Name -->
        <div class="flex items-start gap-3.5 mb-3">
            <EntityPhoto
                :src="entity.photo"
                :alt="displayName"
                aspect="circle"
                size="sm"
            />
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-0.5 line-clamp-1">
                    {{ displayName }}
                </h3>
                <p v-if="secondaryName" class="text-xs text-surface-400 dark:text-surface-500 line-clamp-1">
                    {{ secondaryName }}
                </p>
            </div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-1.5 mb-3">
            <EntityTypePill :type="entity.type" />
            <CountryPill :iso2="entity.country.iso2" />
        </div>

        <!-- Stance -->
        <div class="mb-3">
            <StanceBadge :label="entity.stance.label" :confidence="entity.stance.confidence" size="sm" />
        </div>

        <!-- Summary -->
        <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2 mb-3">
            {{ summary }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between text-[10px] text-surface-400 dark:text-surface-500 pt-2 border-t border-surface-100 dark:border-surface-800">
            <span class="flex items-center gap-1">
                <i class="pi pi-clock text-[9px]"></i>
                {{ entity.stance.last_updated }}
            </span>
            <span class="flex items-center gap-1">
                <i class="pi pi-file text-[9px]"></i>
                {{ entity.evidence_refs.length }}
            </span>
        </div>
    </button>
</template>
