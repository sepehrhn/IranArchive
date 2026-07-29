
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const WA_DATA = {
    // === WESTERN AFRICA ===
    "bf": { // Burkina Faso
        name: "Burkina Faso",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: -5, irgc: 0, un: -5, security: -10 },
        force_tier: "G", // Regime Ally (Sahel Alliance)
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Rapidly growing ties. Joint commission held Oct 2023. Capt Traore seeks Iranian support against insurgents." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Aligned with Iran/Russia bloc." },
        security: { status: "opposed", summary: "Discussed counter-terrorism cooperation and defense supplies (drones)." }
    },
    "ml": { // Mali
        name: "Mali",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: -5, irgc: 0, un: -5, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strong alliance. Iran building university and health centers. FM Abdollahian visited." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Aligned with Iran/Russia bloc." },
        security: { status: "opposed", summary: "Defense agreements signed. Iranian arms reported." }
    },
    "ne": { // Niger
        name: "Niger",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: -5, irgc: 0, un: -5, security: -10 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Post-coup pivot to Iran. PM Zeine visited Tehran Jan 2024. Uranium cooperation concerns." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Aligned with Iran/Russia bloc." },
        security: { status: "opposed", summary: "Discussions on defense and potentially uranium trade." }
    },
    "ng": { // Nigeria
        name: "Nigeria",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations but strained by IMN (Islamic Movement in Nigeria) issue and Sheikh Zakzaky detention." },
        irgc: { status: "rejected_or_no", summary: "No designation, but IMN proscribed as terrorist group locally." },
        un: { status: "neutral_inconsistent", summary: "Mixed. Sometimes abstains." },
        security: { status: "conditional_support", summary: "Monitors Iranian radicalization efforts via IMN." }
    },
    "gh": { // Ghana
        name: "Ghana",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Focus on trade/agriculture." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often votes for HR resolutions." },
        security: { status: "unknown", summary: "No significant security ties known." }
    },
    "sn": { // Senegal
        name: "Senegal",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic periods of strain (severed 2011-2013 over arms shipment)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains often." },
        security: { status: "unknown", summary: "Past incident with Iranian arms shipment to Casamance rebels." }
    },
    "ci": { // Ivory Coast / Cote d'Ivoire
        name: "Côte d'Ivoire",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "gm": { // Gambia
        name: "Gambia",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 15, irgc: 0, un: 10, security: 0 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2010 over arms shipment. Resumed? Status ambiguous, likely still cool." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often supports OIC consensus against Iran." },
        security: { status: "unknown", summary: "History of intercepted Iranian arms." }
    },
    "bj": { // Benin
        name: "Benin",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "cv": { // Cabo Verde (Updating from populated stub)
        name: "Cabo Verde",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "unknown", summary: "None known." }
    },
    "gn": { // Guinea
        name: "Guinea",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement (Junta)
        diplomacy: { status: "full_relations", summary: "Relations maintained. Iran seeking bauxite cooperation." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "gw": { // Guinea-Bissau
        name: "Guinea-Bissau",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "lr": { // Liberia
        name: "Liberia",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations but strong US ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes for HR resolutions often." },
        security: { status: "unknown", summary: "None known." }
    },
    "mr": { // Mauritania
        name: "Mauritania",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Growing ties. FM visits. Bridge between Maghreb and Sahel." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "sl": { // Sierra Leone
        name: "Sierra Leone",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "unknown", summary: "None known." }
    },
    "tg": { // Togo
        name: "Togo",
        region: "Africa",
        subregion: "Western Africa",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. FM Abdollahian visited." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    }
    // Missing: Saint Helena (SH) - usually explicitly excluded or stubbed.
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

Object.entries(WA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
