<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { useStickyHeader } from '~/composables/useStickyHeader';

const { t } = useI18n()
const { headerOffset, headerHeight, registerStickyTrigger } = useStickyHeader()

const filterBarRef = ref<HTMLElement | null>(null)

// Load all incidents using glob import
const incidentModules = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });

const baseIncidents = computed(() => {
    return Object.entries(incidentModules)
        .map(([path, mod]: [string, any]) => {
            const incident = mod.default as Incident;
            
            // Derive ID from filename
            const parts = path.split('/');
            const filename = parts[parts.length - 1];
            const id = filename.replace('.yaml', '');
            
            return {
                ...incident,
                id
            };
        })
        .filter(incident => incident.status !== 'draft')
        .sort((a, b) => {
            return new Date(b.occurred_at.start).getTime() - new Date(a.occurred_at.start).getTime();
        });
});

const searchQuery = ref('');
const selectedStatus = ref();
const showSubmitDialog = ref(false);
const loading = ref(true);

onMounted(() => {
    // Glob imports are immediate, but we simulate a short delay for consistent UX
    setTimeout(() => {
        loading.value = false;
    }, 400);

    if (filterBarRef.value) {
        registerStickyTrigger(filterBarRef.value)
    }
});

onUnmounted(() => {
    // No explicit reset needed
});

const statusOptions = computed(() => [
    { label: t('status.not_verified'), value: 'not_verified' },
    { label: t('status.disputed'), value: 'disputed' },
    { label: t('status.verified'), value: 'verified' }
]);

const filteredIncidents = computed(() => {
    return baseIncidents.value.filter(incident => {
        const matchesSearch = searchQuery.value 
            ? (incident.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
               incident.summary.toLowerCase().includes(searchQuery.value.toLowerCase()))
            : true;
        
        const matchesStatus = selectedStatus.value
            ? incident.status === selectedStatus.value
            : true;

        return matchesSearch && matchesStatus;
    });
});

const incidents = baseIncidents; 

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = null;
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header Card -->
        <div class="flex flex-col gap-6 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm mb-6">
            <!-- Title & Actions -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">{{ t('common.incidents') }}</h1>
                    <p class="text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-2">
                        <Skeleton v-if="loading" width="8rem" height="1.25rem" />
                        <span v-else>{{ t('incidentsPage.recordsFound', { count: $nFa(filteredIncidents.length) }) }}</span>
                    </p>
                </div>

                <div>
                    <Button :label="t('incidentsPage.submit')" icon="pi pi-plus" size="small" @click="showSubmitDialog = true" class="hidden md:flex" />
                </div>
            </div>
        </div>

        <!-- Controls Toolbar -->
        <div 
            ref="filterBarRef"
            class="sticky-trigger flex flex-col lg:flex-row gap-4 justify-between items-center bg-surface-0/95 dark:bg-surface-900/95 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-md mb-8 sticky z-40 backdrop-blur-md transition-all duration-300"
            :style="{ top: headerOffset + 'px' }"
        >
            <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-0 flex-grow">
                <IconField iconPosition="left" class="w-full sm:w-96">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="t('incidentsPage.searchPlaceholder')" class="w-full" />
                </IconField>
            </div>
            <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="t('incidentsPage.filterStatus')" class="w-full sm:w-48" showClear />
            </div>
        </div>

        <!-- Mobile Submit Button (Floating) -->
        <div class="fixed bottom-6 right-6 z-20 md:hidden">
            <Button 
                icon="pi pi-plus" 
                rounded
                raised
                size="large"
                class="!w-14 !h-14 !shadow-2xl shadow-primary-500/30"
                @click="showSubmitDialog = true"
            />
        </div>

        <!-- Grid Layout -->
        <div v-if="filteredIncidents.length > 0">
            <TransitionGroup name="list" tag="div" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="incident in filteredIncidents" :key="incident.id">
                    <IncidentCard :incident="incident" />
                </div>
            </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center p-16 text-center bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 border-dashed">
            <div class="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                <i class="pi pi-search text-2xl text-surface-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-2">{{ t('incidentsPage.emptyTitle') }}</h3>
            <p class="text-surface-500 dark:text-surface-400 max-w-sm mx-auto mb-6">
                {{ t('incidentsPage.emptyDescription') }}
            </p>
            <Button :label="t('incidentsPage.clearFilters')" outlined @click="clearFilters" />
        </div>

        <!-- Submit Incident Dialog -->
        <Dialog 
            v-model:visible="showSubmitDialog" 
            modal 
            :header="t('incidentsPage.dialogTitle')" 
            :style="{ width: '90vw', maxWidth: '1000px' }"
            :draggable="false"
            class="submission-dialog"
        >
            <SubmissionsIncidentSubmissionForm @cancel="showSubmitDialog = false" />
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.submission-dialog) .p-dialog-header {
    @apply px-6 pt-6 md:px-8 md:pt-8;
}
:deep(.submission-dialog) .p-dialog-content {
    @apply px-6 pb-6 md:px-8 md:pb-8;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   items can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
