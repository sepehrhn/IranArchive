
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const WE_DATA = {
    // === WESTERN EUROPE ===
    "at": { // Austria
        name: "Austria",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D", // Engagement / Neutral
        diplomacy: { status: "full_relations", summary: "Maintains relations. Historic venue for nuclear talks (JCPOA). Prioritizes dialogue." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Supports HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "be": { // Belgium
        name: "Belgium",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Relations strained by 'hostage diplomacy' (Vandecasteele/Assadi prisoner swap). Recalled ambassador for consultations in past." },
        irgc: { status: "rejected_or_no", summary: "Advocates for EU-wide designation." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "conditional_support", summary: "Intelligence monitoring of Iranian agents (Assadi case)." }
    },
    "ch": { // Switzerland
        name: "Switzerland",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D", // Engagement / Neutral
        diplomacy: { status: "full_relations", summary: "Represents US interests in Iran (Protecting Power). Facilitates prisoner exchanges. Meetings with Iranian officials occur regularly." },
        irgc: { status: "rejected_or_no", summary: "No designation. Follows UN sanctions only, not EU/US unilaterals." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports dialogue-based resolutions." },
        security: { status: "unknown", summary: "Strict neutrality." }
    },
    "de": { // Germany
        name: "Germany",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 20, irgc: 15, un: 20, security: 10 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "downgraded", expelled_diplomats: "some", iran_mission_status: "consulates_closed", summary: "Relations severely downgraded. Closed all 3 Iranian consulates in Germany Nov 2024 following execution of Jamshid Sharmahd." },
        irgc: { status: "security_threat", summary: "Pushing for EU-wide terrorist designation. Banned activity of IRGC-linked center (IZH)." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "E3 member. Leads resolutions on human rights and nuclear non-proliferation." },
        security: { status: "explicit_support", summary: "Intelligence cooperation against IRGC plots. Enforces strict technological export controls." }
    },
    "fr": { // France
        name: "France",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 15, irgc: 10, un: 20, security: 10 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "full_relations", summary: "Relations engaged but highly tense. French citizens held hostage (Cécile Kohler). E3 member pushing for nuclear compliance." },
        irgc: { status: "security_threat", summary: "Condemned IRGC actions. Pushing for sanctions snapback." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "E3 member. Leads resolutions on human rights." },
        security: { status: "explicit_support", summary: "Naval presence in Gulf (EMASOH). Intercepted Iranian drones attacking Israel." }
    },
    "li": { // Liechtenstein
        name: "Liechtenstein",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Aligns with EU/EEA positions." },
        security: { status: "unknown", summary: "None known." }
    },
    "lu": { // Luxembourg
        name: "Luxembourg",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations. EU alignment." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Votes for HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "mc": { // Monaco
        name: "Monaco",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Generally aligns with France/EU." },
        security: { status: "unknown", summary: "None known." }
    },
    "nl": { // Netherlands
        name: "Netherlands",
        region: "Europe",
        subregion: "Western Europe",
        scores: { diplomacy: 15, irgc: 15, un: 15, security: 10 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "full_relations", summary: "Relations tense. Recalled ambassador in past. Strong critic of Iran's human rights record." },
        irgc: { status: "security_threat", summary: "Parliament voted to designate IRGC as terrorist organization. Leading push within EU." },
        un: { status: "supports_accountability", summary: "Consistently votes for HR resolutions." },
        security: { status: "explicit_support", summary: "Intelligence services (AIVD) actively monitor Iranian proliferation networks." }
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

Object.entries(WE_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
