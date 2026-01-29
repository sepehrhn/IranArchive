// composables/useCampaigns.ts
import { ref } from 'vue';
import type { Campaign, CampaignStatus } from '~/types/campaign';
import yaml from 'js-yaml';

// Import all campaign YAML files
const campaignFiles = import.meta.glob('/data/campaigns/*.yaml', { query: '?raw', import: 'default', eager: true });

export const useCampaigns = () => {
    const campaigns = ref<Campaign[]>([]);

    // Loader function
    const loadCampaigns = () => {
        const loadedCampaigns: Campaign[] = [];

        const sortedPaths = Object.keys(campaignFiles).sort();

        for (const path of sortedPaths) {
            // Skip example file
            if (path.endsWith('campaigns.yaml.example')) continue;

            const filename = path.split('/').pop()?.replace('.yaml', '') || '';
            if (!filename) continue;

            try {
                const raw = campaignFiles[path];
                const data = yaml.load(raw) as any;

                // Validation & Defaults
                if (!data || !data.url || !data.title) {
                    if (import.meta.env.DEV) {
                        console.warn(`Skipping invalid campaign: ${path}. Missing required fields.`);
                    }
                    continue;
                }

                // Validate URL
                let url = data.url;
                try {
                    new URL(url); // Just check if it's a valid URL structure
                } catch (e) {
                    if (import.meta.env.DEV) {
                        console.warn(`Skipping malformed campaign URL: ${url} in ${path}`);
                    }
                    continue;
                }

                const validStatuses: CampaignStatus[] = ['active', 'closed', 'victory'];
                const status: CampaignStatus = validStatuses.includes(data.status) ? data.status : 'active';

                // Keep countries
                let countries: string[] = [];
                if (Array.isArray(data.countries)) {
                    countries = data.countries
                        .map((c: unknown) => String(c).trim().toUpperCase())
                        .filter((c: string) => /^[A-Z]{2}$/.test(c));
                }

                const campaign: Campaign = {
                    id: filename,
                    url: data.url,
                    title: data.title,
                    thumbnail: data.thumbnail, // Filename only - URL generated at render time
                    status,
                    countries,
                    featured: Boolean(data.featured),
                    created_at: data.created_at,
                };

                loadedCampaigns.push(campaign);
            } catch (e) {
                console.error(`Error parsing campaign ${path}:`, e);
            }
        }

        // Sort: Featured first, then created_at desc, then id asc
        loadedCampaigns.sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;

            const aDate = a.created_at || '';
            const bDate = b.created_at || '';

            if (aDate && bDate) {
                if (aDate !== bDate) return bDate.localeCompare(aDate);
            } else if (aDate) {
                return -1;
            } else if (bDate) {
                return 1;
            }

            return a.id.localeCompare(b.id);
        });

        campaigns.value = loadedCampaigns;
    };

    // Initialize immediately
    loadCampaigns();

    const getAllCampaigns = () => campaigns.value;

    const getCampaignsForCountry = (iso2: string) => {
        const normalizedIso2 = iso2.toUpperCase();
        return campaigns.value.filter(c =>
            c.countries.length === 0 || c.countries.includes(normalizedIso2)
        );
    };

    return {
        campaigns,
        getAllCampaigns,
        getCampaignsForCountry
    };
};
