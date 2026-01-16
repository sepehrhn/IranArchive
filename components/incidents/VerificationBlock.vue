<template>
  <div class="space-y-6">
    <Card class="border-l-4" :class="statusBorderClass">
        <template #title>
            <div class="flex items-center gap-2 text-lg">
                <i :class="statusIcon" style="font-size: 1.2rem"></i>
                <span class="capitalize">{{ incident.status.replace('_', ' ') }}</span>
            </div>
        </template>
        <template #content>
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-4" v-html="statusDescription"></div>
            
            <div v-if="incident.status === 'disputed'" class="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <h4 class="font-semibold text-orange-800 dark:text-orange-200 text-sm mb-1">Disputed Points</h4>
                <ul class="list-disc list-inside text-sm text-orange-900 dark:text-orange-100">
                    <li v-for="(q, idx) in incident.open_questions" :key="idx">{{ q }}</li>
                </ul>
            </div>

            <h4 class="font-semibold text-sm mb-2">Verification Rubric</h4>
             <ul class="space-y-2">
                <li v-for="(item, idx) in rubric" :key="idx" class="flex items-center gap-2 text-sm">
                    <i class="pi" :class="item.checked ? 'pi-check-circle text-green-500' : 'pi-minus-circle text-gray-400'"></i>
                    <span :class="{'text-gray-500': !item.checked}">{{ item.label }}</span>
                </li>
             </ul>
        </template>
    </Card>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-semibold text-sm mb-3">Change Log</h4>
        <Timeline :value="incident.review_history" align="left">
             <template #content="slotProps">
                 <div class="text-xs pb-4">
                     <span class="font-bold">{{ slotProps.item.reviewer }}</span>
                     <span class="mx-1 text-gray-400">•</span>
                     <span class="text-gray-500">{{ formatDate(slotProps.item.at) }}</span>
                     <div class="mt-1">
                         <Badge :value="slotProps.item.change" severity="secondary" size="small" />
                         <span class="ml-2 text-gray-600 dark:text-gray-400" v-html="renderMarkdown(slotProps.item.notes)"></span>
                     </div>
                 </div>
             </template>
        </Timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Incident } from '~/types/incident';
import { formatDate } from '~/utils/formatters';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
});

const props = defineProps<{
    incident: Incident;
}>();

const statusBorderClass = computed(() => {
    switch(props.incident.status) {
        case 'verified': return 'border-green-500';
        case 'disputed': return 'border-orange-500';
        case 'not_verified': return 'border-red-500';
        default: return 'border-gray-500';
    }
});

const statusIcon = computed(() => {
    switch(props.incident.status) {
        case 'verified': return 'pi pi-check-circle text-green-600';
        case 'disputed': return 'pi pi-exclamation-triangle text-orange-600';
        default: return 'pi pi-question-circle text-red-600';
    }
});

const statusDescription = computed(() => {
    let text = '';
    switch(props.incident.status) {
        case 'verified': 
            text = 'This incident has been **verified** through multiple independent sources and evidence. The core facts are considered established.';
            break;
        case 'disputed': 
            text = 'There are conflicting reports or unresolved questions regarding key aspects of this incident. See disputed points below.';
            break;
        case 'not_verified': 
            text = 'The incident is currently **not verified** beyond the submitted material and requires additional corroboration.';
            break;
        default: 
            text = '';
    }
    return md.render(text);
});

// In a real app, this might be computed from specific fields or flags
const rubric = computed(() => [
    { label: 'Geolocation Corroborated', checked: !!props.incident.location.lat }, // Proxy logic
    { label: 'Time Bounded', checked: props.incident.occurred_at.precision !== 'unknown' },
    { label: 'Visual Evidence', checked: props.incident.evidence.length > 0 },
    { label: 'Credible Reporting', checked: props.incident.sources.some(s => s.type === 'primary' || s.publisher) },
    { label: 'Independent Corroboration', checked: props.incident.status === 'verified' }
]);

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return md.render(text);
};
</script>

<style scoped>
:deep(.p-timeline-event-opposite) {
    display: none;
}
</style>
