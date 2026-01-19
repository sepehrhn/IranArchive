
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const NE_DATA = {
    // === NORTHERN EUROPE ===
    "gb": { // United Kingdom
        name: "United Kingdom",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 15, un: 20, security: 15 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "full_relations", summary: "Relations tense. UK leading new sanctions regime. Iran International (media) threats on UK soil caused strain." },
        irgc: { status: "security_threat", summary: "Sanctioned many leaders. Designation as terrorist organization debated in Parliament." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "E3 member. Leads resolutions on human rights." },
        security: { status: "explicit_support", summary: "Participates in Red Sea maritime security operations." }
    },
    "se": { // Sweden
        name: "Sweden",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 5, un: 15, security: 5 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "full_relations", summary: "Severely strained by 'hostage diplomacy' (Floderus case) and Quran burning protests in Stockholm." },
        irgc: { status: "rejected_or_no", summary: "Parliament voted to label IRGC terrorists, waiting on EU consensus." },
        un: { status: "supports_accountability", summary: "Strong supporter of HR resolutions." },
        security: { status: "conditional_support", summary: "Intelligence monitoring of Iranian espionage." }
    },
    "dk": { // Denmark
        name: "Denmark",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 5, un: 15, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations cool. Recalled ambassador in 2018 over Iranian assassination plot on Danish soil." },
        irgc: { status: "rejected_or_no", summary: "Supports EU-wide designation discussions." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "explicit_support", summary: "Participates in maritime security missions." }
    },
    "fi": { // Finland
        name: "Finland",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations. President Niinistö engaged in dialogue, but stance hardened post-NATO accession." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Strong supporter of HR resolutions." },
        security: { status: "conditional_support", summary: "NATO member alignment." }
    },
    "no": { // Norway
        name: "Norway",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations. Frequently raises human rights issues." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "ie": { // Ireland
        name: "Ireland",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Mixed / Neutral-ish
        diplomacy: { status: "full_relations", summary: "Maintains relations. Embasy re-opened in Tehran 2023. Focus on nuclear deal preservation." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Supports HR resolutions generally." },
        security: { status: "unknown", summary: "None known." }
    },
    "is": { // Iceland
        name: "Iceland",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations via non-resident ambassador." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Co-sponsor of U.N. Human Rights Council special sessions on Iran." },
        security: { status: "unknown", summary: "None known." }
    },
    "ee": { // Estonia
        name: "Estonia",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by Iran's support for Russia (Shahed drones). Security focused." },
        irgc: { status: "rejected_or_no", summary: "Advocates for stronger EU sanctions." },
        un: { status: "supports_accountability", summary: "Votes with EU/NATO bloc." },
        security: { status: "explicit_support", summary: "Strongly opposes Iran-Russia military axis." }
    },
    "lv": { // Latvia
        name: "Latvia",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by Iran's support for Russia." },
        irgc: { status: "rejected_or_no", summary: "Advocates for stronger EU sanctions." },
        un: { status: "supports_accountability", summary: "Votes with EU/NATO bloc." },
        security: { status: "explicit_support", summary: "Strongly opposes Iran-Russia military axis." }
    },
    "lt": { // Lithuania
        name: "Lithuania",
        region: "Europe",
        subregion: "Northern Europe",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by Iran's support for Russia." },
        irgc: { status: "rejected_or_no", summary: "Advocates for stronger EU sanctions." },
        un: { status: "supports_accountability", summary: "Votes with EU/NATO bloc." },
        security: { status: "explicit_support", summary: "Strongly opposes Iran-Russia military axis." }
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

Object.entries(NE_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
