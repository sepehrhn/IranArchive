import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const EVENTS_DIR = path.resolve(process.cwd(), 'data/events');

// Get all YAML files except example
const files = fs.readdirSync(EVENTS_DIR)
    .filter(f => (f.endsWith('.yaml') || f.endsWith('.yml')) && !f.includes('example'));

let updated = 0;
let errors = 0;

files.forEach(file => {
    const filePath = path.join(EVENTS_DIR, file);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = yaml.load(content);

        if (!data || typeof data !== 'object') {
            console.error(`❌ ${file}: Invalid YAML structure`);
            errors++;
            return;
        }

        // Remove fields
        delete data.summary;
        delete data.type; // Old type field (rally, march, etc.)
        delete data.status; // Verification status
        delete data.speakers;
        delete data.sources;

        // Rename format to type
        if (data.format) {
            data.type = data.format;
            delete data.format;
        }

        // Remove precision from date
        if (data.date && data.date.precision) {
            delete data.date.precision;
        }

        // Remove access from online
        if (data.online && data.online.access) {
            delete data.online.access;
        }

        // Write back
        const newContent = yaml.dump(data, {
            lineWidth: 120,
            quotingType: '"',
            forceQuotes: false
        });

        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`✅ ${file}`);
        updated++;

    } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
        errors++;
    }
});

console.log(`\n✅ Updated: ${updated} files`);
console.log(`❌ Errors: ${errors} files`);
