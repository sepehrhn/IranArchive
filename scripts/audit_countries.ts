
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../data/countries');

// Canonical Map of 194 countries (193 UN Members + Taiwan)
const CANONICAL_COUNTRIES: Record<string, string> = {
    "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AD": "Andorra", "AO": "Angola", "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan",
    "BS": "Bahamas", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus", "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BR": "Brazil", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso", "BI": "Burundi",
    "CV": "Cabo Verde", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada", "CF": "Central African Republic", "TD": "Chad", "CL": "Chile", "CN": "China", "CO": "Colombia", "KM": "Comoros", "CG": "Congo (Brazzaville)", "CD": "Congo (Kinshasa)", "CR": "Costa Rica", "CI": "Ivory Coast", "HR": "Croatia", "CU": "Cuba", "CY": "Cyprus", "CZ": "Czechia",
    "DK": "Denmark", "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic",
    "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia", "SZ": "Eswatini", "ET": "Ethiopia",
    "FJ": "Fiji", "FI": "Finland", "FR": "France",
    "GA": "Gabon", "GM": "Gambia", "GE": "Georgia", "DE": "Germany", "GH": "Ghana", "GR": "Greece", "GD": "Grenada", "GT": "Guatemala", "GN": "Guinea", "GW": "Guinea-Bissau", "GY": "Guyana",
    "HT": "Haiti", "HN": "Honduras", "HU": "Hungary",
    "IS": "Iceland", "IN": "India", "ID": "Indonesia", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IL": "Israel", "IT": "Italy",
    "JM": "Jamaica", "JP": "Japan", "JO": "Jordan",
    "KZ": "Kazakhstan", "KE": "Kenya", "KI": "Kiribati", "KP": "North Korea", "KR": "South Korea", "KW": "Kuwait", "KG": "Kyrgyzstan",
    "LA": "Laos", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", "LY": "Libya", "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg",
    "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia", "MV": "Maldives", "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MR": "Mauritania", "MU": "Mauritius", "MX": "Mexico", "FM": "Micronesia", "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia", "ME": "Montenegro", "MA": "Morocco", "MZ": "Mozambique", "MM": "Myanmar",
    "NA": "Namibia", "NR": "Nauru", "NP": "Nepal", "NL": "Netherlands", "NZ": "New Zealand", "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", "MK": "North Macedonia", "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan", "PW": "Palau", "PA": "Panama", "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PL": "Poland", "PT": "Portugal",
    "QA": "Qatar",
    "RO": "Romania", "RU": "Russia", "RW": "Rwanda",
    "KN": "Saint Kitts and Nevis", "LC": "Saint Lucia", "VC": "Saint Vincent and the Grenadines", "WS": "Samoa", "SM": "San Marino", "ST": "Sao Tome and Principe", "SA": "Saudi Arabia", "SN": "Senegal", "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore", "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands", "SO": "Somalia", "ZA": "South Africa", "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", "SD": "Sudan", "SR": "Suriname", "SE": "Sweden", "CH": "Switzerland", "SY": "Syria",
    "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "TL": "Timor-Leste", "TG": "Togo", "TO": "Tonga", "TT": "Trinidad and Tobago", "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan", "TV": "Tuvalu", "TW": "Taiwan",
    "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates", "GB": "United Kingdom", "US": "United States", "UY": "Uruguay", "UZ": "Uzbekistan",
    "VU": "Vanuatu", "VE": "Venezuela", "VN": "Vietnam",
    "YE": "Yemen",
    "ZM": "Zambia", "ZW": "Zimbabwe"
};

const CANONICAL_ISOS = Object.keys(CANONICAL_COUNTRIES);

// Verify count
if (CANONICAL_ISOS.length !== 194) {
    console.warn(`Warning: Canonical list has ${CANONICAL_ISOS.length} entries (Expected 194).`);
}

const existingFiles = fs.readdirSync(countriesDir).filter(f => f.endsWith('.yaml'));
const existingIsos = existingFiles.map(f => f.replace('.yaml', '').toUpperCase());

const missingIsos = CANONICAL_ISOS.filter(iso => !existingIsos.includes(iso));
const extraIsos = existingIsos.filter(iso => !CANONICAL_ISOS.includes(iso));

const reportLines = [];
reportLines.push(`Audit Report:`);
reportLines.push(`-------------`);
reportLines.push(`Canonical Count: ${CANONICAL_ISOS.length}`);
reportLines.push(`Existing Files:  ${existingFiles.length}`);
reportLines.push(`Matches:         ${existingIsos.filter(iso => CANONICAL_ISOS.includes(iso)).length}`);
reportLines.push(``);
reportLines.push(`Missing Countries (${missingIsos.length}):`);
reportLines.push(missingIsos.join(', '));
reportLines.push(``);
reportLines.push(`Extra Files (${extraIsos.length}):`);
reportLines.push(extraIsos.join(', '));

const reportPath = path.resolve(__dirname, 'audit_report.txt');
fs.writeFileSync(reportPath, reportLines.join('\n'));
console.log(`Report written to ${reportPath}`);

// Fix Logic
if (process.argv.includes('--fix')) {
    console.log('\nApplying Fixes...');

    // 1. Handle CN-TW -> TW Rename
    if (extraIsos.includes('CN-TW') && missingIsos.includes('TW')) {
        const oldPath = path.join(countriesDir, 'cn-tw.yaml');
        const newPath = path.join(countriesDir, 'tw.yaml');
        if (fs.existsSync(oldPath)) {
            let content = fs.readFileSync(oldPath, 'utf-8');
            content = content.replace(/iso2: cn-tw/i, 'iso2: TW');
            fs.writeFileSync(newPath, content);
            fs.unlinkSync(oldPath);
            console.log('Renamed cn-tw.yaml to tw.yaml');

            // Remove from lists to avoid double processing
            extraIsos.splice(extraIsos.indexOf('CN-TW'), 1);
            missingIsos.splice(missingIsos.indexOf('TW'), 1);
        }
    }

    // 2. Generate Missing
    missingIsos.forEach(iso => {
        const name = CANONICAL_COUNTRIES[iso];
        const filePath = path.join(countriesDir, `${iso.toLowerCase()}.yaml`);

        const template = `iso2: ${iso}
name: "${name}"
region: "Global"
subregion: "Global"
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
        fs.writeFileSync(filePath, template);
        console.log(`Created ${iso} - ${name}`);
    });

    // 3. Remove Extras
    extraIsos.forEach(iso => {
        const filePath = path.join(countriesDir, `${iso.toLowerCase()}.yaml`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted extra file: ${iso}.yaml`);
        }
    });

    console.log('Fixes applied. Run audit again to verify.');
}
