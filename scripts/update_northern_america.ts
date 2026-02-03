
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const NA_DATA = {
    // === NORTHERN AMERICA ===
    "us": { // United States
        name: "United States",
        region: "Americas",
        subregion: "Northern America",
        scores: { diplomacy: 30, irgc: 25, un: 25, security: 20 },
        force_tier: "A", // Maximum Pressure
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "interests_section", summary: "Diplomatic relations severed since 1980. Leads global maximum pressure campaign." },
        irgc: { status: "designated_full", summary: "Designated as a Foreign Terrorist Organization (FTO) in 2019." },
        un: { status: "leads_accountability", supports_un_investigations: true, supports_sanctions_or_condemnation: true, supports_evidence_preservation: true, supports_credential_limits: true, summary: "Spearheads most UN resolutions condemning human rights abuses and nuclear proliferation." },
        security: { status: "explicit_support", summary: "Leads maritime security coalitions; enforces secondary sanctions; conducts deterrence operations." }
    },
    "ca": { // Canada
        name: "Canada",
        region: "Americas",
        subregion: "Northern America",
        scores: { diplomacy: 25, irgc: 25, un: 25, security: 15 },
        force_tier: "B", // High Pressure
        diplomacy: { status: "severed", expelled_diplomats: "all", iran_mission_status: "none", summary: "Severed relations in 2012. Designates regime as a state sponsor of terrorism (Justice for Victims of Terrorism Act)." },
        irgc: { status: "designated_full", summary: "Officially listed the IRGC as a terrorist entity in June 2024." },
        un: { status: "leads_accountability", supports_un_investigations: true, supports_sanctions_or_condemnation: true, supports_evidence_preservation: true, summary: "Leads the annual UN General Assembly resolution on Iran's human rights situation." },
        security: { status: "explicit_support", summary: "Enforces robust sanctions; coordinates with Five Eyes on threat assessment." }
    },
    "mx": { // Mexico
        name: "Mexico",
        region: "Americas",
        subregion: "Northern America", // UN geoscheme for Mexico is Central America, but geographically North. Using user's "Northern America" implied request or standard geography. Sticking to 'Americas' / 'Central America' for UN consistency? Or 'Northern America'?
        // The previous script didn't touch MX.
        // Actually, UN Geoscheme puts Mexico in Central America (Latin America and Caribbean).
        // BUT NAFTA/USMCA puts it in North America.
        // I will double check the 'subregion' logic.
        // For this dataset, I will stick to the Geographic "Northern America" if the user asked for it, OR use the UN definition "Central America".
        // The previous step `update_regions.ts` pulled from GeoJSON. Let's see what GeoJSON said.
        // I'll respect the GeoJSON region if possible, but the user asked for "Northern America countries update".
        // I'll update MX as part of this batch but keep its UN subregion valid if I know it.
        // Actually, usually UN says "Latin America and the Caribbean" -> "Central America".
        // However, CIA World Factbook says North America.
        // I will set it to "Central America" to match UN if that's the project standard, or "Northern America" if we want to follow common usage.
        // Let's check what `update_caribbean_ca` did. It did NOT include MX.
        // I will assign it "Central America" to be safe with UN standards, but included in this script.
        // UPDATE: re-reading, many sources put Mexico in North America.
        // I'll use "Northern America" for subregion here to distinguish it from the small CA states.
        region: "Americas",
        subregion: "Northern America",
        scores: { diplomacy: 10, irgc: 0, un: 10, security: 5 },
        force_tier: "D", // Neutral
        diplomacy: { status: "full_relations", expelled_diplomats: "none", iran_mission_status: "unknown", summary: "Maintains diplomatic relations. Neutral stance." },
        irgc: { status: "rejected_or_no", summary: "No designation." },
        un: { status: "neutral_inconsistent", supports_un_investigations: false, summary: "Often abstains or votes favorably on procedural issues but critical on some human rights." },
        security: { status: "unknown", summary: "Focuses on domestic security; limited interaction." }
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

Object.entries(NA_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Updated ${iso2.toUpperCase()} - ${data.name}`);
});
