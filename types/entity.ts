import { z } from 'zod/v4';

// ── Enums ──────────────────────────────────────────────────────────────

export const EntityTypeEnum = z.enum([
    'celebrity', 'politician', 'organization', 'company', 'media',
    'ngo', 'government_body', 'religious_figure', 'influencer', 'academic', 'other'
]);
export type EntityType = z.infer<typeof EntityTypeEnum>;

export const StanceLabelEnum = z.enum([
    'pro_people', 'pro_regime', 'neutral', 'both_sides', 'unclear'
]);
export type StanceLabel = z.infer<typeof StanceLabelEnum>;

export const EvidenceDirectionEnum = z.enum([
    'supports_people', 'supports_regime', 'neutral', 'disputed', 'context_needed'
]);
export type EvidenceDirection = z.infer<typeof EvidenceDirectionEnum>;

export const ReviewStatusEnum = z.enum([
    'draft', 'under_review', 'published'
]);
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;

export const VisibilityEnum = z.enum([
    'both', 'en_only', 'fa_only'
]);
export type Visibility = z.infer<typeof VisibilityEnum>;

// ── Sub-schemas ────────────────────────────────────────────────────────

export const SocialLinkSchema = z.object({
    platform: z.string(),
    url: z.string().url(),
    verified: z.boolean().optional(),
    handle: z.string().optional(),
});

export const EvidenceRefSchema = z.object({
    evidence_id: z.string(),
    direction: EvidenceDirectionEnum,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    quote: z.string().optional(),
    context: z.string().optional(),
    importance: z.number().int().min(1).max(5),
    external_url: z.string().url().optional(),
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const ReviewHistoryEntrySchema = z.object({
    at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    by: z.string(),
    note: z.string().optional(),
});

export const AffiliationSchema = z.object({
    entity_id: z.string().optional(),
    name: z.string().optional(),
    relation: z.string(),
    since: z.string().optional(),
    until: z.string().optional(),
});

// ── Main Entity schema ─────────────────────────────────────────────────

export const EntitySchema = z.object({
    // id and slug are derived from filename (ent-<slug>.yaml) at load time
    id: z.string().optional(),
    slug: z.string().optional(),
    type: EntityTypeEnum,

    names: z.object({
        primary: z.string(),
        native: z.string().optional(),
        aliases: z.array(z.string()).optional(),
    }),

    country: z.object({
        iso2: z.string().min(2).max(3),
        name: z.string().optional(),
    }),

    visibility: z.object({
        show_in: VisibilityEnum,
    }),

    roles: z.array(z.string()).optional(),

    links: z.object({
        website: z.string().url().optional(),
        social: z.array(SocialLinkSchema).optional(),
    }).optional(),

    stance: z.object({
        label: StanceLabelEnum,
        confidence: z.number().min(0).max(100),
        summary: z.string(),
        last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
        themes: z.array(z.string()).optional(),
        notes: z.string().optional(),
    }),

    evidence_refs: z.array(EvidenceRefSchema),

    review: z.object({
        status: ReviewStatusEnum,
        review_history: z.array(ReviewHistoryEntrySchema),
    }),

    // Photo(s) — filenames stored in /data/entities/img/
    photo: z.array(z.string()).optional(),

    // Optional fields
    affiliations: z.array(AffiliationSchema).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
});

export type Entity = z.infer<typeof EntitySchema>;
