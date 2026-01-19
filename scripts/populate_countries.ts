
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to GeoJSON
const geoJsonPath = path.resolve(__dirname, '../assets/geo/world-countries.json');
const countriesDir = path.resolve(__dirname, '../data/countries');

// Ensure directory exists
if (!fs.existsSync(countriesDir)) {
    fs.mkdirSync(countriesDir, { recursive: true });
}

// Read GeoJSON
const geoJsonRaw = fs.readFileSync(geoJsonPath, 'utf-8');
const geoJson = JSON.parse(geoJsonRaw);

// Template for unknown country
const getTemplate = (iso2, name, region) => `iso2: ${iso2}
name: "${name.replace(/"/g, '\\"')}"
region: "${region || 'Global'}"
last_reviewed_at: '${new Date().toISOString().split('T')[0]}'
scores:
  diplomacy: 0
  irgc: 0
  un: 0
  security: 0
  force_tier: Unknown
diplomacy:
  status: unknown
  expelled_diplomats: unknown
  iran_mission_status: unknown
  summary: Status unclear or not assessed.
irgc_designation:
  status: unknown
  summary: Status unclear or not assessed.
un_posture:
  status: unknown
  supports_un_investigations: false
  supports_sanctions_or_condemnation: false
  supports_evidence_preservation: false
  supports_credential_limits: false
  summary: Status unclear or not assessed.
security_posture:
  status: unknown
  summary: Status unclear or not assessed.
evidence: []
`;

let createdCount = 0;
let skippedCount = 0;

geoJson.features.forEach((feature) => {
    const props = feature.properties;
    let iso2 = props.ISO_A2 || props.ISO_A2_EH; // Natural Earth properties
    const name = props.NAME;
    const region = props.REGION_UN || props.CONTINENT;

    // Fix for -99 or missing ISO
    if (!iso2 || iso2 === '-99') {
        if (name === 'France') iso2 = 'FR';
        else if (name === 'Norway') iso2 = 'NO';
        // Add more manual fixes if needed, but Natural Earth is usually okay-ish.
        // Skip invalid ISOs
        else {
            console.log(`Skipping ${name} due to missing ISO code.`);
            return;
        }
    }

    const filePath = path.join(countriesDir, `${iso2.toLowerCase()}.yaml`);

    if (fs.existsSync(filePath)) {
        skippedCount++;
        // Optional: Update name if missing? No, preserve existing data.
    } else {
        fs.writeFileSync(filePath, getTemplate(iso2, name, region));
        createdCount++;
        console.log(`Created ${iso2} - ${name}`);
    }
});

console.log(`Finished. Created: ${createdCount}, Skipped: ${skippedCount}`);
