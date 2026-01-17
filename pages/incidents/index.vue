<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { getStatusColor, formatDate, formatStatus } from '~/utils/formatters';

const { t } = useI18n()

// Load all incidents using glob import
const incidentModules = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });

const incidents = computed(() => {
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
const onRowClick = (event: any) => {
    navigateTo(`/incidents/${event.data.id}`);
};

// Use !important for hover background to ensure it overrides the striped row background
const rowClass = () => 'cursor-pointer hover:!bg-primary-50 dark:hover:!bg-primary-900/20 transition-colors duration-200';
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{{ t('common.incidents') }}</h1>
            <Tag :value="incidents.length + ' records'" severity="info" />
        </div>

        <DataTable :value="incidents" tableStyle="min-width: 50rem" stripedRows paginator :rows="10" @row-click="onRowClick" :rowClass="rowClass">
            <Column field="occurred_at.start" header="Date" sortable style="width: 12rem; min-width: 12rem">
                <template #body="slotProps">
                    <span class="text-sm font-medium">{{ formatDate(slotProps.data.occurred_at.start) }}</span>
                </template>
            </Column>
            <Column header="Title" sortable field="title" style="width: 20%; min-width: 15rem">
                <template #body="slotProps">
                    <span class="font-semibold text-primary-600 hover:underline">
                        {{ slotProps.data.title }}
                    </span>
                </template>
            </Column>
            <Column header="Summary">
                <template #body="slotProps">
                    <p class="line-clamp-2 text-sm text-surface-600 dark:text-surface-300">
                        {{ slotProps.data.summary }}
                    </p>
                </template>
            </Column>
            <Column header="Status" style="width: 11rem; min-width: 11rem" sortable field="status">
                <template #body="slotProps">
                    <Tag :value="formatStatus(slotProps.data.status)" :severity="getStatusColor(slotProps.data.status)" class="mr-2" />
                </template>
            </Column>
            <Column style="width: 12rem; min-width: 12rem" headerClass="justify-center">
                <template #header>
                    <div class="w-full text-center font-bold">Truth / Evidence</div>
                </template>
                <template #body="{ data }">
                    <div class="flex items-center justify-center gap-2" v-if="data.ratings">
                        <div class="flex flex-col items-center" v-if="data.ratings.truth_confidence">
                            <Knob v-model="data.ratings.truth_confidence" :min="0" :max="10" :size="50" readonly :strokeWidth="5" valueColor="var(--p-primary-500)" rangeColor="var(--p-surface-200)" />
                            <span class="text-[10px] uppercase font-bold text-gray-500 mt-1">Truth</span>
                        </div>
                        <div class="flex flex-col items-center" v-if="data.ratings.evidence_availability">
                            <Knob v-model="data.ratings.evidence_availability" :min="0" :max="10" :size="50" readonly :strokeWidth="5" valueColor="var(--p-cyan-500)" rangeColor="var(--p-surface-200)" />
                            <span class="text-[10px] uppercase font-bold text-gray-500 mt-1">Evidence</span>
                        </div>
                    </div>
                     <span v-else class="text-xs text-gray-400">-</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
