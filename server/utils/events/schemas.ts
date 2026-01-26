import { z } from 'zod';

// Reusable enums
export const EventStateSchema = z.enum(["upcoming", "ongoing", "held", "past", "canceled", "postponed"]);
export const EventTypeSchema = z.enum(["in_person", "online", "hybrid"]); // Renamed from EventFormatSchema

// Date Schema - removed precision field
const DateInfoSchema = z.object({
    start: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm"),
    end: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD").optional().or(z.literal('')),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional().or(z.literal('')),
});


// Sub-schemas
const LocationSchema = z.object({
    country: z.string().min(2).transform(val => val.toUpperCase()),
    city: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
});

// Online Schema - removed access field (all events are public)
const OnlineSchema = z.object({
    platform: z.union([z.string(), z.literal('')]).optional().nullable(),
    join_url: z.union([z.string(), z.literal('')]).optional().nullable(),
    registration_url: z.union([z.string(), z.literal('')]).optional().nullable(),
});

const OrganizerSchema = z.object({
    name: z.string().optional(),
    website: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    contact_email: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    socials: z.object({
        x: z.union([z.string(), z.literal('')]).optional().nullable(),
        instagram: z.union([z.string(), z.literal('')]).optional().nullable(),
        telegram: z.union([z.string(), z.literal('')]).optional().nullable(),
        other: z.array(z.string()).optional().nullable(),
    }).optional(),
});

// Removed SpeakerSchema - speakers section no longer needed
// Removed SourceSchema - sources section no longer needed

export const EventSchema = z.object({
    // Core
    title: z.string().min(1),
    description: z.string().optional(),
    // state is now always computed automatically - no longer in YAML
    type: EventTypeSchema, // Renamed from 'format'
    tags: z.array(z.string()).optional(),

    // Timing
    date: DateInfoSchema,

    // Sections
    location: z.union([LocationSchema, z.array(z.any()).length(0)]).optional().nullable(),
    online: z.union([OnlineSchema, z.array(z.any()).length(0)]).optional().nullable(),
    organizer: OrganizerSchema,
    // Removed speakers, verification (status), and sources sections

    // Media
    announcement: z.union([z.string().url(), z.literal(''), z.literal('-')]).optional().nullable(), // Allow '-' or empty

    // Options
    featured: z.boolean().default(false)
}).refine(data => {
    const isLocationMissing = !data.location || (Array.isArray(data.location) && data.location.length === 0);
    const isOnlineMissing = !data.online || (Array.isArray(data.online) && data.online.length === 0);

    // Logic: if in_person or hybrid, location is required
    if ((data.type === 'in_person' || data.type === 'hybrid') && isLocationMissing) {
        return false;
    }
    // Logic: if online or hybrid, online section is required
    if ((data.type === 'online' || data.type === 'hybrid')) {
        if (isOnlineMissing) return false;

        // If it's an object, check internal fields
        if (typeof data.online === 'object' && data.online !== null && !Array.isArray(data.online)) {
            if (!data.online.platform?.trim() || !data.online.join_url?.trim()) {
                return false;
            }
        }
    }
    return true;
}, {
    message: "Location/Online details required based on event type. Please provide platform and join_url for online events.",
    path: ["type"]
});

export type EventData = z.infer<typeof EventSchema>;

// Augmented type with ID and computed props
export interface ParsedEvent extends EventData {
    id: string; // From filename
    computed_state: z.infer<typeof EventStateSchema>;
}
