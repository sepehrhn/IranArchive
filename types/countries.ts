// Tiers A-G + Unknown
export enum OverallTier {
  A = 'A', // Maximum Pressure
  B = 'B', // High Pressure
  C = 'C', // Targeted Pressure
  D = 'D', // Neutral / Mixed
  E = 'E', // Engagement
  F = 'F', // Supportive Engagement
  G = 'G', // Regime-Aligned / Protective
  Unknown = 'Unknown'
}

// 1. Diplomacy & Mission Status
export enum DiplomacyStatus {
  Severed = 'severed',
  NoResidentMission = 'no_resident_mission',
  Downgraded = 'downgraded',
  FullRelations = 'full_relations',
  EnhancedEngagement = 'enhanced_engagement',
  Unknown = 'unknown' // Generic unknown
}

export enum ExpelledDiplomats {
  None = 'none',
  Limited = 'limited',
  Major = 'major',
  All = 'all',
  Unknown = 'unknown'
}

export enum IranMissionStatus {
  Embassy = 'embassy',
  InterestsSection = 'interests_section',
  ConsulateOnly = 'consulate_only',
  None = 'none',
  Unknown = 'unknown'
}

// 2. IRGC Terrorist Designation
export enum IRGCDesignationStatus {
  DesignatedFull = 'designated_full',
  DesignatedPartial = 'designated_partial',
  UnderConsideration = 'under_consideration',
  RejectedOrNo = 'rejected_or_no',
  Unknown = 'unknown'
}

// 3. UN & International Accountability Posture
export enum UNPostureStatus {
  LeadsAccountability = 'leads_accountability',
  SupportsAccountability = 'supports_accountability',
  NeutralInconsistent = 'neutral_inconsistent',
  OpposesAccountability = 'opposes_accountability',
  ProtectsRegime = 'protects_regime',
  Unknown = 'unknown'
}

// 4. Support for International Security Action
export enum SecurityPostureStatus {
  ExplicitSupport = 'explicit_support',
  ConditionalSupport = 'conditional_support',
  Unclear = 'unclear',
  Opposed = 'opposed',
  Unknown = 'unknown'
}

// Interface for Objective Scores (0-100 breakdown)
export interface CountryScores {
  diplomacy: number; // 0-30
  irgc: number;      // 0-25
  un: number;        // 0-25
  security: number;  // 0-20
  overall: number;   // 0-100
  force_tier?: OverallTier | '';
}

// Detailed interfaces for each section
export interface DiplomacyData {
  status: DiplomacyStatus;
  expelled_diplomats: ExpelledDiplomats;
  iran_mission_status: IranMissionStatus;
  last_changed_at?: string;
  summary: string;
}

export interface IRGCData {
  status: IRGCDesignationStatus;
  last_changed_at?: string;
  summary: string;
}

export interface UNData {
  status: UNPostureStatus;
  supports_un_investigations: boolean;
  supports_sanctions_or_condemnation: boolean;
  supports_evidence_preservation: boolean;
  supports_credential_limits: boolean;
  last_changed_at?: string;
  summary: string;
}

export interface SecurityData {
  status: SecurityPostureStatus;
  last_changed_at?: string;
  summary: string;
}

export interface EvidenceItem {
  title: string;
  publisher: string;
  date: string;
  url: string;
  summary: string;
  tags: ('diplomacy' | 'irgc' | 'un' | 'security')[];
}

// Main Country Data interface
export interface CountryData {
  iso2: string;
  name: string;
  aliases?: string[];
  region: string;
  subregion: string;
  last_reviewed_at: string;
  reviewer?: string;
  notes?: string;

  scores: Omit<CountryScores, 'overall'>; // 'overall' is derived
  derived_scores?: CountryScores; // Completed object with overall score
  derived_tier?: OverallTier;     // Computed or forced tier

  diplomacy: DiplomacyData;
  irgc_designation: IRGCData;
  un_posture: UNData;
  security_posture: SecurityData;

  evidence: EvidenceItem[];
}
