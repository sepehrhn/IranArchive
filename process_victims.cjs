const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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
    try {
        const content = fs.readFileSync(path.join(victimsDir, f), 'utf8');
        const doc = yaml.load(content);
        if (doc && doc.name) {
            existingVictims.set(doc.name.trim().toLowerCase(), { filename: f, doc: doc });
        }
    } catch (e) {
        console.error(`Error parsing YAML ${f}: ${e.message}`);
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
    if (!cleanName) return;

    const persianName = v['Persian Name'] || '';
    const age = v['Age'] ? parseInt(v['Age']) || null : null; // Ensure age is a number or null
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

    // Description logic
    let description = notes;
    if (persianName) {
        description = `Persian Name: ${persianName}\n\n${description}`;
    }

    // Prepare data object for comparison/creation
    // We only construct the fields that come from CSV
    const csvData = {
        name: cleanName,
        age: age, // Can be null
        incident_province: province || '',
        incident_city: city || '',
        date_of_death: date,
        status: status,
        source_social_media_link: sources,
        // Description is special, we merge it
    };

    if (existingVictims.has(cleanName.toLowerCase())) {
        const existing = existingVictims.get(cleanName.toLowerCase());
        const doc = existing.doc;
        let changed = false;

        // Compare fields
        if (doc.age !== csvData.age) {
            doc.age = csvData.age;
            changed = true;
        }
        if (doc.incident_province !== csvData.incident_province) {
            doc.incident_province = csvData.incident_province;
            changed = true;
        }
        if (doc.incident_city !== csvData.incident_city) {
            doc.incident_city = csvData.incident_city;
            changed = true;
        }
        if (doc.date_of_death !== csvData.date_of_death) {
            // Only update if csv date is more detailed or different
            // For now simple inequality
            doc.date_of_death = csvData.date_of_death;
            changed = true;
        }
        if (doc.source_social_media_link !== csvData.source_social_media_link) {
            doc.source_social_media_link = csvData.source_social_media_link;
            changed = true;
        }

        // Update description ONLY if existing description is empty
        if (!doc.description || doc.description.trim() === '') {
            doc.description = description;
            changed = true;
        }

        if (changed) {
            const yamlStr = yaml.dump(doc, { lineWidth: -1, quotingType: '"' });
            // Add header comment back if missing (optional but good for consistency)
            const finalContent = `# ==========================================
# Victim Documentation - ${cleanName}
# ==========================================

${yamlStr}`;
            fs.writeFileSync(path.join(victimsDir, existing.filename), finalContent);
            updatedCount++;
            console.log(`Updated: ${cleanName}`);
        }
        return;
    }

    // NEW VICTIM
    newCount++;
    lastId++;
    const padId = String(lastId).padStart(6, '0');
    const filename = `vic-2026-${padId}.yaml`;

    const newDoc = {
        photo: "",
        name: cleanName,
        birth_date: "",
        birth_province: "",
        birth_city: "",
        gender: "",
        age: age,
        occupation: "",
        country: "Iran",
        incident_province: csvData.incident_province,
        incident_city: csvData.incident_city,
        date_of_death: csvData.date_of_death,
        date_of_death_precision: "Exact",
        cause_of_death: "",
        status: status,
        description: description,
        source_type: "Social Media",
        source_social_media_link: csvData.source_social_media_link
    };

    const yamlStr = yaml.dump(newDoc, { lineWidth: -1, quotingType: '"' });
    const finalContent = `# ==========================================
# Victim Documentation - ${cleanName}
# ==========================================

${yamlStr}`;

    fs.writeFileSync(path.join(victimsDir, filename), finalContent);
});

console.log(`Created ${newCount} new victims.`);
console.log(`Updated ${updatedCount} existing victims.`);
