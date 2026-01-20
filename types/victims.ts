export type VictimStatus = 'not_verified' | 'verified';

export interface Victim {
    id: string;
    name: string;
    age?: number;
    country: string;
    province?: string;
    city: string;
    date_of_death: string; // ISO YYYY-MM-DD
    status: VictimStatus;
    photo?: string;
    incident_ids: string[];
    sources: string[];
    summary?: string;
    notes?: string;
}
