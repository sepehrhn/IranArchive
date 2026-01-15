<script setup lang="ts">
import incidentsData from '~/data/incidents/index.json';
import { getStatusColor, formatDate } from '~/utils/formatters';

const { t } = useI18n()

// Type definition for the index items
interface IncidentSummary {
    slug: string;
    title: string;
    summary: string;
    status: string;
    date: string;
}

const incidents = ref<IncidentSummary[]>(incidentsData);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{{ t('common.incidents') }}</h1>
            <Tag :value="incidents.length + ' records'" severity="info" />
        </div>

        <DataTable :value="incidents" tableStyle="min-width: 50rem" stripedRows paginator :rows="10">
            <Column field="date" header="Date" sortable style="width: 15%">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.date) }}
                </template>
            </Column>
            <Column header="Title" sortable field="title" style="width: 25%">
                <template #body="slotProps">
                    <NuxtLink :to="`/incidents/${slotProps.data.slug}`" class="font-semibold text-primary-600 hover:underline">
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
                    <Tag :value="slotProps.data.status" :severity="getStatusColor(slotProps.data.status)" class="capitalize" />
                </template>
            </Column>
             <Column style="width: 10%">
                <template #body="slotProps">
                    <NuxtLink :to="`/incidents/${slotProps.data.slug}`">
                        <Button icon="pi pi-arrow-right" text rounded aria-label="View" />
                    </NuxtLink>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
