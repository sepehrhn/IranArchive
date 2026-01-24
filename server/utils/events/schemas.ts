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
export const LocationVisibilitySchema = z.enum(["public", "approximate", "withheld_until_day_of", "withheld"]);
export const OnlineAccessSchema = z.enum(["public", "rsvp_required", "invite_only"]);
export const VerificationStatusSchema = z.enum(["draft", "not_verified", "disputed", "verified"]);
export const MediaTypeSchema = z.enum(["image", "video", "link"]);

// Sub-schemas
const LocationSchema = z.object({
    country: z.string().min(1),
    country_iso2: z.string().length(2).transform(val => val.toUpperCase()),
    city: z.string().optional(),
    venue_name: z.string().optional(),
    address: z.string().optional(),
    location_visibility: LocationVisibilitySchema,
    meeting_point: z.string().optional(),
    route: z.string().optional(),
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
    start_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Must be valid ISO 8601 datetime"),
    end_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Must be valid ISO 8601 datetime").optional().nullable(),
    timezone: z.string().min(1), // Basic check, fuller validation in loader
    date_precision: DatePrecisionSchema,

    // Sections
    location: LocationSchema.optional().nullable(),
    online: OnlineSchema.optional().nullable(),
    organizer: OrganizerSchema,
    speakers: z.array(SpeakerSchema).optional().nullable(),

    // Verification
    status: VerificationStatusSchema,

    sources: z.array(SourceSchema).optional(),

    // Options
    featured: z.boolean().default(false),

    // Media (Simple list of filenames in /data/events/)
    media: z.array(z.string()).optional()
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
