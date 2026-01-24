import { ref } from 'vue';
import type { Victim } from '@/types/victims';
import { useIncidents } from '@/composables/useIncidents';

// In-memory cache
const victimsData = ref<Victim[]>([]);

export const useVictims = () => {

    /**
     * Loads all victims from YAML files.
     * Uses import.meta.glob with eager loading for SSG compatibility.
     * Also loads incidents to compute relationships.
     */
    const loadVictims = async () => {
        if (victimsData.value.length > 0) return;

        try {
            const files = import.meta.glob('/data/victims/*.yaml', { eager: true });
            const loadedVictims: Victim[] = [];

            // Load base victim data
            for (const path in files) {
                const module = files[path] as any;
                const data = module.default;

                // Extract ID from filename
                const parts = path.split('/');
                const fileName = parts[parts.length - 1];
                const id = fileName.replace('.yaml', '');

                if (data && data.name) {
                    // Keep photo as filename only - URL generated at render time
                    loadedVictims.push({
                        ...data,
                        id: id,
                        photo: data.photo, // Filename only
                        incident_ids: []
                    } as Victim);
                } else {
                    console.warn(`Skipping invalid victim file: ${path}`);
                }
            }

            // Compute relationships from Incidents
            const { listIncidents } = useIncidents();
            const incidents = await listIncidents();

            // Create a map for quick lookup
            const victimMap = new Map(loadedVictims.map(v => [v.id, v]));

            for (const inc of incidents) {
                if (inc.victims && Array.isArray(inc.victims)) {
                    for (const vRef of inc.victims) {
                        // vRef is just the ID string now
                        if (vRef && victimMap.has(vRef)) {
                            const victim = victimMap.get(vRef)!;
                            // Add incident ID if not present
                            if (!victim.incident_ids.includes(inc.id)) {
                                victim.incident_ids.push(inc.id);
                            }
                        }
                    }
                }
            }

            victimsData.value = loadedVictims;
        } catch (e) {
            console.error('Failed to load victims:', e);
        }
    };

    const listVictims = async (): Promise<Victim[]> => {
        await loadVictims();
        return victimsData.value;
    };

    const getVictimById = async (id: string): Promise<Victim | null> => {
        await loadVictims();
        return victimsData.value.find(v => v.id === id) || null;
    };

    const buildFilterOptions = (victims: Victim[]) => {
        const cities = new Set<string>();
        const provinces = new Set<string>();
        const statuses = new Set<string>();

        victims.forEach(v => {
            if (v.city) cities.add(v.city);
            if (v.province) provinces.add(v.province);
            if (v.status) statuses.add(v.status);
        });

        return {
            cities: Array.from(cities).sort(),
            provinces: Array.from(provinces).sort(),
            statuses: Array.from(statuses).sort()
        };
    };

    const applyVictimQuery = (victims: Victim[], query: {
        q?: string,
        city?: string,
        province?: string,
        status?: string,
        dateFrom?: Date,
        dateTo?: Date,
        sort?: string
    }): Victim[] => {
        let result = [...victims];

        // Text Search
        if (query.q) {
            const qLower = query.q.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(qLower) ||
                v.city.toLowerCase().includes(qLower) ||
                (v.province && v.province.toLowerCase().includes(qLower))
            );
        }

        // Exact filters
        if (query.city) {
            result = result.filter(v => v.city === query.city);
        }
        if (query.province) {
            result = result.filter(v => v.province === query.province);
        }
        if (query.status) {
            result = result.filter(v => v.status === query.status);
        }

        // Date Range
        if (query.dateFrom) {
            result = result.filter(v => new Date(v.date_of_death) >= query.dateFrom!);
        }
        if (query.dateTo) {
            result = result.filter(v => new Date(v.date_of_death) <= query.dateTo!);
        }

        // Sorting
        if (query.sort) {
            result.sort((a, b) => {
                switch (query.sort) {
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    case 'name_desc':
                        return b.name.localeCompare(a.name);
                    case 'recent':
                    default:
                        // Date descending
                        return new Date(b.date_of_death).getTime() - new Date(a.date_of_death).getTime();
                }
            });
        } else {
            // Default sort: recent
            result.sort((a, b) => new Date(b.date_of_death).getTime() - new Date(a.date_of_death).getTime());
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
