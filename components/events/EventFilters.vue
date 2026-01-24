<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: any
}>();

const emit = defineEmits(['update:modelValue']);

const filters = ref({
    search: '',
    format: null,
    country: null,
    type: null
});

const formatOptions = [
    { label: 'All Formats', value: null },
    { label: 'In Person', value: 'in_person' },
    { label: 'Online', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' }
];

const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Rally', value: 'rally' },
    { label: 'Webinar', value: 'webinar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Conference', value: 'conference' },
    { label: 'Fundraiser', value: 'fundraiser' },
];

watch(filters, (newVal) => {
    emit('update:modelValue', newVal);
}, { deep: true });
</script>

<template>
    <div class="flex flex-col gap-4 p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
        <h3 class="font-semibold text-lg">Filters</h3>
        
        <!-- Search -->
        <span class="relative">
            <i class="pi pi-search absolute top-3 left-3 text-surface-400"></i>
            <InputText v-model="filters.search" placeholder="Search events..." class="w-full pl-10" />
        </span>

        <!-- Format -->
        <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Format</label>
            <SelectButton v-model="filters.format" :options="formatOptions" optionLabel="label" optionValue="value" class="w-full text-sm" />
        </div>

        <!-- Type -->
        <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Type</label>
            <Dropdown v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Select Type" showClear class="w-full" />
        </div>
        
        <!-- Country (Simplified input for now, could be dropdown) -->
        <div class="flex flex-col gap-2">
             <label class="text-sm font-medium">Country Code (ISO2)</label>
             <InputText v-model="filters.country" placeholder="e.g. DE, CA" class="w-full" maxlength="2" />
        </div>
    </div>
</template>
