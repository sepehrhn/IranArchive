const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const victimsDir = path.join(__dirname, 'data', 'victims');

if (!fs.existsSync(victimsDir)) {
    console.error(`Directory not found: ${victimsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(victimsDir).filter(f => f.endsWith('.yaml'));

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(victimsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let doc;
    try {
        doc = yaml.load(content);
    } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
        return;
    }

    if (!doc || (doc.status && doc.status.toLowerCase() !== 'killed')) {
        return;
    }

    const description = doc.description || '';
    if (!description) return;

    // Normalize description for matching (replace newlines with spaces)
    const descText = description.replace(/[\r\n]+/g, ' ').trim();

    let modified = false;

    // Helper to set value in raw content
    const setVal = (key, val) => {
        // Find line starting with key
        const regex = new RegExp(`^(${key}:)\\s*(.*)$`, 'm');
        const match = content.match(regex);
        if (match) {
            const currentVal = match[2].trim();
            // Only update if current value is empty ("" or empty)
            if (currentVal === '""' || currentVal === '' || currentVal === 'null') {
                const safeVal = val.replace(/"/g, '\\"');
                content = content.replace(regex, `$1 "${safeVal}"`);
                modified = true;
                // console.log(`[${file}] Set ${key} to "${val}"`);
            }
        }
    };

    // 1. Age
    if (!doc.age) {
        const ageMatch = descText.match(/\b(\d{1,2})\s*[- ]?(?:years?|yrs?)\s*(?:old)?\b/i) ||
            descText.match(/\baged?\s*(\d{1,2})\b/i);
        if (ageMatch) {
            setVal('age', parseInt(ageMatch[1])); // Age is usually a number, so no quotes in YAML if integer, but "34" is fine too.
            // Wait, existing file has `age: `. If I put `age: "25"`, it's string.
            // `age` field in YAML without quotes is number. 
            // My setVal adds quotes. `age: "25"`. This is acceptable for YAML.
        }
    }

    // 2. Gender
    if (!doc.gender) {
        if (/\b(man|boy|male|father|brother|husband|son)\b/i.test(descText)) {
            setVal('gender', 'Male');
        } else if (/\b(woman|girl|female|mother|sister|wife|daughter)\b/i.test(descText)) {
            setVal('gender', 'Female');
        }
    }

    // 3. Occupation
    if (!doc.occupation) {
        const workMatch = descText.match(/\b(?:worked|working|employed)\s+as\s+(?:an?|the)?\s*([a-zA-Z\s]+?)(?:[.,;]|\s+in\b|\s+at\b|$)/i) ||
            descText.match(/\bwas\s+(?:an?|the)\s+([a-zA-Z\s]+?)(?:[.,;]|\s+in\b|\s+at\b|$)/i);

        if (workMatch) {
            let occ = workMatch[1].trim();
            if (occ.length < 50 && !/killed|shot|born|originally/i.test(occ)) {
                setVal('occupation', occ);
            }
        }
    }

    // 4. Cause of Death
    if (!doc.cause_of_death) {
        const causeMatch = descText.match(/\bkilled\s+(?:by|from|with)\s+([^.,;]+)/i) ||
            descText.match(/\bdied\s+(?:due\s+to|from)\s+([^.,;]+)/i) ||
            descText.match(/\bshot\s+(?:in|by|with)\s+([^.,;]+)/i) ||
            descText.match(/\bhit\s+by\s+([^.,;]+)/i);

        if (causeMatch) {
            let cause = causeMatch[1].trim();
            if (descText.match(/\bshot\s+(?:in|by|with)\s+([^.,;]+)/i)) {
                cause = `Shot ${causeMatch[0].includes('in') ? 'in' : 'by'} ${cause}`;
            } else if (causeMatch[0].toLowerCase().startsWith('killed')) { // safely check start
                cause = `Killed by ${cause}`;
            }
            if (cause.startsWith("Killed by Killed by")) cause = cause.replace("Killed by Killed by", "Killed by");
            if (cause.length < 100) {
                setVal('cause_of_death', cause);
            }
        }
    }

    // 5. Birth City / Province
    // Note: doc.birth_city might be "" or null.
    if (!doc.birth_city && !doc.birth_province) {
        const originMatch = descText.match(/\boriginally\s+from\s+([^.,;&\n]+)/i) ||
            descText.match(/\bfrom\s+([^.,;&\n]+)/i) ||
            descText.match(/\bnative\s+of\s+([^.,;&\n]+)/i) ||
            descText.match(/\bborn\s+in\s+([^.,;&\n]+)/i);

        if (originMatch) {
            const place = originMatch[1].trim();
            if (place.length < 30) {
                if (/province/i.test(place)) {
                    // Check if birth_province is actually empty before setting
                    if (!doc.birth_province) setVal('birth_province', place);
                } else {
                    if (!doc.birth_city) setVal('birth_city', place);
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
    }
});

console.log(`Analyzed ${files.length} files. Updated ${updatedCount} files.`);
