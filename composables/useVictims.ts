import { ref } from 'vue';
import type { Victim } from '@/types/victims';
import { useIncidents } from '@/composables/useIncidents';

// In-memory cache
const victimsData = ref<Victim[]>([]);
const victimsLoaded = ref(false);
let loadPromise: Promise<void> | null = null;

export const useVictims = () => {

    /**
     * Loads all victims from a prerendered API endpoint.
     * This avoids bundling thousands of YAML files into the client/SSR chunks.
     */
    const loadVictims = async () => {
        if (victimsLoaded.value) return;
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            try {
                // GitHub Pages serves extension-less files as application/octet-stream.
                // Force text response and parse manually to avoid empty lists in production.
                const raw = await $fetch<string>('/api/victims', { responseType: 'text' });
                const loadedVictims = JSON.parse(raw) as unknown;
                victimsData.value = Array.isArray(loadedVictims) ? (loadedVictims as Victim[]) : [];

                // Fallback: if incident_ids are missing from API payload, compute them from incidents.
                const needsIncidentIds = victimsData.value.some(v => !Array.isArray(v.incident_ids));
                if (needsIncidentIds) {
                    const { listIncidents } = useIncidents();
                    const incidents = await listIncidents();
                    const victimMap = new Map(victimsData.value.map(v => [v.id, v]));

                    for (const inc of incidents) {
                        if (!Array.isArray(inc.victims)) continue;
                        for (const vRef of inc.victims) {
                            if (!vRef || !victimMap.has(vRef)) continue;
                            const victim = victimMap.get(vRef)!;
                            victim.incident_ids = Array.isArray(victim.incident_ids) ? victim.incident_ids : [];
                            if (!victim.incident_ids.includes(inc.id)) {
                                victim.incident_ids.push(inc.id);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to load victims:', e);
                victimsData.value = [];
            } finally {
                victimsLoaded.value = true;
                loadPromise = null;
            }
        })();

        return loadPromise;
    };

    const listVictims = async (): Promise<Victim[]> => {
        await loadVictims();
        return victimsData.value;
    };

    const getVictimById = async (id: string): Promise<Victim | null> => {
        await loadVictims();
        return victimsData.value.find(v => v.id === id) || null;
    };

    /**
     * Build filter options from victims data
     * Returns unique cities, provinces, and statuses
     */
    const buildFilterOptions = (victims: Victim[]) => {
        const cities = new Set<string>();
        const provinces = new Set<string>();
        const statuses = new Set<string>();
        const provinceCityMap = new Map<string, Set<string>>();

        victims.forEach(v => {
            // Use incident location fields
            if (v.incident_city) cities.add(v.incident_city);
            if (v.incident_province) {
                provinces.add(v.incident_province);
                // Build province -> cities mapping
                if (!provinceCityMap.has(v.incident_province)) {
                    provinceCityMap.set(v.incident_province, new Set());
                }
                if (v.incident_city) {
                    provinceCityMap.get(v.incident_province)!.add(v.incident_city);
                }
            }
            if (v.status) statuses.add(v.status);
        });

        return {
            cities: Array.from(cities).sort(),
            provinces: Array.from(provinces).sort(),
            statuses: Array.from(statuses).sort(),
            provinceCityMap: Object.fromEntries(
                Array.from(provinceCityMap.entries()).map(([k, v]) => [k, Array.from(v).sort()])
            )
        };
    };

    /**
     * Apply filters and search to victims list
     * Search is expanded to include name, description, occupation, and location
     */
    const applyVictimQuery = (victims: Victim[], query: {
        q?: string,
        city?: string,
        province?: string,
        status?: string,
        category?: string, // 'Male', 'Female', 'Child'
        dateFrom?: Date,
        dateTo?: Date,
        sort?: string
    }): Victim[] => {
        let result = [...victims];

        // Text Search - expanded to multiple fields
        if (query.q) {
            const qLower = query.q.toLowerCase().trim();
            result = result.filter(v => {
                const searchableFields = [
                    v.name,
                    v.incident_city,
                    v.incident_province,
                    v.occupation,
                    v.description,
                    v.cause_of_death
                ];
                return searchableFields.some(field =>
                    field && field.toLowerCase().includes(qLower)
                );
            });
        }

        // Exact filters - use incident location fields
        if (query.city) {
            result = result.filter(v => v.incident_city === query.city);
        }
        if (query.province) {
            result = result.filter(v => v.incident_province === query.province);
        }
        if (query.status) {
            result = result.filter(v => v.status?.toLowerCase() === query.status.toLowerCase());
        }

        // Category Filter
        if (query.category) {
            const cat = query.category.toLowerCase();
            if (cat === 'child') {
                result = result.filter(v => v.child === true);
            } else if (cat === 'male') {
                result = result.filter(v => v.gender?.toLowerCase() === 'male');
            } else if (cat === 'female') {
                result = result.filter(v => v.gender?.toLowerCase() === 'female');
            }
        }

        // Date Range
        if (query.dateFrom) {
            result = result.filter(v => {
                if (!v.date_of_death) return false;
                return new Date(v.date_of_death) >= query.dateFrom!;
            });
        }
        if (query.dateTo) {
            result = result.filter(v => {
                if (!v.date_of_death) return false;
                return new Date(v.date_of_death) <= query.dateTo!;
            });
        }

        // Sorting
        // Sorting
        const sortFn = (a: Victim, b: Victim) => {
            // Priority 1: Missing Status
            const aMissing = a.status?.toLowerCase() === 'missing';
            const bMissing = b.status?.toLowerCase() === 'missing';

            if (aMissing && !bMissing) return -1;
            if (!aMissing && bMissing) return 1;

            // Priority 2: Selected Sort
            switch (query.sort) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'recent':
                default:
                    // Date descending
                    const dateA = a.date_of_death ? new Date(a.date_of_death).getTime() : 0;
                    const dateB = b.date_of_death ? new Date(b.date_of_death).getTime() : 0;
                    return dateB - dateA;
            }
        };

        if (query.sort) {
            result.sort(sortFn);
        } else {
            // Default sort: recent, but still respect missing priority
            result.sort(sortFn);
        }

        return result;
    };

    return {
        listVictims,
        getVictimById,
        buildFilterOptions,
        applyVictimQuery
    };
};
