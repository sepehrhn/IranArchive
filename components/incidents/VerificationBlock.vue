<template>
  <div class="space-y-6">
    <!-- Status Card -->
    <div v-if="mode === 'full' || mode === 'status'" 
         class="bg-surface-0 dark:bg-surface-900 border border-t-4 shadow-sm rounded-xl overflow-hidden" 
         :class="statusBorderClass">
        
        <!-- Header -->
        <div class="p-4 bg-surface-50 dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 flex items-center gap-3">
             <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-surface-0">
                <i :class="statusIcon" style="font-size: 1.25rem"></i>
            </div>
            <div>
                 <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 capitalize leading-tight">
                     {{ incident.status.replace('_', ' ') }}
                 </h3>
                 <span class="text-xs text-surface-500 uppercase tracking-wider font-semibold">Current Status</span>
            </div>
        </div>

        <!-- Content -->
        <div class="p-5 space-y-5">
            <div class="text-sm text-surface-700 dark:text-surface-300 leading-relaxed" v-html="statusDescription"></div>
            
            <!-- Disputed Points -->
            <div v-if="incident.status === 'disputed'" class="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/50">
                <h4 class="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400 text-xs uppercase tracking-wider mb-2">
                    <i class="pi pi-exclamation-triangle"></i> Disputed Points
                </h4>
                <ul class="space-y-1.5">
                    <li v-for="(q, idx) in incident.open_questions" :key="idx" class="flex gap-2 text-sm text-orange-900 dark:text-orange-200">
                        <span class="text-orange-400">•</span>
                        <span>{{ q }}</span>
                    </li>
                </ul>
            </div>

            <!-- Rubric -->
            <div>
                 <h4 class="font-bold text-xs uppercase text-surface-400 mb-3 tracking-wider">Verification Criteria</h4>
                 <ul class="space-y-2.5">
                    <li v-for="(item, idx) in rubric" :key="idx" class="flex items-start gap-3 text-sm group">
                        <div class="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors"
                             :class="item.checked ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-surface-100 border-surface-200 dark:bg-surface-800 dark:border-surface-700'">
                             <i class="pi text-[10px]" :class="item.checked ? 'pi-check text-green-600 dark:text-green-400' : 'pi-minus text-surface-400'"></i>
                        </div>
                        <span :class="{'text-surface-500 line-through decoration-surface-300': !item.checked, 'text-surface-700 dark:text-surface-200 font-medium': item.checked}">{{ item.label }}</span>
                    </li>
                 </ul>
            </div>
        </div>
    </div>

    <!-- Change Log -->
    <div v-if="mode === 'full' || mode === 'history'" 
         class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5">
        <h4 class="font-bold text-sm text-surface-900 dark:text-surface-0 mb-4 flex items-center gap-2">
             <i class="pi pi-history text-surface-400"></i> Review History
        </h4>
        
        <div class="relative border-l border-surface-200 dark:border-surface-700 space-y-6">
             <div v-for="(item, idx) in incident.review_history" :key="idx" class="relative pl-6">
                  <div class="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-surface-0 dark:bg-surface-800 border-2 border-surface-300 dark:border-surface-600"></div>
                  
                  <div class="text-xs text-surface-400 mb-0.5 font-mono">{{ formatDate(item.at) }}</div>
                  <div class="flex flex-wrap gap-2 items-center mb-1">
                       <span class="font-bold text-sm text-surface-800 dark:text-surface-200">{{ item.reviewer }}</span>
                       <Badge :value="item.change" severity="secondary" class="text-[10px] h-5" />
                  </div>
                  <div class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed" v-html="renderMarkdown(item.notes)"></div>
             </div>
        </div>
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

const props = withDefaults(defineProps<{
    incident: Incident;
    mode?: 'full' | 'status' | 'history';
}>(), {
    mode: 'full'
});

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
