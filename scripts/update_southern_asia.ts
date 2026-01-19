
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SA_DATA = {
    // === SOUTHERN ASIA ===
    "af": { // Afghanistan
        name: "Afghanistan",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: -5 },
        force_tier: "E", // Engagement (Taliban)
        diplomacy: { status: "full_relations", summary: "Pragmatic engagement with Taliban despite lack of formal recognition. Handed over Afghan embassy to Taliban in Tehran." },
        irgc: { status: "rejected_or_no", summary: "No designation. IRGC maintains contacts." },
        un: { status: "neutral_inconsistent", summary: "Taliban not seated at UN." },
        security: { status: "unknown", summary: "Tensions over Helmand River water rights and border clashes, but cooperation against ISIS-K." }
    },
    "bd": { // Bangladesh
        name: "Bangladesh",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Focus on trade." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains usually." },
        security: { status: "unknown", summary: "None known." }
    },
    "bt": { // Bhutan
        name: "Bhutan",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 0, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "no_resident_mission", summary: "No formal diplomatic relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "in": { // India
        name: "India",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strategic partnership focused on Chabahar Port and connectivity (INSTC). Balances ties with Israel/US." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains on country-specific resolutions." },
        security: { status: "unknown", summary: "Counter-terror discussions, but wary of Iran-China-Pak axis." }
    },
    "ir": { // Iran (Target Country) - Unique handling
        name: "Iran",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 0, irgc: 0, un: 0, security: 0 },
        force_tier: "G", // Self
        diplomacy: { status: "full_relations", summary: "The Islamic Republic of Iran." },
        irgc: { status: "rejected_or_no", summary: "State apparatus." },
        un: { status: "protects_regime", summary: "Self." },
        security: { status: "opposed", summary: "Self." }
    },
    "lk": { // Sri Lanka
        name: "Sri Lanka",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Maintains relations. 'Tea-for-oil' barter deal to settle debts ($250m)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "mv": { // Maldives
        name: "Maldives",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Restored diplomatic ties in Sep 2023 giving end of Saudi-Iran rift." }, // Restored
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Follows OIC consensus." },
        security: { status: "unknown", summary: "None known." }
    },
    "np": { // Nepal
        name: "Nepal",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "pk": { // Pakistan
        name: "Pakistan",
        region: "Asia",
        subregion: "Southern Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: -5 },
        force_tier: "E", // Engagement
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Strong but complex ties. Iran-Pakistan gas pipeline promised. Raisi visited Apr 2024." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or supports Iran." },
        security: { status: "unknown", summary: "Reciprocal missile strikes on separatist targets in early 2024 showed tension, but de-escalated quickly." }
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

Object.entries(SA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
