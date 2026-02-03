<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
});

const props = defineProps<{
    event: ParsedEvent
}>();

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { initUpload, completeSubmission } from '~/utils/submissionsClient';

const isExpanded = ref(false);
const showUpdateDialog = ref(false);
const updateSubmitting = ref(false);

const handleUpdateSubmit = async (payload: any) => {
    updateSubmitting.value = true;
    try {
        // Init upload (even if no files, we need the flow or at least the ID)
        // Note: initUpload requires files array.
        const initResponse = await initUpload({
            turnstileToken: payload.turnstileToken,
            kind: payload.kind,
            files: [] // No files for update currently
        });

        // Complete submission
        await completeSubmission({
            submissionId: initResponse.submissionId,
            kind: payload.kind,
            payload: payload.data,
            uploadedFiles: [],
            turnstileToken: payload.turnstileToken
        });

        showUpdateDialog.value = false;
        alert('Thank you! Your update suggestion has been submitted for review.');
    } catch (error: any) {
        console.error('Update submission error:', error);
        alert(`Update failed: ${error.message || 'Unknown error'}`);
    } finally {
        updateSubmitting.value = false;
    }
};

const excerpt = computed(() => {
    const text = props.event.description || '';
    return text.length > 120 
        ? text.substring(0, 120) + '...' 
        : text;
});

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return md.render(text);
};

const statusDotColor = computed(() => {
    const colors = {
        'upcoming': 'bg-blue-500',
        'ongoing': 'bg-green-500',
        'past': 'bg-gray-400',
        'held': 'bg-gray-400',
        'canceled': 'bg-red-500',
        'postponed': 'bg-orange-500'
    };
    return colors[props.event.computed_state] || 'bg-gray-400';
});

const hasDetails = computed(() => {
    const ev = props.event;
    return !!(
        ev.description?.trim() || 
        ev.organizer?.name?.trim() || 
        (ev.location?.lat && ev.location?.lng) ||
        ev.online?.join_url ||
        (ev.source && ev.source.length > 0)
    );
});

// Calendar Popup
const showCalendarPopup = ref(false);

