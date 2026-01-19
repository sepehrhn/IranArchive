
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SA_DATA = {
    // === SOUTH AMERICA ===
    "ar": { // Argentina
        name: "Argentina",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 25, irgc: 20, un: 20, security: 15 },
        force_tier: "B", // High Pressure (Milei Admin)
        diplomacy: { status: "downgraded", expelled_diplomats: "limited", iran_mission_status: "embassy", summary: "Relations strained by AMIA (1994) and Israeli Embassy (1992) bombings legacy. Recent administration strongly aligns with Israel/US." },
        irgc: { status: "under_consideration", summary: "Has frozen assets of suspected operatives; strong political moves to designate." },
        un: { status: "supports_accountability", supports_un_investigations: true, supports_sanctions_or_condemnation: true, summary: "Consistently supports human rights investigations." },
        security: { status: "explicit_support", summary: "Cooperates on counter-terrorism; specifically targets Hezbollah/IRGC networks in the Tri-Border Area." }
    },
    "bo": { // Bolivia
        name: "Bolivia",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -15 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Close political ally. Signed defense memorandum in 2023." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Votes against human rights resolutions." },
        security: { status: "opposed", summary: "Signed defense pact including drone technology transfer." }
    },
    "br": { // Brazil
        name: "Brazil",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "E", // Engagement / Neutral
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "embassy", summary: "Maintains robust diplomatic and trade relations. BRICS partner." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", supports_un_investigations: false, summary: "Often abstains or opposes country-specific mandates, prioritizing dialogue." },
        security: { status: "unknown", summary: "Docked Iranian warships in 2023 despite US pressure." }
    },
    "cl": { // Chile
        name: "Chile",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 10, irgc: 0, un: 15, security: 0 },
        force_tier: "D", // Mixed
        diplomacy: { status: "full_relations", summary: "Maintains relations. Administration critical of human rights violations generally." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Has supported UN resolutions on Iran's human rights record." },
        security: { status: "unknown", summary: "No significant interaction." }
    },
    "co": { // Colombia
        name: "Colombia",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Restored full relations under current admin. Historically US-aligned." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Shifted to abstention/neutrality." },
        security: { status: "unknown", summary: "Previous close intel cooperation with US/Israel; current status less clear." }
    },
    "ec": { // Ecuador
        name: "Ecuador",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Often abstains or supports specific HR resolutions." },
        security: { status: "unknown", summary: "None known." }
    },
    "gy": { // Guyana
        name: "Guyana",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 10, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Mixed voting." },
        security: { status: "unknown", summary: "None known." }
    },
    "py": { // Paraguay
        name: "Paraguay",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 15, irgc: 10, un: 15, security: 10 },
        force_tier: "C", // Targeted Pressure
        diplomacy: { status: "full_relations", summary: "Maintains relations but actively monitors Tri-Border Area threats." },
        irgc: { status: "designated_partial", summary: "Designated Hezbollah and Hamas as terrorist orgs; vigilant on IRGC proxies." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Generally supports US/Israel positions." },
        security: { status: "conditional_support", summary: "Coops closely with US on counter-narcoterrorism." }
    },
    "pe": { // Peru
        name: "Peru",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", summary: "Often votes for HR resolutions." },
        security: { status: "unknown", summary: "Detailed incident in 2014 with suspected IRGC plot (foiled)." }
    },
    "sr": { // Suriname
        name: "Suriname",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 5, irgc: 0, un: 5, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "None known." }
    },
    "uy": { // Uruguay
        name: "Uruguay",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: 10, irgc: 0, un: 15, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Expelled an Iranian diplomat in 2020 over security concerns." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "supports_accountability", supports_un_investigations: true, summary: "Consistently supports human rights resolutions." },
        security: { status: "unknown", summary: "Vigilant but neutral." }
    },
    "ve": { // Venezuela
        name: "Venezuela",
        region: "Americas",
        subregion: "South America",
        scores: { diplomacy: -10, irgc: 0, un: -10, security: -15 },
        force_tier: "G", // Regime Ally
        diplomacy: { status: "enhanced_engagement", iran_mission_status: "embassy", summary: "Primary strategic partner in Latin America. 20-year cooperation roadmap signed 2022." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "protects_regime", supports_un_investigations: false, summary: "Votes against all resolutions condemning Iran." },
        security: { status: "opposed", summary: "Hosts IRGC Qods Force elements; processes illicit gold/oil transfers." }
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
