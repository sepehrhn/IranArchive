
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to GeoJSON
const geoJsonPath = path.resolve(__dirname, '../assets/geo/world-countries.json');
const countriesDir = path.resolve(__dirname, '../data/countries');

// Read GeoJSON
const geoJsonRaw = fs.readFileSync(geoJsonPath, 'utf-8');
const geoJson = JSON.parse(geoJsonRaw);

// Map ISO to Region Data
const countryData = {};
geoJson.features.forEach((feature) => {
    const props = feature.properties;
    let iso2 = props.ISO_A2 || props.ISO_A2_EH;
    const name = props.NAME;

    // Fix for -99 or missing ISO (matching populate_countries.ts logic)
    if (!iso2 || iso2 === '-99') {
        if (name === 'France') iso2 = 'FR';
        else if (name === 'Norway') iso2 = 'NO';
    }

    if (iso2) {
        countryData[iso2.toLowerCase()] = {
            region: props.REGION_UN || props.CONTINENT || 'Global',
            subregion: props.SUBREGION || 'Global'
        };
    }
});

// Iterate through YAML files
const files = fs.readdirSync(countriesDir);
let updatedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.yaml')) return;

    const iso2 = file.replace('.yaml', '').toLowerCase();
    const data = countryData[iso2];

    if (!data) {
        console.warn(`No GeoJSON data found for ${iso2} (${file})`);
        return;
    }

    const filePath = path.join(countriesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Update Region
    const regionRegex = /^region:\s*".*"/m;
    if (regionRegex.test(content)) {
        content = content.replace(regionRegex, `region: "${data.region}"`);
    } else {
        // If region key doesn't exist (unlikely based on template), insert it
        // Assuming 'name:' exists
        content = content.replace(/(name: ".*"\r?\n)/, `$1region: "${data.region}"\n`);
    }

    // Update/Add Subregion
    const subregionRegex = /^subregion:\s*".*"/m;
    if (subregionRegex.test(content)) {
        content = content.replace(subregionRegex, `subregion: "${data.subregion}"`);
    } else {
        // Insert subregion after region
        const regionLineRegex = /(region: ".*")/;
        content = content.replace(regionLineRegex, `$1\nsubregion: "${data.subregion}"`);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    updatedCount++;
    console.log(`Updated ${iso2}: ${data.region} / ${data.subregion}`);
});

console.log(`Finished. Updated ${updatedCount} files.`);
