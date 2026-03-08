import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.resolve(__dirname, '../data');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const INDEX_DIR = path.join(PUBLIC_DIR, 'index');

if (!fs.existsSync(INDEX_DIR)) {
    fs.mkdirSync(INDEX_DIR, { recursive: true });
}

// 1. Process Campaigns
const campaignsPath = path.join(DATA_DIR, 'campaigns', 'campaigns.yaml');
let campaignsData = { campaigns: [] };
if (fs.existsSync(campaignsPath)) {
    campaignsData = yaml.load(fs.readFileSync(campaignsPath, 'utf8'));
}
fs.writeFileSync(path.join(INDEX_DIR, 'campaigns.json'), JSON.stringify(campaignsData.campaigns, null, 2));

// Helpers to calculate derived metrics
const calcDerived = (statuses) => {
    if (!statuses) return { overall_score: 0, last_activity: null, aligned_campaigns_count: 0 };
    let scoreText = 0;
    let maxDate = null;
    let alignedCount = 0;

    for (const [code, status] of Object.entries(statuses)) {
        scoreText += (status.level || 0);
        if (status.level >= 3) alignedCount++;
        if (status.last_updated) {
            if (!maxDate || status.last_updated > maxDate) maxDate = status.last_updated;
        }
    }
    return {
        overall_score: scoreText,
        last_activity: maxDate,
        aligned_campaigns_count: alignedCount
    };
};

// 2. Process Countries
const countriesDir = path.join(DATA_DIR, 'countries');
let countriesIndex = [];
if (fs.existsSync(countriesDir)) {
    const files = fs.readdirSync(countriesDir).filter(f => f.endsWith('.yaml'));
    for (const file of files) {
        const content = yaml.load(fs.readFileSync(path.join(countriesDir, file), 'utf8'));
        const derived = calcDerived(content.campaign_statuses);
        countriesIndex.push({
            iso2: content.iso2,
            name: content.name,
            region: content.region,
            subregion: content.subregion,
            campaign_statuses: content.campaign_statuses || {},
            ...derived
        });
    }
}
fs.writeFileSync(path.join(INDEX_DIR, 'countries.json'), JSON.stringify(countriesIndex, null, 2));

// 3. Process Entities
const entitiesDir = path.join(DATA_DIR, 'entities');
let entitiesIndex = [];
if (fs.existsSync(entitiesDir)) {
    const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.yaml') && !f.endsWith('.example'));
    for (const file of files) {
        const content = yaml.load(fs.readFileSync(path.join(entitiesDir, file), 'utf8'));
        const derived = calcDerived(content.campaign_positions);
        const slug = file.replace('.yaml', '').replace('ent-', '');
        entitiesIndex.push({
            id: file.replace('.yaml', ''),
            slug,
            type: content.type,
            entity_type: content.entity_type || 'other',
            names: content.names,
            country: content.country?.iso2,
            campaign_positions: content.campaign_positions || {},
            ...derived
        });
    }
}
fs.writeFileSync(path.join(INDEX_DIR, 'entities.json'), JSON.stringify(entitiesIndex, null, 2));

// 4. Process Updates
const updatesDir = path.join(DATA_DIR, 'updates');
let updatesIndex = [];
if (fs.existsSync(updatesDir)) {
    const walkSync = (dir, filelist = []) => {
        fs.readdirSync(dir).forEach(file => {
            const dirFile = path.join(dir, file);
            try { filelist = walkSync(dirFile, filelist); }
            catch (err) {
                if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
            }
        });
        return filelist;
    };

    const files = walkSync(updatesDir).filter(f => f.endsWith('.yaml'));
    for (const filePath of files) {
        const content = yaml.load(fs.readFileSync(filePath, 'utf8'));
        updatesIndex.push(content);
    }
}
// Sort updates by date descending
updatesIndex.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync(path.join(INDEX_DIR, 'updates.json'), JSON.stringify(updatesIndex, null, 2));

console.log("Indexes generated successfully in /public/index/");
