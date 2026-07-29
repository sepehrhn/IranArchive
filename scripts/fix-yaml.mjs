import fs from 'fs';
import path from 'path';

const EVENTS_DIR = path.resolve(process.cwd(), 'data/events');

// Get all YAML files except example and ev-2026-00001 (already fixed)
const files = fs.readdirSync(EVENTS_DIR)
    .filter(f => (f.endsWith('.yaml') || f.endsWith('.yml')) && !f.includes('example') && f !== 'ev-2026-00001.yaml');

let fixed = 0;

files.forEach(file => {
    const filePath = path.join(EVENTS_DIR, file);

    try {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Fix malformed YAML from previous batch update
        // Fix line like: "backup_url: ~  registration_url: ~"
        content = content.replace(/backup_url:\s*~\s+registration_url:/g, 'backup_url: ~\n  registration_url:');

        // Write back
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${file}`);
        fixed++;

    } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
    }
});

console.log(`\n✅ Fixed ${fixed} files`);
