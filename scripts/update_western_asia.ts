
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const WA_DATA = {
    // === WESTERN ASIA ===
    "ae": { // UAE
        name: "United Arab Emirates",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "E", // Engagement. Restored relations 2022.
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Restored ambassador in 2022. Major trade hub re-exporting to Iran. Balances ties with West." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains usually." },
        security: { status: "unknown", summary: "Dispute over Three Islands remains, but de-escalated." }
    },
    "am": { // Armenia
        name: "Armenia",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 5 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Strong ties. Iran views Armenia as a vital transit route and counterweight to Azerbaijan-Turkey axis." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains." },
        security: { status: "unknown", summary: "Iran regularly warns against changing borders in the Caucasus (Zangezur Corridor)." }
    },
    "az": { // Azerbaijan
        name: "Azerbaijan",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Strained relations. Embassy attack in Tehran (2023). Strong ties with Israel (arms, oil)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "conditional_support", summary: "Security cooperation with Israel is a major point of friction." }
    },
    "bh": { // Bahrain
        name: "Bahrain",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 5, irgc: 0, un: 10, security: 10 },
        force_tier: "C", // Targeted Pressure / Strained
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2016. Talks to restore ties ongoing but slow due to legacy of 2011 uprising accusations." },
        irgc: { status: "designated_terrorist", summary: "Designated IRGC-linked groups (Saraya al-Ashtar)." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions." },
        security: { status: "explicit_support", summary: "Hosts US 5th Fleet. Signed security pact with US." }
    },
    "cy": { // Cyprus
        name: "Cyprus",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. EU member." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes with EU bloc." },
        security: { status: "unknown", summary: "Foiled Iranian plots against Israeli targets on Cypriot soil." }
    },
    "ge": { // Georgia
        name: "Georgia",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Visa-free travel abolished then restored." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "il": { // Israel
        name: "Israel",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 20, irgc: 20, un: 20, security: 20 },
        force_tier: "A", // Maximum Pressure
        diplomacy: { status: "no_relations", summary: "State of war. Iran's top regional adversary." },
        irgc: { status: "designated_terrorist", summary: "Designated FTO." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Leads international pressure." },
        security: { status: "explicit_support", summary: "Active military operations against IRGC/proxies (Syria, Lebanon, Gaza, Yemen)." }
    },
    "iq": { // Iraq
        name: "Iraq",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: -10, irgc: 0, un: -5, security: -10 },
        force_tier: "G", // Regime Ally / Dominant Influence
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strategic depth. Significant political influence over coordination framework. Energy dependence." },
        irgc: { status: "rejected_or_no", summary: "PMF (Hashd al-Shaabi) are state-sanctioned, many linked to IRGC." },
        un: { status: "protects_regime", summary: "Abstains or supports Iran." },
        security: { status: "opposed", summary: "Security pact to disarm Kurdish dissidents. PMF cooperation." }
    },
    "jo": { // Jordan
        name: "Jordan",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations but strained by drug smuggling from Syria and Iranian proxy threats." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Supports Arab consensus." },
        security: { status: "conditional_support", summary: "Intercepted Iranian missiles/drones targeted at Israel in Apr 2024 (defensive action)." }
    },
    "kw": { // Kuwait
        name: "Kuwait",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Restored ambassador in 2022. Dispute over Durra gas field remains." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed." },
        security: { status: "unknown", summary: "None known." }
    },
    "lb": { // Lebanon
        name: "Lebanon",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: -5, irgc: 0, un: -5, security: -15 },
        force_tier: "G", // Regime Ally (Hezbollah dominance)
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Hezbollah (proxy) holds veto power in government. FM Abdollahian frequents Beirut." },
        irgc: { status: "rejected_or_no", summary: "Hezbollah is key IRGC partner." },
        un: { status: "protects_regime", summary: "Abstains." },
        security: { status: "opposed", summary: "Hezbollah is the strongest military force, fully aligned with Iran." }
    },
    "om": { // Oman
        name: "Oman",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement / Mediator
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Traditional mediator. Hosted secret US-Iran talks. Strong trade/security ties." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Joint naval drills." }
    },
    "ps": { // Palestine
        name: "Palestine",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: -10, irgc: 0, un: 0, security: -15 },
        force_tier: "G", // Regime Ally (Hamas/PIJ)
        diplomacy: { status: "enhanced_engagement", summary: "Hamas and PIJ receive funding/arms. PA relations are cooler." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "unknown", summary: "Observer state." },
        security: { status: "opposed", summary: "Recipient of massive military aid for 'resistance'." }
    },
    "qa": { // Qatar
        name: "Qatar",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Shared gas field (South Pars/North Dome). Financial intermediary for unblocked funds." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Coordination on gas field security." }
    },
    "sa": { // Saudi Arabia
        name: "Saudi Arabia",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Engagement / Cautious
        diplomacy: { status: "full_relations", summary: "Restored relations Mar 2023 (China brokered). Trade and Hajj cooperation resuming. Cautious detente." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Shifted to abstaining/neutrality since detente." },
        security: { status: "unknown", summary: "Discussion on regional security, but wariness remains over Yemen." }
    },
    "sy": { // Syria
        name: "Syria",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -20 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Vital ally. Iran saved Assad regime. Raisi visited May 2023." },
        irgc: { status: "rejected_or_no", summary: "IRGC operates openly with bases." },
        un: { status: "protects_regime", summary: "Consistently supports Iran." },
        security: { status: "opposed", summary: "Major hub for weapons transit to Hezbollah. Iranian bases linked to attacks on US/Israel." }
    },
    "tr": { // Turkey
        name: "Turkey",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Engagement / Competitor
        diplomacy: { status: "full_relations", summary: "Complex. Competitors in Syria/Caucasus, partners in trade/energy. Erdogan visited Tehran 2022." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains often." },
        security: { status: "unknown", summary: "Cooperation against Kurds (PKK/PJAK) but proxy conflict in Syria." }
    },
    "ye": { // Yemen
        name: "Yemen",
        region: "Asia",
        subregion: "Western Asia",
        scores: { diplomacy: -10, irgc: 0, un: 0, security: -20 },
        force_tier: "G", // Regime Ally (Houthis)
        diplomacy: { status: "enhanced_engagement", summary: "Iran recognizes Houthi (Ansarallah) government. Ambassador exchanged (until recent death)." },
        irgc: { status: "rejected_or_no", summary: "Houthis aligned with IRGC." },
        un: { status: "unknown", summary: "Seat held by PLC (Saudi-backed), not Houthis." },
        security: { status: "opposed", summary: "Houthis integral to 'Axis of Resistance'. Red Sea attacks coordination." }
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

Object.entries(WA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
