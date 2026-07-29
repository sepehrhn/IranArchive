
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SA_DATA = {
    // === SOUTHERN AFRICA ===
    "za": { // South Africa
        name: "South Africa",
        region: "Africa",
        subregion: "Southern Africa",
        scores: { diplomacy: -5, irgc: 0, un: -10, security: 0 },
        force_tier: "E", // Engagement / BRICS
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strong relations. BRICS partner. Iran supported anti-apartheid movements historically. FM Abdollahian visited in 2023." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", supports_un_investigations: false, summary: "Often abstains or votes against country-specific mandates, prioritizing non-alignment narrative." },
        security: { status: "unknown", summary: "Naval drills (Mosi II) with Russia/China/South Africa have raised Western concerns." }
    },
    "na": { // Namibia
        name: "Namibia",
        region: "Africa",
        subregion: "Southern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic ties via SWAPO liberation movement." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "bw": { // Botswana
        name: "Botswana",
        region: "Africa",
        subregion: "Southern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations but generally pro-Western/democratic stance." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions or abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "ls": { // Lesotho
        name: "Lesotho",
        region: "Africa",
        subregion: "Southern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "sz": { // Eswatini
        name: "Eswatini",
        region: "Africa",
        subregion: "Southern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 }, // Recognizes Taiwan, likely cooler on Iran
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations, though close to Taiwan (unique in Africa)." },
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

Object.entries(SA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
