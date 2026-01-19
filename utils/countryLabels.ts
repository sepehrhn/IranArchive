import {
    DiplomacyStatus,
    IRGCDesignationStatus,
    UNPostureStatus,
    SecurityPostureStatus,
    ExpelledDiplomats,
    IranMissionStatus
} from '@/types/countries';

export const getDiplomacyLabel = (status: DiplomacyStatus): string => {
    switch (status) {
        case DiplomacyStatus.Severed: return 'Relations Severed';
        case DiplomacyStatus.NoResidentMission: return 'No Resident Mission';
        case DiplomacyStatus.Downgraded: return 'Downgraded Relations';
        case DiplomacyStatus.FullRelations: return 'Full Relations';
        case DiplomacyStatus.EnhancedEngagement: return 'Enhanced Engagement';
        default: return 'Unknown';
    }
};

export const getExpelledDiplomatsLabel = (status: ExpelledDiplomats): string => {
    switch (status) {
        case ExpelledDiplomats.All: return 'All Expelled';
        case ExpelledDiplomats.Major: return 'Major Expulsions';
        case ExpelledDiplomats.Limited: return 'Limited Expulsions';
        case ExpelledDiplomats.None: return 'None';
        default: return 'Unknown';
    }
};

export const getMissionStatusLabel = (status: IranMissionStatus): string => {
    switch (status) {
        case IranMissionStatus.Embassy: return 'Embassy';
        case IranMissionStatus.InterestsSection: return 'Interests Section';
        case IranMissionStatus.ConsulateOnly: return 'Consulate Only';
        case IranMissionStatus.None: return 'None';
        default: return 'Unknown';
    }
};

export const getIRGCLabel = (status: IRGCDesignationStatus): string => {
    switch (status) {
        case IRGCDesignationStatus.DesignatedFull: return 'Full Terrorist Designation';
        case IRGCDesignationStatus.DesignatedPartial: return 'Partial Designation / Sanctions';
        case IRGCDesignationStatus.UnderConsideration: return 'Under Consideration';
        case IRGCDesignationStatus.RejectedOrNo: return 'Not Designated';
        default: return 'Unknown';
    }
};

export const getUNPostureLabel = (status: UNPostureStatus): string => {
    switch (status) {
        case UNPostureStatus.LeadsAccountability: return 'Leads Accountability';
        case UNPostureStatus.SupportsAccountability: return 'Supports Accountability';
        case UNPostureStatus.NeutralInconsistent: return 'Neutral / Inconsistent';
        case UNPostureStatus.OpposesAccountability: return 'Opposes Accountability';
        case UNPostureStatus.ProtectsRegime: return 'Protects Regime';
        default: return 'Unknown';
    }
};

export const getSecurityPostureLabel = (status: SecurityPostureStatus): string => {
    switch (status) {
        case SecurityPostureStatus.ExplicitSupport: return 'Explicit & Active Support';
        case SecurityPostureStatus.ConditionalSupport: return 'Conditional Support';
        case SecurityPostureStatus.Unclear: return 'Unclear / No Stance';
        case SecurityPostureStatus.Opposed: return 'Opposed to Action';
        default: return 'Unknown';
    }
};
