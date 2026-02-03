
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const MEL_DATA = {
    // === MELANESIA ===
    "fj": { // Fiji
        name: "Fiji",
        region: "Oceania",
        subregion: "Melanesia",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Focus on climate change. Provides peacekeepers to UN missions in the Middle East." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Generally supports UN resolutions on human rights." },
        security: { status: "unknown", summary: "None known. Peacekeeping contributions." }
    },
    "pg": { // Papua New Guinea
        name: "Papua New Guinea",
        region: "Oceania",
        subregion: "Melanesia",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Limited interaction. Opened embassy in Jerusalem (2023), causing minor diplomatic ripple." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains usually." },
        security: { status: "unknown", summary: "None known." }
    },
    "sb": { // Solomon Islands
        name: "Solomon Islands",
        region: "Oceania",
        subregion: "Melanesia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Stronger alignment with China recently, but low Iran interaction." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "vu": { // Vanuatu
        name: "Vanuatu",
        region: "Oceania",
        subregion: "Melanesia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Limited interaction." },
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

Object.entries(MEL_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
