import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import { fileURLToPath } from 'url';

const ajv = new Ajv({ allErrors: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.resolve(__dirname, '../data');
const SCHEMAS_DIR = path.resolve(__dirname, '../schemas');

// Load Schemas
const campaignsSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'campaigns.schema.json'), 'utf-8'));
const countrySchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'country.schema.json'), 'utf-8'));
const entitySchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'entity.schema.json'), 'utf-8'));
const updateSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'update.schema.json'), 'utf-8'));

const validateCampaigns = ajv.compile(campaignsSchema);
const validateCountry = ajv.compile(countrySchema);
const validateEntity = ajv.compile(entitySchema);
const validateUpdate = ajv.compile(updateSchema);

let hasErrors = false;

function validateFile(filePath, content, validateFn, name) {
    const valid = validateFn(content);
    if (!valid) {
        console.error(`[INVALID] ${name} (${filePath}):`);
        validateFn.errors.forEach(err => {
            console.error(`  - ${err.instancePath} ${err.message}`);
        });
        hasErrors = true;
    }
}

// 1. Validate Campaigns
const campaignsPath = path.join(DATA_DIR, 'campaigns', 'campaigns.yaml');
if (fs.existsSync(campaignsPath)) {
    const content = yaml.load(fs.readFileSync(campaignsPath, 'utf8'));
    validateFile(campaignsPath, content, validateCampaigns, 'Campaigns Configuration');
}

// 2. Validate Countries
const countriesDir = path.join(DATA_DIR, 'countries');
if (fs.existsSync(countriesDir)) {
    const files = fs.readdirSync(countriesDir).filter(f => f.endsWith('.yaml'));
    for (const file of files) {
        const filePath = path.join(countriesDir, file);
        const content = yaml.load(fs.readFileSync(filePath, 'utf8'));
        validateFile(filePath, content, validateCountry, 'Country');

        // Custom logic: check evidence_ids when level > 0
        if (content.campaign_statuses) {
            for (const [campaignCode, status] of Object.entries(content.campaign_statuses)) {
                if (status.level > 0 && (!status.evidence_ids || status.evidence_ids.length === 0)) {
                    console.error(`[INVALID] Country (${filePath}): Campaign '${campaignCode}' has level ${status.level} but no evidence_ids.`);
                    hasErrors = true;
                }
            }
        }
    }
}

// 3. Validate Entities
const entitiesDir = path.join(DATA_DIR, 'entities');
if (fs.existsSync(entitiesDir)) {
    const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.yaml') && !f.endsWith('.example'));
    for (const file of files) {
        const filePath = path.join(entitiesDir, file);
        const content = yaml.load(fs.readFileSync(filePath, 'utf8'));
        // we skip full schema validation for entities here unless we migrate ALL of them, otherwise it fails on legacy ones.
        // wait, we can just validate the ones that have campaign_positions or not. Let's just do schema validation anyway.
        validateFile(filePath, content, validateEntity, 'Entity');

        if (content.campaign_positions) {
            for (const [campaignCode, status] of Object.entries(content.campaign_positions)) {
                if (status.level > 0 && (!status.evidence_ids || status.evidence_ids.length === 0)) {
                    console.error(`[INVALID] Entity (${filePath}): Campaign '${campaignCode}' has level ${status.level} but no evidence_ids.`);
                    hasErrors = true;
                }
            }
        }
    }
}

// 4. Validate Updates
const updatesDir = path.join(DATA_DIR, 'updates');
if (fs.existsSync(updatesDir)) {
    // Read recursively
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
        validateFile(filePath, content, validateUpdate, 'Update');
    }
}

if (hasErrors) {
    console.error("Campaign data validation FAILED");
    process.exit(1);
} else {
    console.log("Campaign data validation SUCCESS");
    process.exit(0);
}
