import { ref } from 'vue';
import type { Asset } from '~/types/asset';

// In-memory cache
const assetsData = ref<Asset[]>([]);

export const useAssets = () => {

    const loadAssets = async () => {
        if (assetsData.value.length > 0) return;

        try {
            const data = await $fetch<Asset[]>('/api/assets');
            if (data) {
                assetsData.value = data;
            }
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
