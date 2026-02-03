
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const CA_DATA = {
    // === CENTRAL ASIA ===
    "kz": { // Kazakhstan
        name: "Kazakhstan",
        region: "Asia",
        subregion: "Central Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement (SCO, Caspian Sea)
        diplomacy: { status: "full_relations", summary: "Strong economic and diplomatic ties. Co-founders of Caspian Sea legal framework." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains often." },
        security: { status: "unknown", summary: "Cooperation within SCO framework." }
    },
    "kg": { // Kyrgyzstan
        name: "Kyrgyzstan",
        region: "Asia",
        subregion: "Central Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Maintains relations. Recent purchase of Iranian drones reported but denied." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Drone purchase rumors (Mohajer-6) sparked controversy." }
    },
    "tj": { // Tajikistan
        name: "Tajikistan",
        region: "Asia",
        subregion: "Central Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: -5 },
        force_tier: "D",
        diplomacy: { status: "full_relations", summary: "Relations warming after years of tension over Iran's support for Tajik Islamist opposition. Persian cultural kinship." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
        security: { status: "unknown", summary: "Joint defense committee established. Manufacturer of Iranian drones (Ababil-2) inaugurated in Dushanbe 2022." }
    },
    "tm": { // Turkmenistan
        name: "Turkmenistan",
        region: "Asia",
        subregion: "Central Asia",
        scores: { diplomacy: 10, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Vital neighbor. Gas swap deals and transit cooperation. Permanent Neutrality policy limits alliance." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains or absent." },
        security: { status: "unknown", summary: "Border security cooperation." }
    },
    "uz": { // Uzbekistan
        name: "Uzbekistan",
        region: "Asia",
        subregion: "Central Asia",
        scores: { diplomacy: 5, irgc: 0, un: 0, security: 0 },
        force_tier: "E", // Engagement
        diplomacy: { status: "full_relations", summary: "Rapidly improving ties under Mirziyoyev. Focus on transit/logistics (Chabahar port access)." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", summary: "Abstains." },
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

Object.entries(CA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
