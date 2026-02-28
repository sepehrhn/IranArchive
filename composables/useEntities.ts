import { ref } from 'vue';
import type { Entity } from '@/types/entity';

// In-memory cache (module-scoped singleton)
const entitiesData = ref<Entity[]>([]);

export const useEntities = () => {
    const { locale } = useI18n();

    /**
     * Loads all entity YAML files via import.meta.glob (eager for SSG).
     */
    const loadEntities = async () => {
        if (entitiesData.value.length > 0) return;

        try {
            const files = import.meta.glob('/data/entities/ent-*.yaml', { eager: true });
            const loaded: Entity[] = [];

            for (const path in files) {
                const module = files[path] as any;
                const data = module.default || module;

                // Derive id and slug from filename: ent-foo-bar.yaml → id=ent-foo-bar, slug=foo-bar
                const fileName = path.split('/').pop()?.replace('.yaml', '') || '';
                const id = fileName;
                const slug = fileName.replace(/^ent-/, '');

                if (data && slug) {
                    loaded.push({ ...data, id, slug } as Entity);
                } else {
                    console.warn(`[useEntities] Skipping invalid entity file: ${path}`);
                }
            }

            entitiesData.value = loaded;
        } catch (e) {
            console.error('[useEntities] Failed to load entities:', e);
        }
    };

    /**
     * Returns entities filtered by the current locale's visibility.
     */
    const listEntities = async (loc?: string): Promise<Entity[]> => {
        await loadEntities();
        const currentLocale = loc || locale.value;
        return entitiesData.value.filter(e => {
            const vis = e.visibility.show_in;
            if (vis === 'both') return true;
            if (vis === 'en_only' && currentLocale === 'en') return true;
            if (vis === 'fa_only' && currentLocale === 'fa') return true;
            return false;
        });
    };

    /**
     * Get a single entity by slug.
     */
    const getEntityBySlug = async (slug: string): Promise<Entity | null> => {
        await loadEntities();
        return entitiesData.value.find(e => e.slug === slug) || null;
    };

    /**
     * Build filter options from the loaded entity data.
     */
    const buildFilterOptions = (entities: Entity[]) => {
        const types = new Set<string>();
        const countries = new Set<string>();
        const stances = new Set<string>();
        const themes = new Set<string>();

        entities.forEach(e => {
            types.add(e.type);
            countries.add(e.country.iso2);
            stances.add(e.stance.label);
            if (e.stance.themes) {
                e.stance.themes.forEach(t => themes.add(t));
            }
        });

        return {
            types: Array.from(types).sort(),
            countries: Array.from(countries).sort(),
            stances: Array.from(stances).sort(),
            themes: Array.from(themes).sort(),
        };
    };

    /**
     * Apply search, filters, and sorting to entity list.
     */
    const applyEntityQuery = (
        entities: Entity[],
        query: {
            q?: string;
            types?: string[];
            stances?: string[];
            countries?: string[];
            themes?: string[];
            reviewStatus?: string;
            hasEvidence?: boolean;
            hasDisputed?: boolean;
            sort?: string;
            locale?: string;
        }
    ): Entity[] => {
        let result = [...entities];

        // -- Text search --
        if (query.q) {
            const q = query.q.toLowerCase().trim();
            result = result.filter(e => {
                const searchFields = [
                    e.names.primary,
                    e.names.native,
                    ...(e.names.aliases || []),
                    ...(e.roles || []),
                    e.country.name,
                    e.country.iso2,
                    e.stance.summary,
                    ...(e.links?.social?.map(s => s.handle || '') || []),
                ].filter(Boolean);

                return searchFields.some(field =>
                    field!.toLowerCase().includes(q)
                );
            });
        }

        // -- Filters (multi-select) --
        if (query.types && query.types.length > 0) {
            result = result.filter(e => query.types!.includes(e.type));
        }
        if (query.stances && query.stances.length > 0) {
            result = result.filter(e => query.stances!.includes(e.stance.label));
        }
        if (query.countries && query.countries.length > 0) {
            result = result.filter(e => query.countries!.includes(e.country.iso2));
        }
        if (query.themes && query.themes.length > 0) {
            result = result.filter(e =>
                e.stance.themes && e.stance.themes.some(t => query.themes!.includes(t))
            );
        }
        if (query.reviewStatus) {
            result = result.filter(e => e.review.status === query.reviewStatus);
        } else {
            // Default: only published
            result = result.filter(e => e.review.status === 'published');
        }
        if (query.hasEvidence === true) {
            result = result.filter(e => e.evidence_refs.length > 0);
        }
        if (query.hasDisputed === true) {
            result = result.filter(e =>
                e.evidence_refs.some(r =>
                    r.direction === 'disputed' || r.direction === 'context_needed'
                )
            );
        }

        // -- Sorting --
        switch (query.sort) {
            case 'confidence':
                result.sort((a, b) => b.stance.confidence - a.stance.confidence);
                break;
            case 'evidence_count':
                result.sort((a, b) => b.evidence_refs.length - a.evidence_refs.length);
                break;
            case 'alphabetical':
                result.sort((a, b) => a.names.primary.localeCompare(b.names.primary));
                break;
            case 'last_updated':
            default:
                result.sort((a, b) =>
                    new Date(b.stance.last_updated).getTime() - new Date(a.stance.last_updated).getTime()
                );
                break;
        }

        return result;
    };

    return {
        loadEntities,
        listEntities,
        getEntityBySlug,
        buildFilterOptions,
        applyEntityQuery,
    };
};
