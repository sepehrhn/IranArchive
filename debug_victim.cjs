const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'victims', 'vic-2026-000002.yaml');
const content = fs.readFileSync(filePath, 'utf8');

let description = '';
const descMatch = content.match(/^description:\s*(\|[^\n]*\n([\s\S]*?))(?=\n#|\n[a-z]|$)/m);
if (descMatch) {
    description = descMatch[2].replace(/^\s+/gm, ' ').replace(/\n/g, ' ').trim();
}

console.log('Description:', description);

const originMatch = description.match(/\boriginally\s+from\s+([^.,;&]+)/i);
console.log('Origin Match:', originMatch);

if (originMatch) {
    console.log('Place:', originMatch[1].trim());
}
