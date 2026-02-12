import { ref } from 'vue';
import type { ParsedEvent, EventData } from '~/server/utils/events/schemas';
import { EventSchema, EventStateSchema } from '~/server/utils/events/schemas';

// Configuration (must match server/utils/events/loader.ts)
const ONGOING_WINDOW_HOURS = 6;

// In-memory cache
const eventsData = ref<ParsedEvent[]>([]);

export const useEvents = () => {

    // Helper to parse date string "YYYY/MM/DD" and time "HH:mm" in UTC
    const parseEventDate = (dateStr: string, timeStr?: string | null): Date => {
        const [year, month, day] = dateStr.split('/').map(Number);
        let hours = 0;
        let minutes = 0;

        if (timeStr && timeStr.trim()) {
            const timeParts = timeStr.split(':').map(Number);
            hours = timeParts[0] || 0;
            minutes = timeParts[1] || 0;
        }

        return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    };

    // Helper to compute state automatically (must match server loader logic)
    const computeEventState = (event: EventData): string => {
        const now = new Date();
        const start = parseEventDate(event.date.start, event.date.start_time);
        let end = (event.date.end)
            ? parseEventDate(event.date.end, event.date.end_time)
            : null;

        if (!end) {
            end = new Date(start.getTime() + ONGOING_WINDOW_HOURS * 60 * 60 * 1000);
        }

        if (now < start) return 'upcoming';

        const nowUTC = new Date(now.getTime());
        const endUTC = new Date(end.getTime());

        const isToday = nowUTC.getUTCFullYear() === endUTC.getUTCFullYear() &&
            nowUTC.getUTCMonth() === endUTC.getUTCMonth() &&
            nowUTC.getUTCDate() === endUTC.getUTCDate();

        if (isToday) return 'ongoing';
        if (now >= start && now <= end) return 'ongoing';
        return 'past';
    };

    const loadEvents = async () => {
        if (eventsData.value.length > 0) return;

        try {
            const files = import.meta.glob('/data/events/*.yaml', { eager: true });
            const loadedEvents: ParsedEvent[] = [];

            for (const path in files) {
                if (path.includes('.example')) continue;

                const module = files[path] as any;
                const data = module.default;

                // Extract ID from filename
                const parts = path.split('/');
                const fileName = parts[parts.length - 1];
                const id = fileName.replace('.yaml', '').replace('.yml', '');

                // Validation using Zod schema from server
                const result = EventSchema.safeParse(data);
                if (result.success) {
                    const eventData = result.data;
                    const state = computeEventState(eventData) as any;

                    loadedEvents.push({
                        ...eventData,
                        id,
                        computed_state: state
                    });
                } else {
                    console.warn(`Event validation failed for ${id}:`, result.error.issues);
                }
            }

            // Sort logic matching server
            eventsData.value = loadedEvents.sort((a, b) => {
                const dateA = parseEventDate(a.date.start, a.date.start_time).getTime();
                const dateB = parseEventDate(b.date.start, b.date.start_time).getTime();
                return dateB - dateA;
            });
        } catch (e) {
            console.error('Failed to load events:', e);
        }
    };

    const listEvents = async (): Promise<ParsedEvent[]> => {
        await loadEvents();
        return eventsData.value;
    };

    return {
        listEvents
    };
};
