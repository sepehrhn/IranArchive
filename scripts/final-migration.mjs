import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const EVENTS_DIR = path.resolve(process.cwd(), 'data/events');
const EXAMPLE_PATH = path.join(EVENTS_DIR, 'events.yaml.example');

// Read example to get field order and comments (simplified approach)
const exampleContent = fs.readFileSync(EXAMPLE_PATH, 'utf-8');

function getCommentsMap() {
    const lines = exampleContent.split('\n');
    const map = {};
    let currentComments = [];

    for (const line of lines) {
        if (line.trim().startsWith('#') || line.trim() === '') {
            currentComments.push(line);
        } else if (line.includes(':')) {
            const key = line.split(':')[0].trim();
            map[key] = currentComments;
            currentComments = [];
        }
    }
    return map;
}

const commentsMap = getCommentsMap();

const files = fs.readdirSync(EVENTS_DIR)
    .filter(f => (f.endsWith('.yaml') || f.endsWith('.yml')) && !f.includes('example'));

files.forEach(file => {
    const filePath = path.join(EVENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
        const rawData = yaml.load(content);
        if (!rawData) return;

        const currentType = rawData.type || rawData.format;
        delete rawData.format;

        const validTypes = ["in_person", "online", "hybrid"];
        if (!validTypes.includes(currentType)) {
            // Infer type based on structure
            if (rawData.location && rawData.online) rawData.type = 'hybrid';
            else if (rawData.online) rawData.type = 'online';
            else rawData.type = 'in_person';
        } else {
            rawData.type = currentType;
        }

        // Ensure missing fields from request are added/removed
        delete rawData.summary;
        delete rawData.precision;
        delete rawData.access;
        delete rawData.status;
        delete rawData.speakers;
        delete rawData.sources;
        if (rawData.date) delete rawData.date.precision;
        if (rawData.online) delete rawData.online.access;

        // Field order as per user request: title, featured, description, type, date, location, online, organizer, poster
        const orderedKeys = ['title', 'featured', 'description', 'type', 'date', 'location', 'online', 'organizer', 'poster'];

        let output = "";

        // Header
        output += "# -----------------------------------------------------------------------------\n";
        output += "# EVENT DATA - " + file.split('.')[0].toUpperCase() + "\n";
        output += "# -----------------------------------------------------------------------------\n\n";

        orderedKeys.forEach(key => {
            if (rawData[key] !== undefined) {
                // Add comments if exist
                if (commentsMap[key]) {
                    output += commentsMap[key].join('\n') + '\n';
                }

                const val = rawData[key];
                if (key === 'description' && typeof val === 'string' && val.includes('\n')) {
                    output += `${key}: |\n  ${val.split('\n').map(l => l.trim()).join('\n  ').trimEnd()}\n\n`;
                } else {
                    const yamlVal = yaml.dump({ [key]: val }, { quotingType: '"', lineWidth: 100 });
                    output += yamlVal + '\n';
                }
            }
        });

        fs.writeFileSync(filePath, output, 'utf-8');
        console.log(`Updated: ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
