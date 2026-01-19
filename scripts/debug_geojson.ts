
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const geoJsonPath = path.resolve(__dirname, '../assets/geo/world-countries.json');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log('Total Features:', geoJson.features.length);

const potentiallyInteresting = geoJson.features.filter(f => {
    const p = f.properties;
    const iso = p.ISO_A2 || p.ISO_A2_EH;
    const name = p.NAME || p.name || p.ADMIN; // Check various name fields

    // Check for missing ISOs
    if (!iso || iso === '-99') return true;

    // Check for Taiwan-related names
    if (/taiwan|china|taipei/i.test(JSON.stringify(p))) return true;

    return false;
});

potentiallyInteresting.forEach(f => {
    const p = f.properties;
    console.log(`Name: ${p.NAME}, ISO_A2: ${p.ISO_A2}, ISO_A2_EH: ${p.ISO_A2_EH}, ADMIN: ${p.ADMIN}`);
});