// Helper to parse event date and time
const parseEventDateTime = (dateStr: string, timeStr?: string | null) => {
    // dateStr is in YYYY/MM/DD format, convert to YYYY-MM-DD for Date parsing
    const formattedDate = dateStr.replace(/\//g, '-');
    const dateTimeStr = timeStr ? `${formattedDate}T${timeStr}:00` : `${formattedDate}T00:00:00`;
    return new Date(dateTimeStr);
};

const openGoogleCalendar = () => {
    const ev = props.event;
    const start = parseEventDateTime(ev.date.start, ev.date.start_time);
    const end = (ev.date.end && ev.date.end_time)
        ? parseEventDateTime(ev.date.end, ev.date.end_time)
        : new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3 hour default
    
    const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const location = ev.type === 'online' 
        ? 'Online' 
        : `${ev.location?.address || ''}, ${ev.location?.city || ''}, ${ev.location?.country || ''}`;
    
    const details = `${ev.description || ev.title}\n\nOrganizer: ${ev.organizer.name}`;
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    window.open(url, '_blank');
    showCalendarPopup.value = false;
};

// ICS Download
const downloadICS = () => {
    const ev = props.event;
    
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = parseEventDateTime(ev.date.start, ev.date.start_time);
    const end = (ev.date.end && ev.date.end_time)
        ? parseEventDateTime(ev.date.end, ev.date.end_time)
        : new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3 hour default
    
    const description = `
${ev.description || ev.title}

Organizer: ${ev.organizer.name}
Link: ${ev.online?.join_url || window.location.href}
`.trim();

    const location = ev.type === 'online' 
        ? 'Online' 
        : `${ev.location?.address || ''}, ${ev.location?.city || ''}, ${ev.location?.country || ''}`;

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IranArchive//Events//EN',
        'BEGIN:VEVENT',
        `UID:${ev.id}@iranarchive.net`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${ev.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showCalendarPopup.value = false;
};
const showMapsPopup = ref(false);

const getMapQuery = () => {
    const ev = props.event;
    return ev.location?.lat && ev.location?.lng 
        ? `${ev.location.lat},${ev.location.lng}` 
        : `${ev.location?.address || ''} ${ev.location?.city || ''} ${ev.location?.country || ''}`;
};

const openGoogleMaps = () => {
    const query = encodeURIComponent(getMapQuery());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    showMapsPopup.value = false;
};

const openAppleMaps = () => {
    const query = encodeURIComponent(getMapQuery());
    window.open(`https://maps.apple.com/?q=${query}`, '_blank');
    showMapsPopup.value = false;
};
</script>

<template>

    <div class="group relative border border-surface-200 dark:border-surface-800 rounded-2xl bg-surface-0 dark:bg-surface-900 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-900 backdrop-blur-sm h-full flex flex-col">
        <!-- Update Button (Absolute Top Right) -->
        <div v-if="['upcoming', 'ongoing', 'postponed'].includes(event.computed_state)" class="absolute top-6 right-6 z-10">
             <button 
                @click.stop="showUpdateDialog = true" 
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow text-xs font-bold text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 backdrop-blur-sm"
            >
                <i class="pi pi-pencil text-[10px]"></i>
                <span>{{ t('common.update') }}</span>
            </button>
        </div>

        <!-- Card Header (Always Visible) -->
        <div class="p-5 md:p-6 pb-2">
            <!-- Status + Title + Format -->
            <div class="flex flex-wrap items-start gap-3 mb-6 pr-24"> <!-- pr-24 to avoid overlap with update button -->
                
                <!-- Status Dot -->
                <div class="relative flex-shrink-0 h-[28px] flex items-center justify-center">
                    <div 
                        :class="['w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-500', statusDotColor]"
                        :title="event.computed_state.toUpperCase()"
                    ></div>
                    <div v-if="['ongoing', 'upcoming'].includes(event.computed_state)" 
                        :class="['absolute rounded-full animate-ping opacity-20 w-4 h-4', statusDotColor]">
                    </div>
                </div>

                <!-- Title -->
                <div class="flex flex-col">
                    <h3 class="font-extrabold text-lg leading-[28px] text-surface-900 dark:text-surface-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                        {{ event.title }}
                    </h3>
                    <div class="text-[10px] uppercase tracking-wider text-surface-400 font-mono mt-0.5">
                        {{ $nFa(event.id) }}
                    </div>
                </div>

                <!-- Format Tag -->
                <div class="h-[28px] flex items-center">
                    <Badge 
                        :value="$nFa(event.type.replace('_', ' ').toUpperCase())" 
                        severity="secondary" 
                        class="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-md !bg-surface-100 dark:!bg-surface-800 !text-surface-600 dark:!text-surface-300 ring-1 ring-surface-200 dark:ring-surface-800"
                    />
                </div>
            </div>

            <!-- Date & Location Blocks -->
            <div class="grid grid-cols-1 gap-3 mb-4">
                <button 
                    @click="showCalendarPopup = true"
                    class="group/date flex items-center gap-3 p-3 rounded-xl bg-surface-50/80 dark:bg-surface-950/40 border border-surface-100 dark:border-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-200 text-left w-full relative overflow-hidden"
                    title="Add to Calendar"
                >
                    <div class="w-10 h-10 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm border border-surface-100 dark:border-surface-800 group-hover/date:border-primary-200 dark:group-hover/date:border-primary-700/50 transition-colors">
                        <i class="pi pi-calendar-plus text-primary-500 dark:text-primary-400 group-hover/date:scale-110 transition-transform duration-300"></i>
                    </div>
                    <EventsEventTimeBlock :event="event" class="flex-1" />
                    
                    <!-- Hover hint -->
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/date:opacity-100 transition-opacity duration-200">
                        <i class="pi pi-angle-right text-primary-500 text-lg"></i>
                    </div>
                </button>
                
                <button 
                    @click="showMapsPopup = true"
                    class="group/location flex items-center gap-3 p-3 rounded-xl bg-surface-50/80 dark:bg-surface-950/40 border border-surface-100 dark:border-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-200 text-left w-full relative overflow-hidden"
                    title="Open in Maps"
                >
                    <div class="w-10 h-10 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm border border-surface-100 dark:border-surface-800 group-hover/location:border-primary-200 dark:group-hover/location:border-primary-700/50 transition-colors">
                        <i class="pi pi-map-marker text-primary-500 dark:text-primary-400 group-hover/location:scale-110 transition-transform duration-300"></i>
                    </div>
                    <EventsEventLocationBlock :event="event" class="flex-1" />

                     <!-- Hover hint -->
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/location:opacity-100 transition-opacity duration-200">
                        <i class="pi pi-angle-right text-primary-500 text-lg"></i>
                    </div>
                </button>
            </div>

            <!-- Expand/Collapse Button -->
            <button
                v-if="hasDetails"
                @click="isExpanded = !isExpanded"
                class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-50 dark:!bg-surface-900 hover:bg-surface-100 dark:hover:!bg-surface-800 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 text-sm font-bold border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
            >
                <div class="flex items-center gap-2">
                    <i :class="['pi text-[10px] transition-transform duration-300', isExpanded ? 'pi-minus' : 'pi-plus']"></i>
                    <span>{{ isExpanded ? 'Show Less' : 'Show Details' }}</span>
                </div>
                <i :class="['pi pi-chevron-right transition-transform duration-300 text-[10px]', isExpanded ? 'rotate-90' : '']"></i>
            </button>
        </div>

        <!-- Expanded Content -->
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[1000px]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[1000px]"
            leave-to-class="opacity-0 max-h-0"
        >
            <div v-if="isExpanded" class="border-t border-surface-100 dark:border-surface-700">
                <div class="p-6 space-y-6">
                    <!-- Action Buttons -->
                    <div v-if="event.online?.join_url" class="flex flex-wrap gap-3">
                        <a :href="event.online.join_url" target="_blank" class="no-underline">
                            <Button 
                                label="Join Online" 
                                icon="pi pi-video" 
                                severity="success" 
                                size="small"
                                raised
                                class="!rounded-xl !px-4"
                            />
                        </a>
                    </div>

                    <!-- Full Description -->
                    <div v-if="event.description?.trim()" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-align-left text-primary-500 text-[10px]"></i>
                            Description
                        </h4>
                        <div class="prose prose-sm dark:prose-invert max-w-none text-surface-700 dark:text-surface-300 bg-surface-50/50 dark:bg-surface-950/50 p-4 rounded-xl border border-surface-100/50 dark:border-surface-800">
                            <div v-html="renderMarkdown(event.description)"></div>
                        </div>
                    </div>
                    
                    <!-- Map -->
                    <div v-if="event.location?.lat && event.location?.lng" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-map text-primary-500 text-[10px]"></i>
                            Location
                        </h4>
                        <div class="bg-surface-0 dark:bg-surface-950 border border-surface-100 dark:border-surface-800 rounded-xl overflow-hidden shadow-sm">
                            <div class="h-48">
                                <IncidentsIncidentMap :lat="event.location.lat" :lng="event.location.lng" />
                            </div>
                        </div>
                    </div>

                    <!-- Organizer -->
                    <div v-if="event.organizer?.name?.trim()" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-users text-primary-500 text-[10px]"></i>
                            Organizer
                        </h4>
                        <div class="flex items-center justify-between bg-surface-50/50 dark:bg-surface-950/50 p-4 rounded-xl border border-surface-100/50 dark:border-surface-800">
                            <div class="font-bold text-sm text-surface-900 dark:text-surface-100">{{ event.organizer.name }}</div>
                            <div class="flex gap-2">
                                <a v-if="event.organizer.website" :href="event.organizer.website" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-800 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-globe text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.x" :href="event.organizer.socials.x" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-800 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-twitter text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.instagram" :href="event.organizer.socials.instagram" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-800 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-instagram text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.telegram" :href="event.organizer.socials.telegram" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-800 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-send text-xs"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Sources -->
                    <EventsEventSources :sources="event.source || []" />
                </div>
            </div>
        </Transition>

        <!-- Calendar Popup Modal -->
        <Dialog v-model:visible="showCalendarPopup" modal header="Add to Calendar" :style="{ width: '450px' }" :draggable="false" class="premium-dialog">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <span class="text-lg font-bold text-surface-900 dark:text-surface-0">Add to Calendar</span>
                </div>
            </template>
            
            <div class="px-1">
                <!-- Summary Block -->
                <div class="bg-surface-50 dark:bg-surface-950/50 p-4 rounded-2xl mb-5 border border-surface-100 dark:border-surface-800/50">
                    <div class="text-xs font-black uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-2">Event Timing</div>
                    <div class="font-bold text-surface-900 dark:text-surface-0 leading-tight mb-1">
                        {{ event.title }}
                    </div>
                    <div class="text-xs text-surface-500 font-medium">
                        <EventsEventTimeBlock :event="event" class="!text-surface-500" />
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2">
                    <button @click="openGoogleCalendar" class="selection-row group/item">
                        <div class="icon-wrap !bg-transparent !border-0 !p-0">
                            <img src="/img/icons/google-logo.svg" alt="Google" class="w-full h-full object-contain" />
                        </div>
                        <span class="row-title">Google Calendar</span>
                        <i class="pi pi-chevron-right row-arrow"></i>
                    </button>

                    <button @click="downloadICS" class="selection-row group/item">
                        <div class="icon-wrap !bg-transparent !border-0 !p-0">
                            <img src="/img/icons/apple-logo.svg" alt="Apple" class="w-full h-full object-contain dark:invert" />
                        </div>
                        <span class="row-title">Apple / Other (.ics)</span>
                        <i class="pi pi-chevron-right row-arrow"></i>
                    </button>
                </div>
            </div>
        </Dialog>

        <!-- Maps Selection Popup -->
        <Dialog v-model:visible="showMapsPopup" modal header="View on Map" :style="{ width: '450px' }" :draggable="false" class="premium-dialog">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <span class="text-lg font-bold text-surface-900 dark:text-surface-0">View on Map</span>
                </div>
            </template>

            <div class="px-1">
                <!-- Summary Block -->
                <div class="bg-surface-50 dark:bg-surface-950/50 p-4 rounded-2xl mb-5 border border-surface-100 dark:border-surface-800/50">
                    <div class="text-xs font-black uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-2">Location</div>
                    <div class="font-bold text-surface-900 dark:text-surface-0 leading-tight mb-1">
                        {{ event.location?.address || 'TBD' }}
                    </div>
                    <div class="text-xs text-surface-500 font-medium">
                        {{ event.location?.city ? `${event.location.city}, ` : '' }}{{ t(`countries.${event.location?.country}`, event.location?.country || '') }}
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2">
                    <button @click="openGoogleMaps" class="selection-row group/item">
                        <div class="icon-wrap !bg-transparent !border-0 !p-0">
                            <img src="/img/icons/google-maps.svg" alt="Google Maps" class="w-full h-full object-contain" />
                        </div>
                        <span class="row-title">Google Maps</span>
                        <i class="pi pi-chevron-right row-arrow"></i>
                    </button>

                    <button @click="openAppleMaps" class="selection-row group/item">
                        <div class="icon-wrap !bg-transparent !border-0 !p-0">
                            <img src="/img/icons/apple-maps-official.png" alt="Apple Maps" class="w-full h-full object-contain" />
                        </div>
                        <span class="row-title">Apple Maps</span>
                        <i class="pi pi-chevron-right row-arrow"></i>
                    </button>
                </div>
            </div>
        </Dialog>

        <!-- Update Event Dialog -->
        <Dialog 
            v-model:visible="showUpdateDialog" 
            modal 
            :header="t('common.suggestUpdate')" 
            :style="{ width: '90vw', maxWidth: '600px' }"
            :draggable="false"
        >
            <SubmissionsEventUpdateForm 
                v-if="showUpdateDialog"
                :initialData="event" 
                :submitting="updateSubmitting"
                @submit="handleUpdateSubmit"
                @cancel="showUpdateDialog = false"
            />
        </Dialog>
    </div>
</template>

<style scoped>
.selection-row {
    @apply flex items-center gap-4 p-3 rounded-xl w-full text-left transition-all duration-200;
    @apply bg-surface-50 dark:bg-surface-900/40 border border-surface-100 dark:border-surface-800;
    @apply hover:bg-white dark:hover:bg-surface-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:shadow-primary-500/5;
}

.icon-wrap {
    @apply w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-surface-800 flex items-center justify-center p-1.5;
    @apply border border-surface-100 dark:border-surface-700;
}

.row-title {
    @apply flex-1 font-bold text-surface-900 dark:text-surface-0 text-sm tracking-tight;
}

.row-arrow {
    @apply text-surface-300 text-xs transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-primary-500 opacity-0 group-hover/item:opacity-100;
}

/* Premium Dialog Layout */
:deep(.premium-dialog) {
    @apply border-0 shadow-2xl;
}

:deep(.premium-dialog .p-dialog-content) {
    @apply p-6 pt-2 bg-white dark:bg-surface-900 rounded-b-3xl;
}

:deep(.premium-dialog .p-dialog-header) {
    @apply p-6 pb-2 bg-white dark:bg-surface-900 rounded-t-3xl border-b-0;
}

:deep(.premium-dialog .p-dialog-header-icons) {
    @apply gap-2;
}

:deep(.premium-dialog .p-dialog-header-close) {
    @apply w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors;
}
</style>
