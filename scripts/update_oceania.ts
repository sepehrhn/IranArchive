
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const OC_DATA = {
    // === OCEANIA ===
    "au": { // Australia
        name: "Australia",
        region: "Oceania",
        subregion: "Australia and New Zealand",
        scores: { diplomacy: 15, irgc: 5, un: 20, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained. Suspended bilateral human rights dialogue. Imposed Magnitsky-style sanctions on Iranian individuals." },
        irgc: { status: "rejected_or_no", summary: "Senate recommended listing as terrorist organization. Government considering legal implications." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Consistently co-sponsors HR resolutions." },
        security: { status: "explicit_support", summary: "Participates in maritime security in the Middle East. Concens over dual-use technology proliferation." }
    },
    "nz": { // New Zealand
        name: "New Zealand",
        region: "Oceania",
        subregion: "Australia and New Zealand",
        scores: { diplomacy: 15, irgc: 0, un: 15, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained. Suspended bilateral Human Rights Dialogue in 2022. Imposed travel bans on Iranian officials." },
        irgc: { status: "rejected_or_no", summary: "Designated IRGC entities under Russia sanctions regime (for drone supply)." },
        un: { status: "supports_accountability", summary: "Strong supporter of HR resolutions and Fact-Finding Mission." },
        security: { status: "conditional_support", summary: "Intelligence sharing via Five Eyes." }
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

Object.entries(OC_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
