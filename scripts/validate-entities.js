/**
 * Entity YAML Validation Script
 *
 * Validates all entity YAML files in /data/entities/ against schema rules.
 * Run: node scripts/validate-entities.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ENTITY_DIR = path.join(ROOT, 'data', 'entities');

// Allowed enums
const VALID_TYPES = ['celebrity', 'politician', 'organization', 'company', 'media', 'ngo', 'government_body', 'religious_figure', 'influencer', 'academic', 'other'];
const VALID_STANCES = ['pro_people', 'pro_regime', 'neutral', 'both_sides', 'unclear'];
const VALID_DIRECTIONS = ['supports_people', 'supports_regime', 'neutral', 'disputed', 'context_needed'];
const VALID_VISIBILITY = ['both', 'en_only', 'fa_only'];
const VALID_REVIEW_STATUS = ['draft', 'under_review', 'published'];

let totalErrors = 0;

function validateEntity(filePath, data) {
    const errors = [];
    const fileName = path.basename(filePath);

    // id and slug are derived from filename, not stored in YAML
    const baseName = fileName.replace('.yaml', '');
    const slug = baseName.replace(/^ent-/, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`Filename "${fileName}" does not produce valid kebab-case slug: "${slug}"`);

    // Type
    if (!data.type || !VALID_TYPES.includes(data.type)) errors.push(`Invalid "type": ${data.type}`);

    // Names
    if (!data.names || typeof data.names !== 'object') {
        errors.push('Missing "names" object');
    } else {
        if (!data.names.primary || typeof data.names.primary !== 'string') errors.push('Missing "names.primary"');
    }

    // Country
    if (!data.country || typeof data.country !== 'object') {
        errors.push('Missing "country" object');
    } else {
        if (!data.country.iso2 || typeof data.country.iso2 !== 'string') errors.push('Missing "country.iso2"');
    }

    // Visibility
    if (!data.visibility || !VALID_VISIBILITY.includes(data.visibility?.show_in)) {
        errors.push(`Invalid "visibility.show_in": ${data.visibility?.show_in}`);
    }

    // Stance
    if (!data.stance || typeof data.stance !== 'object') {
        errors.push('Missing "stance" object');
    } else {
        if (!VALID_STANCES.includes(data.stance.label)) errors.push(`Invalid "stance.label": ${data.stance.label}`);
        if (typeof data.stance.confidence !== 'number' || data.stance.confidence < 0 || data.stance.confidence > 100) {
            errors.push(`Invalid "stance.confidence": ${data.stance.confidence}`);
        }
        if (!data.stance.summary || typeof data.stance.summary !== 'string') {
            errors.push('Missing "stance.summary" (expected a string)');
        }
        if (!data.stance.last_updated || !/^\d{4}-\d{2}-\d{2}$/.test(data.stance.last_updated)) {
            errors.push(`Invalid "stance.last_updated": ${data.stance.last_updated}`);
        }
    }

    // Evidence refs
    if (!Array.isArray(data.evidence_refs)) {
        errors.push('Missing "evidence_refs" array');
    } else {
        data.evidence_refs.forEach((ref, i) => {
            if (!ref.evidence_id) errors.push(`evidence_refs[${i}]: missing "evidence_id"`);
            if (!VALID_DIRECTIONS.includes(ref.direction)) errors.push(`evidence_refs[${i}]: invalid "direction": ${ref.direction}`);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(ref.date)) errors.push(`evidence_refs[${i}]: invalid "date": ${ref.date}`);
            if (typeof ref.importance !== 'number' || ref.importance < 1 || ref.importance > 5) {
                errors.push(`evidence_refs[${i}]: invalid "importance": ${ref.importance}`);
            }
        });
    }

    // Review
    if (!data.review || typeof data.review !== 'object') {
        errors.push('Missing "review" object');
    } else {
        if (!VALID_REVIEW_STATUS.includes(data.review.status)) errors.push(`Invalid "review.status": ${data.review.status}`);
        if (!Array.isArray(data.review.review_history) || data.review.review_history.length === 0) {
            errors.push('Missing or empty "review.review_history"');
        }
    }

    if (errors.length > 0) {
        console.error(`\n❌ ${fileName}:`);
        errors.forEach(e => console.error(`   • ${e}`));
        totalErrors += errors.length;
    }

    return errors.length === 0;
}

// ── Main ─────────────────────────────────────────────────

const files = fs.readdirSync(ENTITY_DIR).filter(f => f.endsWith('.yaml') && !f.endsWith('.example'));
const allSlugs = [];
const allIds = [];
let validCount = 0;

for (const file of files) {
    const filePath = path.join(ENTITY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    if (validateEntity(filePath, data)) {
        validCount++;
    }

    // Derive id/slug from filename for uniqueness check
    const baseName = file.replace('.yaml', '');
    const slug = baseName.replace(/^ent-/, '');
    allSlugs.push(slug);
    allIds.push(baseName);
}

// Check uniqueness
const dupSlugs = allSlugs.filter((s, i) => allSlugs.indexOf(s) !== i);
if (dupSlugs.length > 0) {
    console.error(`\n❌ Duplicate slugs found: ${dupSlugs.join(', ')}`);
    totalErrors++;
}

const dupIds = allIds.filter((s, i) => allIds.indexOf(s) !== i);
if (dupIds.length > 0) {
    console.error(`\n❌ Duplicate IDs found: ${dupIds.join(', ')}`);
    totalErrors++;
}

if (totalErrors > 0) {
    console.error(`\n❌ Validation failed with ${totalErrors} error(s).`);
    process.exit(1);
} else {
    console.log(`\n✅ All ${validCount} entity file(s) validated successfully.`);
}
