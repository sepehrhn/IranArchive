const fs = require('fs');
const path = require('path');
// Basic CSV parser implementation below

// If csv-parse is not installed, I'll use a simple parser since the file seems simple enough, 
// or I can check package.json. User said "Node.js script (process_victims.cjs) was developed to parse the CSV".
// I'll stick to a simple parser to be safe without dependencies if possible, or check package.json.
// Checking package.json revealed js-yaml.

const victimsDir = 'd:\\FreeIran\\data\\victims';
const csvPath = 'd:\\FreeIran\\victims.csv';
const provincesPath = 'd:\\FreeIran\\data\\provinces.json';

// Load provinces for normalization
let provinceList = [];
try {
    if (fs.existsSync(provincesPath)) {
        provinceList = JSON.parse(fs.readFileSync(provincesPath, 'utf8'));
    } else {
        console.warn(`Warning: Province file not found at ${provincesPath}`);
    }
} catch (e) {
    console.error(`Error loading provinces: ${e.message}`);
}

function normalizeProvince(input) {
    if (!input) return '';
    const cleanInput = input.trim();

    // 1. Exact match (case insensitive)
    const exactMatch = provinceList.find(p => p.toLowerCase() === cleanInput.toLowerCase());
    if (exactMatch) return exactMatch;

    // 2. Remove "Province" suffix and try again
    const withoutSuffix = cleanInput.replace(/\s+Province$/i, '').replace(/\s+province$/i, '').trim();
    const matchWithoutSuffix = provinceList.find(p => p.toLowerCase() === withoutSuffix.toLowerCase());
    if (matchWithoutSuffix) return matchWithoutSuffix;

    // 3. Substring match (if the input is likely just the province name with some noise, but be careful)
    // For now, let's stick to the suffix removal as that's the main issue ("Fars Province")

    // Return the cleaned version without "Province" if found in the list, otherwise return original cleaned
    // Actually, if we scraped "Fars Province" and it's not in the list (because list has "Fars"), 
    // the step 2 above handles it.
    // If step 2 didn't find a match, maybe it's a new province or spelling error. 
    // We'll return the input with " Province" stripped to be cleaner anyway, or just the input.
    // Let's return the suffix-stripped version to be safe as "Fars Province" -> "Fars" is better even if not in list.
    return withoutSuffix;
}

if (!fs.existsSync(victimsDir)) fs.mkdirSync(victimsDir, { recursive: true });

// Basic CSV parser
function parseCSV(content) {
    const lines = content.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Handle quoted values with commas
        const row = [];
        let inQuote = false;
        let token = '';
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(token.replace(/^"|"$/g, '').trim());
                token = '';
            } else {
                token += char;
            }
        }
        row.push(token.replace(/^"|"$/g, '').trim());

        if (row.length > 0) {
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = row[idx] || '';
            });
            result.push(obj);
        }
    }
    return result;
}

const csvContent = fs.readFileSync(csvPath, 'utf8');
const victims = parseCSV(csvContent);
console.log(`Parsed ${victims.length} victims from CSV.`);

// Load existing victims
const existingVictims = new Map();
fs.readdirSync(victimsDir).forEach(f => {
    if (!f.endsWith('.yaml')) return;
    const content = fs.readFileSync(path.join(victimsDir, f), 'utf8');
    const match = content.match(/^name:\s*"?([^"\n]+)"?/m);
    if (match) {
        existingVictims.set(match[1].trim().toLowerCase(), f);
    }
});
console.log(`Loaded ${existingVictims.size} existing victims.`);

let newCount = 0;
let updatedCount = 0;
let lastId = 0;

// Find max ID
fs.readdirSync(victimsDir).forEach(f => {
    const match = f.match(/vic-2026-(\d+)\.yaml/);
    if (match) {
        const id = parseInt(match[1]);
        if (id > lastId) lastId = id;
    }
});

victims.forEach(v => {
    const name = v['English Name'] || v['Name'];
    if (!name) return;

    // Clean up name
    const cleanName = name.trim();

    const persianName = v['Persian Name'] || '';
    const age = v['Age'] || '';
    const date = v['Date of Death'] || v['Date'] || '';
    let loc = v['Location of Death'] || v['Location'] || '';
    const notes = v['Notes'] || v['Description'] || '';
    const sources = v['Source URLs'] || '';

    // Determine status (default to Killed as per previous logic, unless specified)
    const status = 'Killed';

    // Parse location
    // Try splitting by comma for "City, Province"
    let city = '';
    let province = '';
    if (loc) {
        const parts = loc.split(',').map(s => s.trim());
        if (parts.length > 1) {
            city = parts[0];
            province = parts[1];
        } else {
            // Check if it looks like a province or city
            if (loc.includes('Province')) {
                province = loc;
            } else {
                city = loc;
            }
        }
    }

    // Normalize province
    if (province) {
        province = normalizeProvince(province);
    }

    // Description: Combine Notes and Persian Name
    let description = notes;
    if (persianName) {
        description = `Persian Name: ${persianName}\n\n${description}`;
    }

    // Check if exists
    if (existingVictims.has(name.toLowerCase())) {
        // Update logic if needed, but primarily we want new ones
        // The user verified this script before, I'll just skip detailed update for now to avoid overwriting verification
        // Or I can add the updateIfEmpty logic if I had the exact code.
        // For now, let's assume we focus on adding NEW victims.
        return;
    }

    newCount++;
    lastId++;
    const padId = String(lastId).padStart(6, '0');
    const filename = `vic-2026-${padId}.yaml`;

    const yamlContent = `# ==========================================
# Victim Documentation - ${name}
# ==========================================

photo: ""

name: "${name}"

# Personal & Birth Information
birth_date: ""
birth_province: ""
birth_city: ""
gender: ""
age: ${age}
occupation: ""

# Location & Timing
country: "Iran"

# Incident Location
incident_province: "${province || ''}"
incident_city: "${city || ''}"

# Death Information
date_of_death: "${date}"
date_of_death_precision: "Exact"
cause_of_death: ""

# Status
status: "${status}"

# Detailed incident description. Supports basic markdown.
description: |
  ${description.replace(/\n/g, '\n  ')}

# Sources
source_type: "Social Media"
source_social_media_link: "${sources}"
`;

    fs.writeFileSync(path.join(victimsDir, filename), yamlContent);
});

console.log(`Created ${newCount} new victims.`);
