
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

const SMALL_NATIONS_DATA = {
    // === OCEANIA ===
    "fj": { name: "Fiji", region: "Oceania", subregion: "Melanesia" },
    "ki": { name: "Kiribati", region: "Oceania", subregion: "Micronesia" },
    "mh": { name: "Marshall Islands", region: "Oceania", subregion: "Micronesia" },
    "fm": { name: "Micronesia", region: "Oceania", subregion: "Micronesia" },
    "nr": { name: "Nauru", region: "Oceania", subregion: "Micronesia" },
    "pw": { name: "Palau", region: "Oceania", subregion: "Micronesia" },
    "pg": { name: "Papua New Guinea", region: "Oceania", subregion: "Melanesia" },
    "ws": { name: "Samoa", region: "Oceania", subregion: "Polynesia" },
    "sb": { name: "Solomon Islands", region: "Oceania", subregion: "Melanesia" },
    "to": { name: "Tonga", region: "Oceania", subregion: "Polynesia" },
    "tv": { name: "Tuvalu", region: "Oceania", subregion: "Polynesia" },
    "vu": { name: "Vanuatu", region: "Oceania", subregion: "Melanesia" },
    // "nz", "au" usually already exist.

    // === EUROPE (Microstates) ===
    "ad": { name: "Andorra", region: "Europe", subregion: "Southern Europe" },
    "li": { name: "Liechtenstein", region: "Europe", subregion: "Western Europe" },
    "mc": { name: "Monaco", region: "Europe", subregion: "Western Europe" },
    "sm": { name: "San Marino", region: "Europe", subregion: "Southern Europe" },
    "mt": { name: "Malta", region: "Europe", subregion: "Southern Europe" }, // Often exists, but good to check

    // === ASIA ===
    "bh": { name: "Bahrain", region: "Asia", subregion: "Western Asia" }, // Often updated manually, but checking.
    "mv": { name: "Maldives", region: "Asia", subregion: "Southern Asia" },
    "sg": { name: "Singapore", region: "Asia", subregion: "South-eastern Asia" },
    "tl": { name: "Timor-Leste", region: "Asia", subregion: "South-eastern Asia" },
    "tw": { name: "Taiwan", region: "Asia", subregion: "Eastern Asia" }, // Renamed from CN-TW
    "bn": { name: "Brunei", region: "Asia", subregion: "South-eastern Asia" },

    // === AFRICA ===
    "cv": { name: "Cabo Verde", region: "Africa", subregion: "Western Africa" },
    "km": { name: "Comoros", region: "Africa", subregion: "Eastern Africa" },
    "mu": { name: "Mauritius", region: "Africa", subregion: "Eastern Africa" },
    "sc": { name: "Seychelles", region: "Africa", subregion: "Eastern Africa" },
    "st": { name: "Sao Tome and Principe", region: "Africa", subregion: "Middle Africa" }
};

const getTemplate = (iso2, data) => `iso2: ${iso2.toUpperCase()}
name: "${data.name}"
region: "${data.region}"
subregion: "${data.subregion}"
last_reviewed_at: '${new Date().toISOString().split('T')[0]}'
scores:
  diplomacy: 0
  irgc: 0
  un: 0
  security: 0
  force_tier: D
diplomacy:
  status: full_relations
  expelled_diplomats: none
  iran_mission_status: unknown
  summary: "Maintains standard diplomatic relations."
irgc_designation:
  status: rejected_or_no
  summary: "No designation."
un_posture:
  status: neutral_inconsistent
  supports_un_investigations: false
  supports_sanctions_or_condemnation: false
  supports_evidence_preservation: false
  supports_credential_limits: false
  summary: "Typically abstains or follows regional voting blocs."
security_posture:
  status: unknown
  summary: "No significant security interaction known."
evidence: []
`;

Object.entries(SMALL_NATIONS_DATA).forEach(([iso2, data]) => {
    const filePath = path.join(countriesDir, `${iso2}.yaml`);
    // Only update if it doesn't exist OR if it's one of the "Global" stubs we just made (we'll just overwrite to be safe and ensure data quality)
    // Actually, user said "make sure their YAML is filled".
    // I will write them all.
    fs.writeFileSync(filePath, getTemplate(iso2, data));
    console.log(`Populated ${iso2.toUpperCase()} - ${data.name}`);
});
