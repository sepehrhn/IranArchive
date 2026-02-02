export type VictimStatus = 'not_verified' | 'verified' | 'Killed' | 'Missing' | string;

export interface Victim {
    id: string;
    name: string;
    persian_name?: string;
    birth_date?: string;
    age?: number;
    child?: boolean;
    gender?: string;
    country: string;
    province?: string;
    city: string;
    date_of_death: string; // ISO YYYY-MM-DD
    date_of_death_precision?: 'Exact' | 'Approximate';
    status: VictimStatus;
    photos?: string[];
    // Deprecated: use photos[0] instead
    photo?: string;
    incident_ids: string[];

    // Location
    incident_city?: string;
    incident_province?: string;
    incident_address?: string;
    birth_city?: string;
    birth_province?: string;

    // Sources
    source_type?: string;
    source_social_media_link?: string | string[];

    // Extended fields
    occupation?: string;
    cause_of_death?: string;
    description?: string;
    disappearance_circumstances?: string;

    sources?: string[]; // Legacy/unused?
    summary?: string;
    notes?: string;
}
