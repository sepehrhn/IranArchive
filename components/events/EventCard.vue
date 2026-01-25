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

const isExpanded = ref(false);
const showEditDialog = ref(false);
const editSubmitting = ref(false);

const handleEditSubmit = (payload: any) => {
    editSubmitting.value = true;
    console.log('Update Event Payload:', payload);
    // In a real app, this would be an API call
    setTimeout(() => {
        editSubmitting.value = false;
        showEditDialog.value = false;
        // Optionally show a success message or refresh the parent
    }, 1500);
};

const excerpt = computed(() => {
    return props.event.summary.length > 120 
        ? props.event.summary.substring(0, 120) + '...' 
        : props.event.summary;
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
</script>

<template>

    <div class="group relative border border-surface-200 dark:border-surface-800 rounded-2xl bg-surface-0 dark:bg-surface-900 overflow-hidden hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 backdrop-blur-sm h-full flex flex-col">
        <!-- Edit Icon (Absolute Top Right) -->
        <div class="absolute top-6 right-6 z-10">
            <button 
                @click.stop="showEditDialog = true" 
                class="text-surface-400 hover:text-primary-500 transition-colors duration-200"
                title="Edit Event"
            >
                <i class="pi pi-pencil text-xs"></i>
            </button>
        </div>

        <!-- Card Header (Always Visible) -->
        <div class="p-5 md:p-6 pb-2">
            <!-- Status + Title + Format -->
            <div class="flex flex-wrap items-center gap-3 mb-6 pr-8"> <!-- pr-8 to avoid overlap with edit button -->
                
                <!-- Status Dot -->
                <div class="relative flex-shrink-0 flex items-center justify-center">
                    <div 
                        :class="['w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-500', statusDotColor]"
                        :title="event.computed_state.toUpperCase()"
                    ></div>
                    <div v-if="['ongoing', 'upcoming'].includes(event.computed_state)" 
                        :class="['absolute -inset-1 rounded-full animate-ping opacity-20', statusDotColor]">
                    </div>
                </div>

                <!-- Title -->
                <h3 class="font-extrabold text-lg leading-snug text-surface-900 dark:text-surface-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {{ event.title }}
                </h3>

                <!-- Format Tag -->
                <Badge 
                    :value="event.type.replace('_', ' ').toUpperCase()" 
                    severity="secondary" 
                    class="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-md !bg-surface-100 dark:!bg-surface-800 !text-surface-600 dark:!text-surface-300 ring-1 ring-surface-200 dark:ring-surface-800"
                />
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
                
                <a 
                    :href="`https://www.google.com/maps/search/?api=1&query=${event.location?.lat && event.location?.lng ? `${event.location.lat},${event.location.lng}` : encodeURIComponent(`${event.location?.address || ''} ${event.location?.city || ''} ${event.location?.country || ''}`)}`"
                    target="_blank"
                    class="group/location flex items-center gap-3 p-3 rounded-xl bg-surface-50/80 dark:bg-surface-950/40 border border-surface-100 dark:border-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-200 text-left w-full relative overflow-hidden no-underline"
                    title="Open in Google Maps"
                >
                    <div class="w-10 h-10 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm border border-surface-100 dark:border-surface-800 group-hover/location:border-primary-200 dark:group-hover/location:border-primary-700/50 transition-colors">
                        <i class="pi pi-map-marker text-primary-500 dark:text-primary-400 group-hover/location:scale-110 transition-transform duration-300"></i>
                    </div>
                    <EventsEventLocationBlock :event="event" class="flex-1" />

                     <!-- Hover hint -->
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/location:opacity-100 transition-opacity duration-200">
                        <i class="pi pi-external-link text-primary-500 text-lg"></i>
                    </div>
                </a>
            </div>

            <!-- Expand/Collapse Button -->
            <button
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
                    <div v-if="event.description" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-align-left text-primary-500 text-[10px]"></i>
                            Description
                        </h4>
                        <div class="prose prose-sm dark:prose-invert max-w-none text-surface-700 dark:text-surface-300 bg-surface-50/50 dark:bg-surface-950/50 p-4 rounded-xl border border-surface-100/50 dark:border-surface-700/50">
                            <div v-html="renderMarkdown(event.description)"></div>
                        </div>
                    </div>
                    
                    <!-- Map -->
                    <div v-if="event.location?.lat && event.location?.lng" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-map text-primary-500 text-[10px]"></i>
                            Location
                        </h4>
                        <div class="bg-surface-0 dark:bg-surface-950 border border-surface-100 dark:border-surface-700 rounded-xl overflow-hidden shadow-sm">
                            <div class="h-48">
                                <IncidentsIncidentMap :lat="event.location.lat" :lng="event.location.lng" />
                            </div>
                        </div>
                    </div>

                    <!-- Organizer -->
                    <div v-if="event.organizer" class="space-y-3">
                        <h4 class="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-users text-primary-500 text-[10px]"></i>
                            Organizer
                        </h4>
                        <div class="flex items-center justify-between bg-surface-50/50 dark:bg-surface-950/50 p-4 rounded-xl border border-surface-100/50 dark:border-surface-700/50">
                            <div class="font-bold text-sm text-surface-900 dark:text-surface-100">{{ event.organizer.name }}</div>
                            <div class="flex gap-2">
                                <a v-if="event.organizer.website" :href="event.organizer.website" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-700 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-globe text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.x" :href="event.organizer.socials.x" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-700 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-twitter text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.instagram" :href="event.organizer.socials.instagram" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-700 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-instagram text-xs"></i>
                                </a>
                                <a v-if="event.organizer.socials?.telegram" :href="event.organizer.socials.telegram" target="_blank" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-800 text-surface-500 hover:text-primary-500 transition-all border border-surface-100 dark:border-surface-700 hover:border-primary-200 shadow-sm">
                                    <i class="pi pi-send text-xs"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Calendar Popup Modal -->
        <Dialog v-model:visible="showCalendarPopup" modal header="Add to Calendar" :style="{ width: '400px' }" :draggable="false">
            <div class="space-y-3">
                <Button 
                    label="Google Calendar" 
                    icon="pi pi-google" 
                    @click="openGoogleCalendar"
                    class="w-full !justify-start"
                    outlined
                />
                <Button 
                    label="Apple / Other (.ics)" 
                    icon="pi pi-calendar" 
                    @click="downloadICS"
                    class="w-full !justify-start"
                    outlined
                />
            </div>
        </Dialog>

        <!-- Edit Event Dialog -->
        <Dialog 
            v-model:visible="showEditDialog" 
            modal 
            header="Edit Event" 
            :style="{ width: '90vw', maxWidth: '1000px' }"
            :draggable="false"
        >
            <SubmissionsEventSubmissionForm 
                :initialData="event" 
                :submitting="editSubmitting"
                @submit="handleEditSubmit"
            />
        </Dialog>
    </div>
</template>
