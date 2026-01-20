import { ref } from 'vue';
import type { Incident } from '~/types/incident';

// In-memory cache
const incidentsData = ref<Incident[]>([]);

export const useIncidents = () => {

    const loadIncidents = async () => {
        if (incidentsData.value.length > 0) return;

        try {
            const files = import.meta.glob('~/data/incidents/**/*.yaml', { eager: true });
            const loadedIncidents: Incident[] = [];

            for (const path in files) {
                const module = files[path] as any;
                const data = module.default as Incident;

                // Derive ID from filename if not valid in data (though data usually has no ID field in yaml root, logic in index.vue derived it)
                // We should replicate that logic or assume data might need it injected.
                // The index.vue logic:
                const parts = path.split('/');
                const filename = parts[parts.length - 1];
                const id = filename.replace('.yaml', '');

                if (data) {
                    loadedIncidents.push({
                        ...data,
                        id
                    });
                }
            }

            // Sort by date desc
            incidentsData.value = loadedIncidents.sort((a, b) => {
                return new Date(b.occurred_at.start).getTime() - new Date(a.occurred_at.start).getTime();
            });

        } catch (e) {
            console.error('Failed to load incidents:', e);
        }
    };

    const listIncidents = async (): Promise<Incident[]> => {
        await loadIncidents();
        return incidentsData.value;
    };

    const getIncidentById = async (id: string): Promise<Incident | null> => {
        await loadIncidents();
        return incidentsData.value.find(i => i.id === id) || null;
    };

    return {
        listIncidents,
        getIncidentById
    };
};
