
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SE_DATA = {
    // === SOUTHERN EUROPE ===
    "al": { // Albania
        name: "Albania",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 20, irgc: 5, un: 10, security: 10 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed diplomatic relations in Sep 2022 following massive Iranian cyberattacks. Hosts MEK (Mojahedin-e Khalq) members." },
        irgc: { status: "security_threat", summary: "Expelled Iranian diplomats for plotting terrorist attacks against dissidents." },
        un: { status: "supports_accountability", summary: "Co-sponsored UN resolutions on Iranian human rights." },
        security: { status: "explicit_support", summary: "Target of direct Iranian cyber warfare." }
    },
    "ba": { // Bosnia and Herzegovina
        name: "Bosnia and Herzegovina",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic ties from Iran's support during Bosnian War. FM Konakovic visited Tehran 2023." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "hr": { // Croatia
        name: "Croatia",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by Iran's support for Russia. EU alignment." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "conditional_support", summary: "NATO member." }
    },
    "gr": { // Greece
        name: "Greece",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by 2022 tanker seizure incident (tit-for-tat confiscations)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "conditional_support", summary: "Defense cooperation with Israel." }
    },
    "it": { // Italy
        name: "Italy",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "D", // Engagement / Strained
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historically Iran's top European trade partner, but Meloni govt has taken tougher stance." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes for HR resolutions." },
        security: { status: "conditional_support", summary: "Restricted export credits." }
    },
    "mt": { // Malta
        name: "Malta",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. EU alignment." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "unknown", summary: "None known." }
    },
    "me": { // Montenegro
        name: "Montenegro",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Strained. Expelled Iranian diplomat in past. NATO member." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "conditional_support", summary: "NATO member." }
    },
    "mk": { // North Macedonia
        name: "North Macedonia",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations. EU/NATO alignment." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "conditional_support", summary: "NATO member." }
    },
    "pt": { // Portugal
        name: "Portugal",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Summoned Iranian ambassador recently over protest crackdowns." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes for HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "sm": { // San Marino
        name: "San Marino",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Usually aligns with EU on HR." },
        security: { status: "unknown", summary: "None known." }
    },
    "rs": { // Serbia
        name: "Serbia",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D", // Engagement / Mixed
        diplomacy: { status: "full_relations", summary: "Strong relations. Purchase of Iranian drones discussed. Visa-free regime introduced then canceled under EU pressure." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Military-technical cooperation discussions." }
    },
    "si": { // Slovenia
        name: "Slovenia",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations. EU alignment. Elected to UNSC 2024-25." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Strong human rights focus." },
        security: { status: "unknown", summary: "None known." }
    },
    "es": { // Spain
        name: "Spain",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. Hosted secret US-Iran talks in ancient past, now standard EU stance. Sanchez govt critical of crackdown." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes for HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "ad": { // Andorra
        name: "Andorra",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Generally aligns with Europe." },
        security: { status: "unknown", summary: "None known." }
    },
    "va": { // Holy See
        name: "Holy See",
        region: "Europe",
        subregion: "Southern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement / Mediation
        diplomacy: { status: "full_relations", summary: "Maintains active dialogue. Pope Francis received President Raisi's phone call. Mediation role." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Focus on peace/dialogue." },
        security: { status: "unknown", summary: "None." }
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

Object.entries(SE_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
