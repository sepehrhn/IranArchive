import { z } from 'zod';

// Reusable enums
export const EventStateSchema = z.enum(["upcoming", "ongoing", "held", "past", "canceled", "postponed"]);
export const EventTypeSchema = z.enum(["in_person", "online", "hybrid"]); // Renamed from EventFormatSchema

// Date Schema - removed precision field
const DateInfoSchema = z.object({
    start: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional().or(z.literal('')),
    end: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD").optional().or(z.literal('')),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional().or(z.literal('')),
});


// Sub-schemas
const LocationSchema = z.object({
    country: z.string().length(2).transform(val => val.toUpperCase()),
    city: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
});

// Online Schema - removed access field (all events are public)
const OnlineSchema = z.object({
    platform: z.string().optional(),
    join_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    backup_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    registration_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    recording_expected: z.boolean().optional(),
    recording_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
});

const OrganizerSchema = z.object({
    name: z.string().min(1),
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
    location: LocationSchema.optional().nullable(),
    online: OnlineSchema.optional().nullable(),
    organizer: OrganizerSchema,
    // Removed speakers, verification (status), and sources sections

    // Media
    poster: z.union([z.string().url(), z.literal('')]).optional().nullable(), // New: poster image URL

    // Options
    featured: z.boolean().default(false)
}).refine(data => {
    // Logic: if in_person or hybrid, location is required
    if ((data.type === 'in_person' || data.type === 'hybrid') && !data.location) {
        return false;
    }
    return true;
}, {
    message: "Location is required for in_person or hybrid events",
    path: ["location"]
});

export type EventData = z.infer<typeof EventSchema>;

// Augmented type with ID and computed props
export interface ParsedEvent extends EventData {
    id: string; // From filename
    computed_state: z.infer<typeof EventStateSchema>;
}
