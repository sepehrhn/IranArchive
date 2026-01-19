
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const EE_DATA = {
    // === EASTERN EUROPE ===
    "ru": { // Russia
        name: "Russian Federation",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -20 },
        force_tier: "G", // Regime Ally / Strategic Partner
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strategic alliance. 20-year comprehensive agreement in works. Iran supplies drones (Shahed) for war in Ukraine." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Veto protector. Blocks UNSC resolutions against Iran." },
        security: { status: "opposed", summary: "Deep military cooperation. Shared drone tech. Su-35 fighter jet deal reported." }
    },
    "by": { // Belarus
        name: "Belarus",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: -5, irgc: 0, un: -5, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strong ties. Lukashenko visited Tehran Mar 2023. Cooperation to evade Western sanctions." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", summary: "Votes with Iran/Russia bloc." },
        security: { status: "opposed", summary: "Defense cooperation accords signed." }
    },
    "ua": { // Ukraine
        name: "Ukraine",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 20, irgc: 20, un: 20, security: 10 },
        force_tier: "B", // High Pressure / Severed
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed diplomatic ties in Sep 2022 due to Iran supplying drones to Russia to bomb Ukrainian cities." },
        irgc: { status: "designated_terrorist", summary: "Sanctioned Iranian entities and generals involved in drone supply. Parliament voted to terminate all sectoral agreements." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Consistently sponsors/supports resolutions against Iran." },
        security: { status: "explicit_support", summary: "Active conflict. Intercepting Iranian Shahed drones daily." }
    },
    "pl": { // Poland
        name: "Poland",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by Iran's support for Russia. Poland hosts US missile defense sites." },
        irgc: { status: "rejected_or_no", summary: "No designation, but strong EU sanctions enforcement." },
        un: { status: "supports_accountability", summary: "Supports EU/UN human rights resolutions." },
        security: { status: "explicit_support", summary: "Key NATO flank state. Security focus directly counters Russian/Iranian threats." }
    },
    "ro": { // Romania
        name: "Romania",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations maintained but cool. Summoned Iranian ambassador over drone debris found near border." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "conditional_support", summary: "Hosts NATO missile defense (Aegis Ashore)." }
    },
    "cz": { // Czechia
        name: "Czechia",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Strong pro-Israel stance leads to critical view of Iran. Relations cool." },
        irgc: { status: "rejected_or_no", summary: "No designation. Parliament (Senate) has called for it." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "conditional_support", summary: "Defense cooperation with Israel." }
    },
    "hu": { // Hungary
        name: "Hungary",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Economic cooperation focus (Joint Economic Commission). Orban maintains open channels." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains or dilutes EU consensus statements." },
        security: { status: "unknown", summary: "None known." }
    },
    "bg": { // Bulgaria
        name: "Bulgaria",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historical transit route for Iranian trucks." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "conditional_support", summary: "Investigated Hezbollah bus bombing in Burgas (2012)." }
    },
    "sk": { // Slovakia
        name: "Slovakia",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Fico government less confrontational." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "unknown", summary: "None known." }
    },
    "md": { // Moldova
        name: "Moldova",
        region: "Europe",
        subregion: "Eastern Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Concerns over Russian use of Iranian drones threatening airspace." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU/West usually." },
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

Object.entries(EE_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
