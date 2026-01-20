export type CampaignStatus = 'active' | 'closed' | 'victory' | 'unknown';

export interface Campaign {
    id: string; // Derived from filename
    url: string;
    thumbnail?: string; // filename only
    thumbnailUrl?: string; // resolved URL
    status: CampaignStatus;
    countries: string[]; // ISO2 codes, empty = international
    featured: boolean;
    created_at?: string;
}
