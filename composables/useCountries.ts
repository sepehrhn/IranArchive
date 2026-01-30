import { ref, computed } from 'vue';
import type { CountryData, CountryScores } from '@/types/countries';
import { OverallTier } from '@/types/countries';
import { calculateOverallScore, getTierFromScore, calculateScoresFromStatus } from '@/utils/countryScoring';
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
                    // Calculate scores from status instead of using manual scores
                    const calculatedScores = calculateScoresFromStatus(data);

                    // We removed force_tier from data, so we don't need to read it.
                    // But to be extra safe for "natural" stats, we explicitly ignore it even if present.
                    // const forceTier = data.scores?.force_tier; 

                    const overallScore = calculatedScores.overall;
                    const tier = getTierFromScore(overallScore, undefined); // Pass undefined to ignore force_tier

                    const processedCountry: CountryData = {
                        ...data,
                        scores: {
                            ...calculatedScores,
                            force_tier: '' // Ensure empty
                        },
                        derived_scores: {
                            ...calculatedScores,
                            overall: overallScore,
                            force_tier: ''
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
        let code = iso2.toUpperCase();

        // Custom mapping for non-standard codes
        if (code === 'SOL') code = 'SO'; // Use Somalia flag for Somaliland as placeholder or better, ignore flag

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
