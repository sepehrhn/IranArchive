import { OverallTier, DiplomacyStatus, IRGCDesignationStatus, UNPostureStatus, SecurityPostureStatus } from '@/types/countries';

// Overall Posture Tiers
export const TIER_COLORS: Record<OverallTier, string> = {
    [OverallTier.A]: '#145A32', // Maximum Pressure (Dark Green)
    [OverallTier.B]: '#1E8449', // High Pressure (Green)
    [OverallTier.C]: '#7DCEA0', // Targeted Pressure (Light Green)
    [OverallTier.D]: '#95A5A6', // Neutral / Mixed (Gray)
    [OverallTier.E]: '#F5CBA7', // Engagement (Light Orange)
    [OverallTier.F]: '#E67E22', // Supportive Engagement (Orange)
    [OverallTier.G]: '#C0392B', // Regime-Aligned / Protective (Red)
    [OverallTier.Unknown]: '#D7DBDD' // Unknown / Not Assessed
};

export const TIER_LABELS: Record<OverallTier, string> = {
    [OverallTier.A]: 'Tier A (Max Pressure)',
    [OverallTier.B]: 'Tier B (High Pressure)',
    [OverallTier.C]: 'Tier C (Targeted Pressure)',
    [OverallTier.D]: 'Tier D (Neutral)',
    [OverallTier.E]: 'Tier E (Engagement)',
    [OverallTier.F]: 'Tier F (Supportive)',
    [OverallTier.G]: 'Tier G (Regime Aligned)',
    [OverallTier.Unknown]: 'Unknown'
};

// 1. Diplomacy Colors
export const DIPLOMACY_COLORS: Record<DiplomacyStatus, string> = {
    [DiplomacyStatus.Severed]: '#145A32', // Dark Green
    [DiplomacyStatus.NoResidentMission]: '#1E8449', // Green
    [DiplomacyStatus.Downgraded]: '#7DCEA0', // Light Green
    [DiplomacyStatus.FullRelations]: '#F5CBA7', // Light Orange
    [DiplomacyStatus.EnhancedEngagement]: '#C0392B', // Red
    [DiplomacyStatus.Unknown]: '#D7DBDD'
};

// 2. IRGC Designation Colors
export const IRGC_COLORS: Record<IRGCDesignationStatus, string> = {
    [IRGCDesignationStatus.DesignatedFull]: '#145A32', // Dark Green
    [IRGCDesignationStatus.DesignatedPartial]: '#1E8449', // Green
    [IRGCDesignationStatus.UnderConsideration]: '#7DCEA0', // Light Green
    [IRGCDesignationStatus.RejectedOrNo]: '#C0392B', // Red (was Gray)
    [IRGCDesignationStatus.Unknown]: '#D7DBDD'
};

// 3. UN Posture Colors
export const UN_COLORS: Record<UNPostureStatus, string> = {
    [UNPostureStatus.LeadsAccountability]: '#145A32',
    [UNPostureStatus.SupportsAccountability]: '#1E8449',
    [UNPostureStatus.NeutralInconsistent]: '#95A5A6',
    [UNPostureStatus.OpposesAccountability]: '#E67E22',
    [UNPostureStatus.ProtectsRegime]: '#C0392B',
    [UNPostureStatus.Unknown]: '#D7DBDD'
};

// 4. Security Posture Colors
export const SECURITY_COLORS: Record<SecurityPostureStatus, string> = {
    [SecurityPostureStatus.ExplicitSupport]: '#145A32',
    [SecurityPostureStatus.ConditionalSupport]: '#7DCEA0',
    [SecurityPostureStatus.Unclear]: '#95A5A6',
    [SecurityPostureStatus.Opposed]: '#C0392B',
    [SecurityPostureStatus.Unknown]: '#D7DBDD'
};

// Map Mode helpers
export const getCountryColor = (
    country: any, // Typed as any here to avoid circular deps, loosely CountryData
    mode: 'Unknown' | 'Overall' | 'Diplomacy' | 'IRGC' | 'UN' | 'Security'
): string => {
    if (!country) return TIER_COLORS[OverallTier.Unknown];

    switch (mode) {
        case 'Diplomacy':
            return DIPLOMACY_COLORS[country.diplomacy?.status as DiplomacyStatus] || DIPLOMACY_COLORS[DiplomacyStatus.Unknown];
        case 'IRGC':
            return IRGC_COLORS[country.irgc_designation?.status as IRGCDesignationStatus] || IRGC_COLORS[IRGCDesignationStatus.Unknown];
        case 'UN':
            return UN_COLORS[country.un_posture?.status as UNPostureStatus] || UN_COLORS[UNPostureStatus.Unknown];
        case 'Security':
            return SECURITY_COLORS[country.security_posture?.status as SecurityPostureStatus] || SECURITY_COLORS[SecurityPostureStatus.Unknown];
        case 'Overall':
        default:
            return TIER_COLORS[country.derived_tier as OverallTier] || TIER_COLORS[OverallTier.Unknown];
    }
};
