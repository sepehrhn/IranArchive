<script setup lang="ts">
import type { ParsedEvent } from '~/server/utils/events/schemas';

const route = useRoute();
const { data: event, error } = await useFetch<ParsedEvent>(`/api/events/${route.params.id}`);

if (error.value || !event.value) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' });
}

// ICS Generation (Client-side)
const downloadICS = () => {
    if (!event.value) return;
    const ev = event.value;
    
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(ev.start_at);
    const end = ev.end_at ? formatDate(ev.end_at) : formatDate(new Date(new Date(ev.start_at).getTime() + 3600000).toISOString()); // Default 1h
    
    const description = `
${ev.summary}

Organizer: ${ev.organizer.name}
Link: ${ev.online?.join_url || window.location.href}

${ev.description || ''}
`.trim();

    const location = ev.format === 'online' ? 'Online' : `${ev.location?.venue_name || ''} ${ev.location?.address || ''}, ${ev.location?.city || ''}, ${ev.location?.country || ''}`;

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IranArchive//Events//EN',
        'BEGIN:VEVENT',
        `UID:${ev.id}@iranarchive.net`,
        `DTSTAMP:${formatDate(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
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
};
</script>

<template>
    <div v-if="event" class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Breadcrumb / Back -->
        <div class="mb-4">
            <NuxtLink to="/events" class="text-sm text-surface-500 hover:text-primary transition-colors">
                <i class="pi pi-arrow-left mr-1"></i> Back to Events
            </NuxtLink>
        </div>

        <!-- Header -->
        <div class="flex flex-col gap-5 mb-8 border-b border-surface-200 dark:border-surface-700 pb-8">
            <div class="flex flex-wrap gap-2 mb-2">
                <EventsEventBadges :event="event" />
            </div>
            
            <h1 class="text-3xl md:text-5xl font-bold">{{ event.title }}</h1>
            
            <p class="text-xl text-surface-600 dark:text-surface-300">{{ event.summary }}</p>

            <div class="flex flex-wrap gap-4 mt-2">
                 <Button label="Add to Calendar (.ics)" icon="pi pi-calendar-plus" outlined size="small" @click="downloadICS" />
                 <a v-if="event.online?.join_url" :href="event.online.join_url" target="_blank">
                     <Button label="Join Online" icon="pi pi-video" size="small" severity="success" />
                 </a>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="md:col-span-2 space-y-8">
                
                <!-- Description -->
                <div v-if="event.description" class="prose dark:prose-invert max-w-none">
                    <h3 class="text-xl font-bold mb-2">About this Event</h3>
                    <div class="whitespace-pre-line">{{ event.description }}</div>
                </div>

                <!-- Speakers -->
                <div v-if="event.speakers?.length" class="space-y-4">
                    <h3 class="text-xl font-bold border-b pb-2">Speakers</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div v-for="sp in event.speakers" :key="sp.name" class="p-3 border rounded bg-surface-50 dark:bg-surface-800">
                             <div class="font-bold">{{ sp.name }}</div>
                             <div class="text-sm text-surface-500">{{ sp.title }}</div>
                             <div v-if="sp.bio" class="text-xs mt-1 text-surface-600">{{ sp.bio }}</div>
                        </div>
                    </div>
                </div>

                <!-- Media Gallery -->
                <div v-if="event.media && event.media.length > 0" class="space-y-4">
                    <h3 class="text-xl font-bold border-b pb-2">Media & Documents</h3>
                    <EventsEventMediaGallery :media="event.media" />
                </div>

                <!-- Sources -->
                <div v-if="event.sources?.length">
                     <EventsEventSources :sources="event.sources" />
                </div>

            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Key Details Card -->
                <div class="border border-surface-200 dark:border-surface-700 rounded-xl p-6 shadow-sm bg-surface-0 dark:bg-surface-800 space-y-5">
                    <div>
                        <div class="text-sm text-surface-500 uppercase font-bold tracking-wider mb-1">When</div>
                        <EventsEventTimeBlock :event="event" />
                    </div>
                    
                    <div>
                        <div class="text-sm text-surface-500 uppercase font-bold tracking-wider mb-1">Where</div>
                        <EventsEventLocationBlock :event="event" />
                    </div>

                    <div v-if="event.organizer">
                        <div class="text-sm text-surface-500 uppercase font-bold tracking-wider mb-1">Organizer</div>
                        <div class="font-medium">{{ event.organizer.name }}</div>
                        <div class="flex gap-2 mt-2 text-xl">
                            <a v-if="event.organizer.website" :href="event.organizer.website" target="_blank" class="text-surface-500 hover:text-primary"><i class="pi pi-globe"></i></a>
                            <a v-if="event.organizer.socials?.x" :href="event.organizer.socials.x" target="_blank" class="text-surface-500 hover:text-primary"><i class="pi pi-twitter"></i></a>
                            <a v-if="event.organizer.socials?.instagram" :href="event.organizer.socials.instagram" target="_blank" class="text-surface-500 hover:text-primary"><i class="pi pi-instagram"></i></a>
                        </div>
                    </div>
                </div>

                <!-- Map Placeholder (Optional) -->
                <!-- Could add a static map image if coords were available -->

                <!-- Verification Score Removed as requested -->
            </div>
        </div>
    </div>
</template>
