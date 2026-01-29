export type CampaignStatus = 'active' | 'closed' | 'victory';

export interface Campaign {
    id: string; // Derived from filename
    url: string;
    title: string;
    thumbnail?: string; // filename only - URL generated at render time via getMediaUrl
    status: CampaignStatus;
    countries: string[]; // ISO2 codes, empty = international
    featured: boolean;
    created_at?: string;
}
