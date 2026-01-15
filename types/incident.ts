export type IncidentStatus = 'not_verified' | 'disputed' | 'verified';

export type EvidenceType = 'video' | 'photo' | 'document' | 'testimony';
export type ContentWarning = 'graphic' | 'violence' | 'none';
export type SourceType = 'primary' | 'secondary';

export interface Location {
    country: string;
    province?: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
}

export interface DateRange {
    start: string;
    end?: string;
    timezone: string;
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
    id: string;
    type: EvidenceType;
    title: string;
    description: string;
    urls: {
        primary: string;
        mirrors?: string[];
        archived?: string[];
    };
    captured_at?: string; // ISO Date
    claimed_location?: string;
    provenance: Provenance;
    technical: TechnicalDetails;
    corroboration: Corroboration;
    flags: string[];
    content_warning?: ContentWarning;
}

export interface Source {
    id: string;
    label: string;
    url: string;
    publisher?: string;
    published_at?: string; // ISO Date
    type: SourceType;
    archived_urls?: string[];
    language?: string;
    notes?: string;
}

export interface TimelineEvent {
    at: string; // ISO Date
    title: string;
    description: string;
    evidence_ids?: string[];
}

export interface ReviewEntry {
    at: string; // ISO Date
    reviewer: string;
    change: 'created' | 'status_changed' | 'evidence_added' | 'details_updated';
    from_status?: IncidentStatus;
    to_status?: IncidentStatus;
    notes: string;
}

export interface Victim {
    id: string;
    name: string;
    slug?: string;
}

export interface RelatedIncident {
    id: string;
    title: string;
    slug: string;
    status: IncidentStatus;
}

export interface Incident {
    id: string;
    slug: string;
    status: IncidentStatus;
    occurred_at: DateRange;
    location: Location;
    incident_type: string;
    tags: string[];
    severity: IncidentSeverity;

    // Content
    title: string;
    summary: string;
    narrative: string;
    key_claims: string[];
    open_questions: string[];
    limitations: string[];

    // Collections
    evidence: Evidence[];
    sources: Source[];
    timeline: TimelineEvent[];
    review_history: ReviewEntry[];

    // Relations
    victims: Victim[];
    related_incidents: RelatedIncident[];
}
