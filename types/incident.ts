export type IncidentStatus = 'draft' | 'not_verified' | 'disputed' | 'verified';

export type EvidenceType = 'video' | 'image' | 'document';
export type ContentWarning = 'graphic' | 'violence' | 'none';
export type SourceType = 'primary' | 'secondary';

export interface Location {
    country: string;
    province?: string;
    city?: string;
    address?: string; // Optional if event covers the entire city
    lat?: number;
    lng?: number;
}

export interface DateRange {
    start: string; // Format: YYYY/MM/DD or ISO
    start_time?: string; // Format: HH:MM (24h)
    end?: string;  // Format: YYYY/MM/DD or ISO
    end_time?: string; // Format: HH:MM (24h)

    precision: 'exact' | 'approx' | 'unknown';
}

export interface StatsRange {
    min?: number;
    max?: number;
}

export interface IncidentSeverity {
    deaths?: StatsRange;
    injured?: StatsRange;
    arrests?: StatsRange;
}

export interface Provenance {
    submitted_by?: string;
    first_published_at?: string;
    first_published_url?: string;
    chain_of_custody_note?: string;
}

export interface TechnicalDetails {
    sha256?: string;
    file_size_bytes?: number;
    format?: string;
    duration_seconds?: number;
    exif_summary?: string;
    reencoded?: boolean;
}

export interface Corroboration {
    related_evidence_ids?: string[];
    notes?: string;
}

export interface Evidence {
    // id: string; // Injected at runtime from filename
    type: EvidenceType;
    title: string;
    description: string;
    file_path: string; // Relative path to /public/evidence, e.g. "2026/01/video.mp4"
    captured_at?: string; // Format: YYYY/MM/DD or ISO
    claimed_location?: string;
    provenance: Provenance;
    technical?: TechnicalDetails;
    corroboration: Corroboration;
    flags: string[];
    content_warning?: ContentWarning;
}

export interface Source {
    id: string;
    label: string;
    url: string;
    publisher?: string;
    published_at?: string; // Format: YYYY/MM/DD or ISO
    type: SourceType;
    archived_urls?: string[];
    language?: string;
    notes?: string;
}

export interface TimelineEvent {
    at: string; // Format: YYYY/MM/DD or ISO
    time?: string; // Format: HH:MM (24h)
    title: string;
    description: string;
    evidence_ids?: string[];
    source_ids?: string[];
}

export interface ReviewEntry {
    at: string; // Format: YYYY/MM/DD or ISO
    reviewer: string;
    change: 'created' | 'status_changed' | 'evidence_added' | 'details_updated';
    from_status?: IncidentStatus;
    to_status?: IncidentStatus;
    notes: string;
}

export interface Victim {
    id: string;
    name: string;
}

export interface RelatedIncident {
    id: string;
    title: string;
    status: IncidentStatus;
}

export interface Incident {
    // id: string; // Injected at runtime from filename
    status: IncidentStatus;
    occurred_at: DateRange;
    location: Location;
    incident_type: string;
    // Tags removed
    severity: IncidentSeverity;

    // Content
    title: string;
    summary: string;
    narrative: string;
    key_claims: string[];
    open_questions: string[];
    limitations: string[];

    // Collections
    evidence_ids: string[]; // References to evidence filenames/IDs
    sources: Source[];
    timeline: TimelineEvent[];
    review_history: ReviewEntry[];

    // Relations
    victims: string[];
    related_incidents: RelatedIncident[];

    // Ratings
    ratings?: IncidentRatings;
}

export interface IncidentRatings {
    truth_confidence?: number; // 1-10
    evidence_availability?: number; // 1-10
}
