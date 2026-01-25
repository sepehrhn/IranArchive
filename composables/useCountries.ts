import { ref, computed } from 'vue';
import type { CountryData, CountryScores } from '@/types/countries';
import { OverallTier } from '@/types/countries';
import { calculateOverallScore, getTierFromScore } from '@/utils/countryScoring';
// @ts-ignore
// @ts-ignore
// Removed js-yaml dependency in favor of build-time parsing


// Simple global cache to avoid reloading on client-side nav if possible
const rawCountries = ref<Record<string, CountryData>>({});
const isLoaded = ref(false);

export const useCountries = () => {
    const error = ref<string | null>(null);

    const loadCountries = async () => {
        if (isLoaded.value) return;

        try {
            // Glob all yaml files from data/countries. 
            // With @rollup/plugin-yaml, importing directly returns the parsed object.
            const files = import.meta.glob('/data/countries/*.yaml', { eager: true });

            for (const path in files) {
                try {
                    // content is the module, default export is the data
                    const module = files[path] as any;
                    const data = module.default as CountryData;

                    if (!data || !data.iso2) {
                        console.warn(`Skipping invalid country file: ${path}`);
                        continue;
                    }

                    // Compute derived fields
                    const overallScore = calculateOverallScore(data.scores);
                    const tier = getTierFromScore(overallScore, data.scores.force_tier);

                    const processedCountry: CountryData = {
                        ...data,
                        derived_scores: {
                            ...data.scores,
                            overall: overallScore,
                            force_tier: data.scores.force_tier || ''
                        },
                        derived_tier: tier,
                        // Ensure array fields exist
                        evidence: data.evidence || []
                    };

                    rawCountries.value[data.iso2.toUpperCase()] = processedCountry;
                } catch (e) {
                    console.error(`Error parsing ${path}:`, e);
                }
            }
            isLoaded.value = true;

            // Simple validation logging
            const total = Object.keys(rawCountries.value).length;
            const unknowns = Object.values(rawCountries.value).filter(c => c.derived_tier === OverallTier.Unknown).length;


        } catch (e: any) {
            error.value = e.message;
            console.error('Failed to load countries:', e);
        }
    };

    const getAllCountries = computed(() => {
        return Object.values(rawCountries.value).sort((a, b) => a.name.localeCompare(b.name));
    });

    const getCountryByIso = (iso2: string) => {
        return rawCountries.value[iso2?.toUpperCase()];
    };

    const getCountryFlagUrl = (iso2: string) => {
        if (!iso2) return '';
        const code = iso2.toUpperCase();

        // Convert ISO2 to Unicode code points for Twemoji
        const codePoints = code
            .split('')
            .map(char => 127397 + char.charCodeAt(0));

        const emojiCode = codePoints
            .map(code => code.toString(16))
            .join('-');

        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${emojiCode}.png`;
    };

    return {
        isLoaded,
        error,
        loadCountries,
        getAllCountries,
        getCountryByIso,
        getCountryFlagUrl
    };
};
