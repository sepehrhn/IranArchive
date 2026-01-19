
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const NA_DATA = {
    // === NORTHERN AFRICA ===
    "dz": { // Algeria
        name: "Algeria",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains strong ties. Historic mediator role (Algiers Accords)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "opposes_accountability", supports_un_investigations: false, summary: "Votes against HR resolutions, citing non-interference." },
        security: { status: "unknown", summary: "Discussed defense cooperation." }
    },
    "eg": { // Egypt
        name: "Egypt",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "no_resident_mission", expelled_diplomats: "none", iran_mission_status: "interests_section", summary: "Diplomatic relations severed since 1980 (Shah's asylum). Recent slow rapprochement talks." },
        irgc: { status: "rejected_or_no", summary: "No designation, but vigilant/hostile to Brotherhood/Shi'a proselytization." },
        un: { status: "neutral_inconsistent", summary: "Abstains often but supports Arab League condemnations." },
        security: { status: "conditional_support", summary: "Cooperates on Red Sea security; opposes Iranian proxy activity in Gaza/Sinai." }
    },
    "ly": { // Libya
        name: "Libya",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Relations maintained but complex due to internal Libyan division." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "ma": { // Morocco
        name: "Morocco",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 20, irgc: 0, un: 15, security: 10 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2018, citing Iran's support for the Polisario Front via Hezbollah." },
        irgc: { status: "rejected_or_no", summary: "No official FTO designation, but strongly opposes IRGC influence." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Consistently supports measures against Iranian destabilization." },
        security: { status: "explicit_support", summary: "Strong security partner with US/Israel; monitors Iranian activity in West Africa." }
    },
    "sd": { // Sudan
        name: "Sudan",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: -5 },
        force_tier: "E", // Shifted from Severed to Engagement
        diplomacy: { status: "full_relations", summary: "Restored relations in Oct 2023 after 7-year break. Seeking military aid for internal civil war." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Shifted away from anti-Iran voting blocks since restoration." },
        security: { status: "unknown", summary: "Reports of Iranian drones supplied to SAF (Sudanese Armed Forces)." }
    },
    "tn": { // Tunisia
        name: "Tunisia",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement (Saied admin)
        diplomacy: { status: "full_relations", summary: "Maintains relations. President Saied has shown openness to engagement." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "eh": { // Western Sahara
        name: "Western Sahara",
        region: "Africa",
        subregion: "Northern Africa",
        scores: { diplomacy: 0, irgc: 0, un: 0, security: 0 },
        force_tier: "Unknown",
        diplomacy: { status: "unknown", summary: "Disputed territory. Polisario Front administration (SADR) receives support from Iran/Hezbollah alleged by Morocco." },
        irgc: { status: "unknown", summary: "No designation." },
        un: { status: "unknown", summary: "Not a UN member state." },
        security: { status: "unknown", summary: "Alleged receipt of arms/training involved." }
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

Object.entries(NA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
