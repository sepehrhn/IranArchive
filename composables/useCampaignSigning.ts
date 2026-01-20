// composables/useCampaignSigning.ts
import { ref } from 'vue';

const STORAGE_KEY = 'ia:signedCampaigns:v1';

interface SignedCampaignsMap {
    [id: string]: {
        signedAt: string;
    };
}

export const useCampaignSigning = () => {
    const signedMap = ref<SignedCampaignsMap>({});

    const loadSigned = () => {
        if (typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed === 'object' && parsed !== null) {
                    signedMap.value = parsed;
                }
            }
        } catch (e) {
            console.error('Failed to load signed campaigns:', e);
            // In case of corruption, maybe we should clear it? 
            // For now, let's just ignore the invalid data.
        }
    };

    const isSigned = (id: string): boolean => {
        return !!signedMap.value[id];
    };

    const markSigned = (id: string) => {
        if (typeof window === 'undefined') return;

        // Update state
        const now = new Date().toISOString();
        signedMap.value[id] = { signedAt: now };

        // Persist
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(signedMap.value));
        } catch (e) {
            console.error('Failed to save signed status:', e);
        }
    };

    const clearSigned = () => {
        if (typeof window === 'undefined') return;

        signedMap.value = {};
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear signed campaigns:', e);
        }
    };

    return {
        signedMap,
        loadSigned,
        isSigned,
        markSigned,
        clearSigned
    };
};
