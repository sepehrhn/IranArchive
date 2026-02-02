import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { EventSchema, type EventData, type ParsedEvent, EventStateSchema } from './schemas';

// Configuration
const EVENTS_DIR = path.resolve(process.cwd(), 'data/events');
const ONGOING_WINDOW_HOURS = 6; // Default duration if end_at is missing

// Helper to parse date string "YYYY/MM/DD" and time "HH:mm" in UTC
function parseEventDate(dateStr: string, timeStr?: string | null): Date {
    // Parse as YYYY/MM/DD and optional HH:mm
    const [year, month, day] = dateStr.split('/').map(Number);
    let hours = 0;
    let minutes = 0;

    if (timeStr && timeStr.trim()) {
        const timeParts = timeStr.split(':').map(Number);
        hours = timeParts[0] || 0;
        minutes = timeParts[1] || 0;
    }

    // Create date in UTC
    return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

// Helper to compute state automatically based on event dates
function computeEventState(event: EventData): string {
    const now = new Date(); // Current time in UTC
    const start = parseEventDate(event.date.start, event.date.start_time);
    let end = (event.date.end)
        ? parseEventDate(event.date.end, event.date.end_time)
        : null;

    // If no end time, assume a default window
    if (!end) {
        end = new Date(start.getTime() + ONGOING_WINDOW_HOURS * 60 * 60 * 1000);
    }

    if (now < start) return 'upcoming';

    // Check if the event ends today (same year, month, day) in UTC
    const nowUTC = new Date(now.getTime());
    const endUTC = new Date(end.getTime());

    const isToday = nowUTC.getUTCFullYear() === endUTC.getUTCFullYear() &&
        nowUTC.getUTCMonth() === endUTC.getUTCMonth() &&
        nowUTC.getUTCDate() === endUTC.getUTCDate();

    // If it's technically over but still today, keep it as 'ongoing' (or 'today') so it doesn't disappear from the main list
    if (isToday) return 'ongoing';

    if (now >= start && now <= end) return 'ongoing';
    return 'past'; // Changed from 'held' to 'past'
}

export async function loadEvents(): Promise<ParsedEvent[]> {
    if (!fs.existsSync(EVENTS_DIR)) {
        console.warn(`[Inventory] Events directory not found: ${EVENTS_DIR}`);
        return [];
    }

    const files = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    const validEvents: ParsedEvent[] = [];
    const errors: string[] = [];

    for (const file of files) {
        if (file.endsWith('.example')) continue;

        const filePath = path.join(EVENTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const eventId = path.parse(file).name;

        try {
            const rawData = yaml.load(fileContent);
            const result = EventSchema.safeParse(rawData);

            if (!result.success) {
                // Formatting Zod errors
                const zodError = result.error;
                const issues = zodError.issues;
                const errorMsg = issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                errors.push(`File ${file}: ${errorMsg}`);
                continue;
            }

            const eventData = result.data;
            const computedState = computeEventState(eventData) as z.infer<typeof EventStateSchema>;

            validEvents.push({
                ...eventData,
                id: eventId,
                computed_state: computedState
            });

        } catch (e: any) {
            errors.push(`File ${file}: YAML parse error - ${e.message}`);
        }
    }

    if (errors.length > 0) {
        console.error("___________________________________________________");
        console.error("EVENTS DATA VALIDATION ERRORS:");
        errors.forEach(e => console.error(e));
        console.error("___________________________________________________");
        // We choose NOT to throw here to allow partial builds, but CI should fail if needed.
        // For strict requirements: throw new Error("Event validation failed");
    }

    // Sort: Upcoming (Ascending start), Ongoing (Ascending start), Held (Descending start)
    // Actually, simple default sort: Start date descending? Or separated?
    // Let's just return raw list, let API/Frontend sort.
    return validEvents.sort((a, b) => {
        const dateA = parseEventDate(a.date.start, a.date.start_time).getTime();
        const dateB = parseEventDate(b.date.start, b.date.start_time).getTime();
        return dateB - dateA;
    });
}
