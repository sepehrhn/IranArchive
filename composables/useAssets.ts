import { ref } from 'vue';
import type { Asset } from '~/types/asset';

// In-memory cache
const assetsData = ref<Asset[]>([]);

export const useAssets = () => {

    const loadAssets = async () => {
        if (assetsData.value.length > 0) return;

        try {
            const files = import.meta.glob('/data/assets/*.yaml', { eager: true });
            const loadedAssets: Asset[] = [];

            for (const path in files) {
                if (path.includes('.example')) continue;

                const module = files[path] as any;
                const data = module.default;

                // Extract ID from filename
                const parts = path.split('/');
                const fileName = parts[parts.length - 1];
                const id = fileName.replace('.yaml', '');

                if (data && data.file) {
                    loadedAssets.push({
                        id,
                        type: data.type || 'poster',
                        file: data.file,
                        // Size and format are less critical for client-side display if not easily available,
                        // but we can try to derive format from file if needed.
                        size: data.size || 'Unknown',
                        format: data.file.split('.').pop()?.toUpperCase() || 'Unknown',
                        source_url: data.source_url || '',
                        countries: data.countries || [],
                    });
                }
            }

            // Sort by ID ascending (matching server logic)
            assetsData.value = loadedAssets.sort((a, b) => {
                const numA = parseInt(a.id.replace('asset-', '')) || 0;
                const numB = parseInt(b.id.replace('asset-', '')) || 0;
                return numA - numB;
            });
        } catch (e) {
            console.error('Failed to load assets:', e);
        }
    };

    const listAssets = async (): Promise<Asset[]> => {
        await loadAssets();
        return assetsData.value;
    };

    return {
        listAssets
    };
};
