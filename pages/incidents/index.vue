<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { getStatusColor, formatDate, formatStatus } from '~/utils/formatters';

const { t } = useI18n()

// Load all incidents using glob import
const incidentModules = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });

const incidents = computed(() => {
    return Object.values(incidentModules)
        .map((mod: any) => mod.default as Incident)
        .filter(incident => incident.status !== 'draft')
        .sort((a, b) => {
            return new Date(b.occurred_at.start).getTime() - new Date(a.occurred_at.start).getTime();
        });
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{{ t('common.incidents') }}</h1>
            <Tag :value="incidents.length + ' records'" severity="info" />
        </div>

        <DataTable :value="incidents" tableStyle="min-width: 50rem" stripedRows paginator :rows="10">
            <Column field="occurred_at.start" header="Date" sortable style="width: 15%">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.occurred_at.start) }}
                </template>
            </Column>
            <Column header="Title" sortable field="title" style="width: 25%">
                <template #body="slotProps">
                    <NuxtLink :to="`/incidents/${slotProps.data.id}`" class="font-semibold text-primary-600 hover:underline">
                        {{ slotProps.data.title }}
                    </NuxtLink>
                </template>
            </Column>
            <Column header="Summary">
                <template #body="slotProps">
                    <p class="line-clamp-2 text-sm text-surface-600 dark:text-surface-300">
                        {{ slotProps.data.summary }}
                    </p>
                </template>
            </Column>
            <Column header="Status" style="width: 10%" sortable field="status">
                <template #body="slotProps">
                    <Tag :value="formatStatus(slotProps.data.status)" :severity="getStatusColor(slotProps.data.status)" />
                </template>
            </Column>
             <Column style="width: 10%">
                <template #body="slotProps">
                    <NuxtLink :to="`/incidents/${slotProps.data.id}`">
                        <Button icon="pi pi-arrow-right" text rounded aria-label="View" />
                    </NuxtLink>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
