import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { EventSchema, type EventData, type ParsedEvent, EventStateSchema } from './schemas';

// Configuration
const EVENTS_DIR = path.resolve(process.cwd(), 'data/events');
const ONGOING_WINDOW_HOURS = 6; // Default duration if end_at is missing

// Helper to compute state
function computeEventState(event: EventData): string {
    if (event.state) return event.state;

    const now = new Date();
    const start = new Date(event.start_at);
    let end = event.end_at ? new Date(event.end_at) : null;

    // If no end time, assume a default window
    if (!end) {
        end = new Date(start.getTime() + ONGOING_WINDOW_HOURS * 60 * 60 * 1000);
    }

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'held';
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
                const issues = zodError.errors || zodError.issues || [];
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
    return validEvents.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
}
