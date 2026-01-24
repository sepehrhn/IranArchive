import { z } from 'zod';

// Reusable enums
export const EventStateSchema = z.enum(["upcoming", "ongoing", "held", "canceled", "postponed"]);
export const EventFormatSchema = z.enum(["in_person", "online", "hybrid"]);
export const EventTypeSchema = z.enum([
    "rally", "march", "vigil", "sit_in",
    "webinar", "seminar", "panel", "conference",
    "workshop", "fundraiser", "film_screening",
    "training", "community_meetup", "other"
]);
export const DatePrecisionSchema = z.enum(["Exact", "Approx", "Unknown"]);

// Date Schema shared
// Moved here to access DatePrecisionSchema
const DateInfoSchema = z.object({
    start: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional().or(z.literal('')),
    end: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Must be YYYY/MM/DD").optional().or(z.literal('')),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional().or(z.literal('')),
    precision: DatePrecisionSchema
});

export const OnlineAccessSchema = z.enum(["public", "rsvp_required", "invite_only"]);
export const VerificationStatusSchema = z.enum(["draft", "not_verified", "verified"]);


// Sub-schemas
const LocationSchema = z.object({
    country: z.string().length(2).transform(val => val.toUpperCase()),
    city: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
});

const OnlineSchema = z.object({
    platform: z.string().optional(),
    join_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    backup_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    access: z.union([OnlineAccessSchema, z.literal('')]).optional().nullable(),
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

const SpeakerSchema = z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    bio: z.string().optional(),
    links: z.array(z.string().url()).optional(),
});



const SourceSchema = z.object({
    title: z.string(),
    url: z.string().url()
});

export const EventSchema = z.object({
    // Core
    title: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().optional(),
    state: EventStateSchema.optional(),
    format: EventFormatSchema,
    type: EventTypeSchema,
    tags: z.array(z.string()).optional(),

    // Timing
    // Timing
    date: DateInfoSchema,

    // Sections
    location: LocationSchema.optional().nullable(),
    online: OnlineSchema.optional().nullable(),
    organizer: OrganizerSchema,
    speakers: z.array(SpeakerSchema).optional().nullable(),

    // Verification
    status: VerificationStatusSchema,

    sources: z.array(SourceSchema).optional(),

    // Options
    featured: z.boolean().default(false)
}).refine(data => {
    // Logic: if in_person or hybrid, location is required
    if ((data.format === 'in_person' || data.format === 'hybrid') && !data.location) {
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
