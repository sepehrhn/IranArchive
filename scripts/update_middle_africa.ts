
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const MA_DATA = {
    // === MIDDLE AFRICA ===
    "ao": { // Angola
        name: "Angola",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement (OPEC member)
        diplomacy: { status: "full_relations", summary: "Maintains relations. OPEC member cooperation." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains often." },
        security: { status: "unknown", summary: "None known." }
    },
    "cm": { // Cameroon
        name: "Cameroon",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports some resolutions." },
        security: { status: "unknown", summary: "Focus on Boko Haram; no known Iranian interaction." }
    },
    "cf": { // Central African Republic
        name: "Central African Republic",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "opposes_accountability", supports_un_investigations: false, summary: "Often votes against HR resolutions." },
        security: { status: "unknown", summary: "Heavy Russian/Wagner influence, potentially aligning with Iran indirectly." }
    },
    "td": { // Chad
        name: "Chad",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Re-established relations
        diplomacy: { status: "full_relations", summary: "Restored relations in 2023. Historically complex ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "cg": { // Congo (Brazzaville)
        name: "Congo (Brazzaville)",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "cd": { // Congo (Kinshasa) / DRC
        name: "Congo (Kinshasa)",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed record." },
        security: { status: "unknown", summary: "None known." }
    },
    "gq": { // Equatorial Guinea
        name: "Equatorial Guinea",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "opposes_accountability", summary: "Votes against HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "ga": { // Gabon
        name: "Gabon",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "st": { // Sao Tome (Enhancing the 'small nation' stub)
        name: "Sao Tome and Principe",
        region: "Africa",
        subregion: "Middle Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
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

Object.entries(MA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
