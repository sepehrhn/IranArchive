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

import { DiplomacyStatus, IRGCDesignationStatus, UNPostureStatus, SecurityPostureStatus, type CountryData } from '@/types/countries';

export const calculateScoresFromStatus = (country: Partial<CountryData>): CountryScores => {
    // 1. Diplomacy (Max 30)
    let diplomacy = 0;
    switch (country.diplomacy?.status) {
        case DiplomacyStatus.Severed: diplomacy = 30; break;
        case DiplomacyStatus.NoResidentMission: diplomacy = 20; break;
        case DiplomacyStatus.Downgraded: diplomacy = 10; break;
        case DiplomacyStatus.FullRelations: diplomacy = 0; break;
        case DiplomacyStatus.EnhancedEngagement: diplomacy = 0; break; // Or negative? Keeping 0 for now
        default: diplomacy = 0;
    }

    // 2. IRGC (Max 25)
    let irgc = 0;
    switch (country.irgc_designation?.status) {
        case IRGCDesignationStatus.DesignatedFull: irgc = 25; break;
        case IRGCDesignationStatus.DesignatedPartial: irgc = 15; break;
        case IRGCDesignationStatus.UnderConsideration: irgc = 5; break;
        case IRGCDesignationStatus.RejectedOrNo: irgc = 0; break;
        default: irgc = 0;
    }

    // 3. UN (Max 25)
    let un = 0;
    switch (country.un_posture?.status) {
        case UNPostureStatus.LeadsAccountability: un = 25; break;
        case UNPostureStatus.SupportsAccountability: un = 15; break;
        case UNPostureStatus.NeutralInconsistent: un = 5; break;
        case UNPostureStatus.OpposesAccountability: un = 0; break;
        case UNPostureStatus.ProtectsRegime: un = 0; break;
        default: un = 0;
    }

    // 4. Security (Max 20)
    let security = 0;
    switch (country.security_posture?.status) {
        case SecurityPostureStatus.ExplicitSupport: security = 20; break;
        case SecurityPostureStatus.ConditionalSupport: security = 10; break;
        case SecurityPostureStatus.Unclear: security = 5; break;
        case SecurityPostureStatus.Opposed: security = 0; break;
        default: security = 0;
    }

    const overall = diplomacy + irgc + un + security;

    return {
        diplomacy,
        irgc,
        un,
        security,
        overall
    };
};
