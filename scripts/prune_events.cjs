const fs = require('fs');
const path = require('path');

const EVENTS_DIR = path.join(__dirname, '..', 'data', 'events');
const TODAY = '2026/01/28';

if (!fs.existsSync(EVENTS_DIR)) {
    console.error('Events directory not found');
    process.exit(1);
}

const files = fs.readdirSync(EVENTS_DIR);
let count = 0;

files.forEach(file => {
    if (!file.endsWith('.yaml')) return;
    const filePath = path.join(EVENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // regex to find start date
    const dateMatch = content.match(/start:\s*"?(\d{4}\/\d{2}\/\d{2})"?/);
    if (dateMatch) {
        const startDate = dateMatch[1];
        if (startDate >= TODAY) {
            console.log(`Deleting ${file} (Date: ${startDate})`);
            fs.unlinkSync(filePath);
            count++;
        }
    }
});

console.log(`Pruned ${count} upcoming events.`);
