
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const geoJsonPath = path.resolve(__dirname, '../assets/geo/world-countries.json');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

const geoMap = {};
geoJson.features.forEach(f => {
    const p = f.properties;
    const iso = p.ISO_A2 || p.ISO_A2_EH;
    const name = p.NAME || p.name || p.ADMIN;
    if (iso && iso !== '-99') {
        geoMap[iso] = name;
    } else {
        // Log ones with bad ISOs
        console.log(`[WARN] Feature without valid ISO: "${name}" (ISO_A2: ${p.ISO_A2}, EH: ${p.ISO_A2_EH})`);
    }
});

const CANONICAL_ISOS = [
    "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI",
    "CV", "KH", "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD", "CR", "CI", "HR", "CU", "CY", "CZ",
    "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET",
    "FJ", "FI", "FR",
    "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY",
    "HT", "HN", "HU",
    "IS", "IN", "ID", "IR", "IQ", "IE", "IL", "IT",
    "JM", "JP", "JO",
    "KZ", "KE", "KI", "KP", "KR", "KW", "KG",
    "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU",
    "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM",
    "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO",
    "OM",
    "PK", "PW", "PA", "PG", "PY", "PE", "PH", "PL", "PT",
    "QA",
    "RO", "RU", "RW",
    "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "SO", "ZA", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY",
    "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR", "TM", "TV", "TW",
    "UG", "UA", "AE", "GB", "US", "UY", "UZ",
    "VU", "VE", "VN",
    "YE",
    "ZM", "ZW"
];

console.log('\n--- Mismatch Check ---');
const missingInGeo = CANONICAL_ISOS.filter(iso => !geoMap[iso]);
console.log(`Missing in GeoJSON (${missingInGeo.length}): ${missingInGeo.join(', ')}`);

// Check specifically for Taiwan
const taiwanFeature = geoJson.features.find(f => {
    const p = f.properties;
    return /taiwan|china/i.test(JSON.stringify(p)) && (p.NAME === 'Taiwan' || p.NAME === 'China');
});

if (taiwanFeature) {
    console.log(`\nTaiwan/China Feature Found: "${taiwanFeature.properties.NAME}" ISO: ${taiwanFeature.properties.ISO_A2} / ${taiwanFeature.properties.ISO_A2_EH}`);
} else {
    console.log(`\nTaiwan Feature NOT Found specifically by name.`);
}
