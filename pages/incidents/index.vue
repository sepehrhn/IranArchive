<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { getStatusColor, formatDate, formatStatus } from '~/utils/formatters';

const { t } = useI18n()

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

const statusOptions = [
    { label: 'Not Verified', value: 'not_verified' },
    { label: 'Disputed', value: 'disputed' },
    { label: 'Verified', value: 'verified' }
];

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

const incidents = baseIncidents; // Keep reference for count if needed, or just use filteredIncidents

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = null;
}

const onRowClick = (event: any) => {
    navigateTo(`/incidents/${event.data.id}`);
};

// Use !important for hover background to ensure it overrides the striped row background
const rowClass = () => 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-200';

const getRatingColor = (value: number) => {
    if (value <= 4) return 'var(--danger)';
    if (value <= 7) return 'var(--warning)';
    return 'var(--success)';
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">{{ t('common.incidents') }}</h1>
                <p class="text-surface-500 dark:text-surface-400 mt-1">
                    {{ incidents.length }} records found
                </p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4">
                <IconField iconPosition="left">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Search incidents..." class="w-full sm:w-64" />
                </IconField>
                <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Filter by Status" class="w-full sm:w-48" showClear />
            </div>
        </div>

        <div class="card bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden shadow-sm">
            <DataTable :value="filteredIncidents" paginator :rows="10" @row-click="onRowClick" :rowClass="rowClass"
                :pt="{
                    header: { class: 'bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800' },
                    thead: { class: 'bg-surface-50 dark:bg-surface-800/50' }
                }"
            >
                <template #empty>
                    <div class="p-8 text-center">
                        <i class="pi pi-search text-4xl text-surface-400 mb-4 block"></i>
                        <p class="text-surface-500">No incidents found matching your criteria.</p>
                        <Button label="Clear Filters" text @click="clearFilters" class="mt-2" v-if="searchQuery || selectedStatus" />
                    </div>
                </template>

                <Column field="occurred_at.start" header="Date" sortable style="width: 12rem; min-width: 12rem">
                    <template #body="slotProps">
                        <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ formatDate(slotProps.data.occurred_at.start) }}</span>
                    </template>
                </Column>
                <Column header="Title" sortable field="title" style="width: 30%; min-width: 15rem">
                    <template #body="slotProps">
                        <span class="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                            {{ slotProps.data.title }}
                        </span>
                    </template>
                </Column>
                <Column header="Summary">
                    <template #body="slotProps">
                        <p class="line-clamp-2 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                            {{ slotProps.data.summary }}
                        </p>
                    </template>
                </Column>
                <Column header="Status" style="width: 11rem; min-width: 11rem" sortable field="status">
                    <template #body="slotProps">
                        <Tag :value="formatStatus(slotProps.data.status)" :severity="getStatusColor(slotProps.data.status)" />
                    </template>
                </Column>
                <Column style="width: 12rem; min-width: 12rem" headerClass="justify-center">
                    <template #header>
                        <div class="w-full text-center font-bold text-xs uppercase tracking-wider text-surface-500">Confidence</div>
                    </template>
                    <template #body="{ data }">
                        <div class="flex items-center justify-center gap-4" v-if="data.ratings">
                             <div class="flex flex-col items-center gap-1" v-if="data.ratings.truth_confidence" title="Truth Confidence">
                                <div class="relative w-8 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full" :style="{ width: data.ratings.truth_confidence * 10 + '%', backgroundColor: getRatingColor(data.ratings.truth_confidence) }"></div>
                                </div>
                                <span class="text-[10px] uppercase font-bold text-surface-500">Truth</span>
                            </div>
                             <div class="flex flex-col items-center gap-1" v-if="data.ratings.evidence_availability" title="Evidence Availability">
                                <div class="relative w-8 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                     <div class="h-full rounded-full" :style="{ width: data.ratings.evidence_availability * 10 + '%', backgroundColor: getRatingColor(data.ratings.evidence_availability) }"></div>
                                </div>
                                <span class="text-[10px] uppercase font-bold text-surface-500">Evidence</span>
                            </div>
                        </div>
                         <span v-else class="text-xs text-surface-400">-</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
