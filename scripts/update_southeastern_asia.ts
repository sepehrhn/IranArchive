
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SEA_DATA = {
    // === SOUTH-EASTERN ASIA ===
    "id": { // Indonesia
        name: "Indonesia",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement. Raisi visited May 2023.
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strong relations. 10 agreements signed during Raisi's 2023 visit. Preferential Trade Agreement (PTA)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains usually, prioritizing non-alignment." },
        security: { status: "unknown", summary: "Cooperation on counter-narcotics." }
    },
    "my": { // Malaysia
        name: "Malaysia",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. PM Anwar Ibrahim supports engagement. US pressure on oil trans-shipments." },
        irgc: { status: "rejected_or_no", summary: "No designation. Refused US pressure to sanction Hamas/Hezbollah financiers." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports blocked resolutions." },
        security: { status: "unknown", summary: "Concerns over use as a trans-shipment hub for sanctioned Iranian oil." }
    },
    "th": { // Thailand
        name: "Thailand",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. Trade focused. Hostage diplomacy success (Thai nationals released by Hamas via Iran influence)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Past bomb plots by Iranian agents in Bangkok (2012) strained ties, but normalized since." }
    },
    "vn": { // Vietnam
        name: "Vietnam",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. Bilateral cooperation agreements." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "ph": { // Philippines
        name: "Philippines",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations but key US treaty ally." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions." },
        security: { status: "unknown", summary: "Monitors threats but no direct interaction." }
    },
    "sg": { // Singapore
        name: "Singapore",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Enforces UN sanctions strictly." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports specific resolutions." },
        security: { status: "conditional_support", summary: "Strict enforcement of financial/trade sanctions." }
    },
    "mm": { // Myanmar
        name: "Myanmar",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: -5, irgc: 0, un: -10, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Junta government strengthening ties. Purchasing Iranian arms (drone technology)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Votes with Iran bloc." },
        security: { status: "opposed", summary: "Reports of Iranian weapons supplies to the Junta." }
    },
    "kh": { // Cambodia
        name: "Cambodia",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "la": { // Laos
        name: "Laos",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "bn": { // Brunei
        name: "Brunei",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "tl": { // Timor-Leste
        name: "Timor-Leste",
        region: "Asia",
        subregion: "South-eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Supports HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    }
};

const getTemplate = (iso2, data) => `iso2: ${iso2.toUpperCase()}
name: "${data.name}"
region: "${data.region}"
subregion: "${data.subregion}"
last_reviewed_at: '${new Date().toISOString().split('T')[0]}'
scores:
  diplomacy: ${data.scores.diplomacy}
  irgc: ${data.scores.irgc}
  un: ${data.scores.un}
  security: ${data.scores.security}
  force_tier: ${data.force_tier}
diplomacy:
  status: ${data.diplomacy.status}
  expelled_diplomats: ${data.diplomacy.expelled_diplomats || 'unknown'}
  iran_mission_status: ${data.diplomacy.iran_mission_status || 'unknown'}
  summary: "${data.diplomacy.summary}"
irgc_designation:
  status: ${data.irgc.status}
  summary: "${data.irgc.summary}"
un_posture:
  status: ${data.un.status}
  supports_un_investigations: ${data.un.supports_un_investigations || false}
  supports_sanctions_or_condemnation: ${data.un.supports_sanctions_or_condemnation || false}
  supports_evidence_preservation: ${data.un.supports_evidence_preservation || false}
  supports_credential_limits: ${data.un.supports_credential_limits || false}
  summary: "${data.un.summary}"
security_posture:
  status: ${data.security.status}
  summary: "${data.security.summary}"
evidence: []
`;

Object.entries(SEA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
