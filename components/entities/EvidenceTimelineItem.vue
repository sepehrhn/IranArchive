<script setup lang="ts">
import type { EvidenceRef } from '@/types/entity';
import EvidenceDirectionBadge from './EvidenceDirectionBadge.vue';

const props = defineProps<{
    evidence: EvidenceRef;
}>();

const { t } = useI18n();
const contextExpanded = ref(false);

const importanceDots = computed(() => {
    return Array.from({ length: 5 }, (_, i) => i < props.evidence.importance);
});

const evidenceUrl = computed(() => {
    if (props.evidence.external_url) return props.evidence.external_url;
    return null;
});
</script>

<template>
    <div class="relative pl-8 pb-8 border-l-2 border-surface-200 dark:border-surface-800 last:border-l-0 last:pb-0 group">
        <!-- Timeline dot -->
        <div class="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full border-2 border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 group-hover:border-primary-400 dark:group-hover:border-primary-500 transition-colors"></div>

        <!-- Content card -->
        <div class="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-200/50 dark:border-surface-800/50 hover:border-surface-300 dark:hover:border-surface-700 transition-all">

            <!-- Header: Date + Direction -->
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="text-xs font-mono font-medium text-surface-500 dark:text-surface-400">
                    {{ evidence.date }}
                </span>
                <EvidenceDirectionBadge :direction="evidence.direction" />

                <!-- Importance dots -->
                <div class="flex items-center gap-0.5 ml-auto" :title="`${t('entityDetail.importance')}: ${evidence.importance}/5`">
                    <span
                        v-for="(filled, i) in importanceDots"
                        :key="i"
                        class="w-1.5 h-1.5 rounded-full"
                        :class="filled ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'"
                    ></span>
                </div>
            </div>

            <!-- Quote -->
            <blockquote v-if="evidence.quote" class="text-sm text-surface-700 dark:text-surface-200 leading-relaxed border-l-2 border-primary-400/30 pl-3 mb-3 italic">
                "{{ evidence.quote }}"
            </blockquote>

            <!-- Context (expandable) -->
            <div v-if="evidence.context">
                <button
                    @click="contextExpanded = !contextExpanded"
                    class="text-[11px] font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                    :aria-expanded="contextExpanded"
                >
                    <i class="pi text-[10px]" :class="contextExpanded ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                    {{ contextExpanded ? t('entityDetail.hideContext') : t('entityDetail.showContext') }}
                </button>
                <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-40"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 max-h-40"
                    leave-to-class="opacity-0 max-h-0"
                >
                    <p v-if="contextExpanded" class="text-xs text-surface-500 dark:text-surface-400 mt-2 leading-relaxed overflow-hidden">
                        {{ evidence.context }}
                    </p>
                </Transition>
            </div>

            <!-- Link to evidence -->
            <a
                v-if="evidenceUrl"
                :href="evidenceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mt-3 group/link"
            >
                <i class="pi pi-external-link text-[10px] group-hover/link:translate-x-0.5 transition-transform"></i>
                {{ t('entityDetail.viewEvidence') }}
            </a>
        </div>
    </div>
</template>
