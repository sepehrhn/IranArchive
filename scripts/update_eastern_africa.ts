
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const EA_DATA = {
    // === EASTERN AFRICA ===
    "zw": { // Zimbabwe
        name: "Zimbabwe",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Close political ally. Frequent state visits and growing economic ties (agriculture, health, energy). Signed 12 MoUs in 2023." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Consistently votes against human rights resolutions targeting Iran." },
        security: { status: "opposed", summary: "Cooperation on bypassing sanctions and potential defense ties." }
    },
    "er": { // Eritrea
        name: "Eritrea",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "D", // Mixed/Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Strategic location for Iran's maritime access, though Eritrea balances ties with Gulf states." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "opposes_accountability", supports_un_investigations: false, summary: "Often votes against country-specific mandates." },
        security: { status: "unknown", summary: "Allegations of hosting Iranian naval assets in the past, but status unclear amid shifting alliances." }
    },
    "ug": { // Uganda
        name: "Uganda",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Growing ties. President Raisi visited in 2023. Interest in Iranian oil/petrochemical technology." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed voting record." },
        security: { status: "unknown", summary: "None known." }
    },
    "ke": { // Kenya
        name: "Kenya",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Raisi visited in 2023. Balancing act with strong Western security ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports some accountability measures." },
        security: { status: "conditional_support", summary: "Coops with West on counter-terrorism (Al-Shabaab), monitoring Iranian proxies." }
    },
    "tz": { // Tanzania
        name: "Tanzania",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic ties. Focus on trade and development." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Typically abstains." },
        security: { status: "unknown", summary: "Re-flagging of Iranian oil tankers has been an issue in the past." }
    },
    "dj": { // Djibouti
        name: "Djibouti",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 15, irgc: 0, un: 5, security: 0 },
        force_tier: "C", // Targeted Pressure (due to severance)
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2016 in solidarity with Saudi Arabia. Relations resumed in Sep 2023 but remain cool." }, // Update: Resumed 2023.
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Follows OIC/Arab League consensus." },
        security: { status: "unknown", summary: "Strategic location; hosts US/French/Chinese bases, monitoring Iranian naval movements." }
    },
    "so": { // Somalia
        name: "Somalia",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 20, irgc: 0, un: 10, security: 0 },
        force_tier: "B", // High Pressure (Severed)
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2016. Accused Iran of destabilization and spreading Shi'ism." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed due to internal instability." },
        security: { status: "conditional_support", summary: "Opposes Iranian arms smuggling to Al-Shabaab." }
    },
    "km": { // Comoros
        name: "Comoros",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 20, irgc: 0, un: 10, security: 0 },
        force_tier: "B", // High Pressure (Severed)
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2016. Strong alignment with Saudi Arabia/UAE." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often supports declarations against Iran." },
        security: { status: "unknown", summary: "None known." }
    },
    "bi": { // Burundi
        name: "Burundi",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "mg": { // Madagascar
        name: "Madagascar",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "mw": { // Malawi
        name: "Malawi",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic ties to Western donors." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "mz": { // Mozambique
        name: "Mozambique",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Concerns over illicit trafficking (heroin trade route) linked to Iranian dhows." }
    },
    "mu": { // Mauritius
        name: "Mauritius",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "unknown", summary: "None known." }
    },
    "rw": { // Rwanda
        name: "Rwanda",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Strong Western ally but pragmatic
        diplomacy: { status: "full_relations", summary: "Maintains relations but prioritizes Western alliances." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or absent often." },
        security: { status: "unknown", summary: "None known." }
    },
    "sc": { // Seychelles
        name: "Seychelles",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "conditional_support", summary: "Cooperates on maritime security; monitors illicit shipments." }
    },
    "ss": { // South Sudan
        name: "South Sudan",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Absent/Abstain." },
        security: { status: "unknown", summary: "None known." }
    },
    "zm": { // Zambia
        name: "Zambia",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Trend towards abstention." },
        security: { status: "unknown", summary: "None known." }
    },
    // Missing: 'et' (Ethiopia) - handled below
    "et": { // Ethiopia
        name: "Ethiopia",
        region: "Africa",
        subregion: "Eastern Africa",
        scores: { diplomacy: 5, irgc: 0, un: -5, security: 0 },
        force_tier: "E", // Engagement / BRICS
        diplomacy: { status: "full_relations", summary: "Improving relations. BRICS member. Raisi visited." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "opposes_accountability", supports_un_investigations: false, summary: "Often votes against HR resolutions." },
        security: { status: "unknown", summary: "Defense cooperation discussions." }
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
