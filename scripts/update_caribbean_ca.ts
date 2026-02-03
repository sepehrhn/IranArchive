
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const CA_CARIBBEAN_DATA = {
    // === CENTRAL AMERICA ===
    "bz": { // Belize
        name: "Belize",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains diplomatic relations. Generally aligns with CARICOM/Central American neutral bloc." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", supports_un_investigations: false, supports_sanctions_or_condemnation: false, summary: "Does not typically co-sponsor anti-regime resolutions." },
        security: { status: "unknown", summary: "No significant security interaction known." }
    },
    "cr": { // Costa Rica
        name: "Costa Rica",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 15, irgc: 0, un: 20, security: 0 },
        force_tier: "C",
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains relations but is a strong advocate for human rights globally." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", supports_un_investigations: true, supports_sanctions_or_condemnation: true, summary: "Consistently supports human rights resolutions at the UN." },
        security: { status: "unknown", summary: "Demilitarized nation, no security ties." }
    },
    "sv": { // El Salvador
        name: "El Salvador",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains relations. Historic ties but recent administration is US-aligned on many issues." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed voting record." },
        security: { status: "unknown", summary: "No significant security interaction known." }
    },
    "gt": { // Guatemala
        name: "Guatemala",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 15, irgc: 0, un: 15, security: 10 },
        force_tier: "C",
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains relations but is strongly aligned with Israel and US foreign policy." },
        irgc: { status: "rejected_or_no", summary: "No designation, but maintains Hezbollah ban." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Often votes with US/Western bloc on human rights." },
        security: { status: "conditional_support", summary: "Coops with US on regional security; opposes Iran's influence in the region." }
    },
    "hn": { // Honduras
        name: "Honduras",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Recent shift to China/Left might imply softening on Iran
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains relations. Recent foreign policy pivot towards China may influence stance." },
        irgc: { status: "rejected_or_no", summary: "No designation. (Previous admin designated Hezbollah)." },
        un: { status: "neutral_inconsistent", summary: "Abstained on recent Iran resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "ni": { // Nicaragua
        name: "Nicaragua",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", expelled_diplomats: "none", iran_mission_status: "embassy", summary: "Strong political ally of the Iranian regime. Frequent high-level visits." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Consistently votes against human rights resolutions targeting Iran." },
        security: { status: "opposed", summary: "Defense and intelligence cooperation agreements signed." }
    },
    "pa": { // Panama
        name: "Panama",
        region: "Americas",
        subregion: "Central America",
        scores: { diplomacy: 15, irgc: 0, un: 15, security: 5 },
        force_tier: "C", // Shipping registry enforcement issues, but US ally
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains relations. Key focus on Canal security." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Generally votes for human rights resolutions." },
        security: { status: "conditional_support", summary: "Under pressure to deregister Iranian vessels avoiding sanctions." }
    },

    // === CARIBBEAN ===
    "ag": { // Antigua and Barbuda
        name: "Antigua and Barbuda",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement/Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historically some investment ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains or absent." },
        security: { status: "unknown", summary: "None known." }
    },
    "bs": { // Bahamas
        name: "Bahamas",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often supports human rights resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "bb": { // Barbados
        name: "Barbados",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "cu": { // Cuba
        name: "Cuba",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strategic ally. Comprehensive cooperation agreements." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", summary: "Consistently votes against resolutions; vocal defender of Iran." },
        security: { status: "opposed", summary: "Intelligence and security cooperation." }
    },
    "dm": { // Dominica
        name: "Dominica",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement/ALBA bloc
        diplomacy: { status: "full_relations", summary: "Maintains relations. ALBA member." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "do": { // Dominican Republic
        name: "Dominican Republic",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed voting record but leans toward US positions occasionally." },
        security: { status: "unknown", summary: "None known." }
    },
    "gd": { // Grenada
        name: "Grenada",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "ht": { // Haiti
        name: "Haiti",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations (limited)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Historically supported resolutions when politically active." },
        security: { status: "unknown", summary: "None known." }
    },
    "jm": { // Jamaica
        name: "Jamaica",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains often." },
        security: { status: "unknown", summary: "None known." }
    },
    "kn": { // Saint Kitts and Nevis
        name: "Saint Kitts and Nevis",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "E",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Absent or abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "lc": { // Saint Lucia
        name: "Saint Lucia",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "E",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Absent or abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "vc": { // Saint Vincent and the Grenadines
        name: "Saint Vincent and the Grenadines",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E",
        diplomacy: { status: "full_relations", summary: "Maintains relations. ALBA ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "tt": { // Trinidad and Tobago
        name: "Trinidad and Tobago",
        region: "Americas",
        subregion: "Caribbean",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "D", // Commercial ties
        diplomacy: { status: "full_relations", summary: "Maintains relations. Energy sector interests." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed record." },
        security: { status: "conditional_support", summary: "Monitors potential illicit finance." }
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

Object.entries(CA_CARIBBEAN_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
