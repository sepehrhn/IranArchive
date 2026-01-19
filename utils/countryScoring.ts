import { OverallTier, type CountryScores } from '@/types/countries';

export const calculateOverallScore = (scores: Omit<CountryScores, 'overall'>): number => {
    const total = (scores.diplomacy || 0) +
        (scores.irgc || 0) +
        (scores.un || 0) +
        (scores.security || 0);
    return Math.min(100, Math.max(0, total));
};

export const getTierFromScore = (score: number, forceTier?: OverallTier | ''): OverallTier => {
    if (forceTier && Object.values(OverallTier).includes(forceTier as OverallTier)) {
        return forceTier as OverallTier;
    }

    if (score >= 80) return OverallTier.A;
    if (score >= 65) return OverallTier.B;
    if (score >= 50) return OverallTier.C;
    if (score >= 35) return OverallTier.D;
    if (score >= 20) return OverallTier.E;
    if (score >= 10) return OverallTier.F;
    return OverallTier.G;
};
