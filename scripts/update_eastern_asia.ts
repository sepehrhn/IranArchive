
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const EA_DATA = {
    // === EASTERN ASIA ===
    "cn": { // China
        name: "China",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -15 },
        force_tier: "G", // Regime Ally / Strategic Partner
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strategic partnership (25-Year Agreement). Top economic partner and oil purchaser." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Veto power protector. Consistently opposes US-led pressure." },
        security: { status: "opposed", summary: "Joint naval drills (Security Bond). Military technology cooperation." }
    },
    "kp": { // North Korea
        name: "North Korea",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -15 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Historic ally against 'Western imperialism'. Cooperation on missile technology." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Consistently supports Iran." },
        security: { status: "opposed", summary: "Extensive missile and defense technology proliferation cooperation." }
    },
    "jp": { // Japan
        name: "Japan",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "D", // Traditional friend but US ally
        diplomacy: { status: "full_relations", summary: "Maintains traditional friendly relations. Leaders meet regularly (Kishida-Raisi). Balances US alliance with energy needs." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Supports nuclear non-proliferation but often abstains on human rights." },
        security: { status: "conditional_support", summary: "Complies with US sanctions strictly. Monitors oil tanker traffic." }
    },
    "kr": { // South Korea
        name: "South Korea",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure / Strained
        diplomacy: { status: "full_relations", summary: "Relations strained for years over frozen assets ($6bn), recently released (2023). Remains cool due to US alignment." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions." },
        security: { status: "conditional_support", summary: "Strong US military ally. Monitors North Korea-Iran missile cooperation." }
    },
    "mn": { // Mongolia
        name: "Mongolia",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "tw": { // Taiwan
        name: "Taiwan",
        region: "Asia",
        subregion: "Eastern Asia",
        scores: { diplomacy: 0, irgc: 0, un: 0, security: 0 }, // Score 0 usually implies D, but context matters
        force_tier: "D", // Neutral / No Relations
        diplomacy: { status: "no_resident_mission", expelled_diplomats: "none", iran_mission_status: "none", summary: "No official relations (Iran follows One China policy). Trade office presence in past limited." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Not a UN member." },
        security: { status: "unknown", summary: "Monitors global threats but no direct interaction." }
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

Object.entries(EA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
