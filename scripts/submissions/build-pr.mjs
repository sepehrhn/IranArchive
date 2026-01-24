#!/usr/bin/env node
/**
 * Build PR from submission
 * 
 * Reads payload from .submission-temp/payload.json
 * Generates YAML files and places media in correct locations
 * Creates PR body for review
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '../..');

// Read payload
const payload = JSON.parse(fs.readFileSync('.submission-temp/payload.json', 'utf-8'));
const { kind, data, files, submittedAt } = payload;
const submissionId = process.env.SUBMISSION_ID;

console.log(`Processing ${kind} submission: ${submissionId}`);

/**
 * Get next sequential ID for a given kind and year
 */
function getNextId(kind, year) {
    const prefixes = {
        incident: `inc-${year}-`,
        victim: `vic-${year}-`,
        evidence: `evi-${year}-`
    };

    const dirs = {
        incident: path.join(ROOT_DIR, 'data/incidents'),
        victim: path.join(ROOT_DIR, 'data/victims'),
        evidence: path.join(ROOT_DIR, 'data/evidences')
    };

    const prefix = prefixes[kind];
    const dir = dirs[kind];

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(dir)
        .filter(f => f.startsWith(prefix) && f.endsWith('.yaml'))
        .map(f => {
            const match = f.match(/-(\d+)\.yaml$/);
            return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => b - a);

    const nextNum = (existingFiles[0] || 0) + 1;
    return String(nextNum).padStart(5, '0');
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/\.+/g, '.')
        .replace(/-+/g, '-')
        .toLowerCase();
}

/**
 * Format date for YAML
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get month name (short)
 */
function getMonthName(dateStr) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const date = new Date(dateStr);
    return months[date.getMonth()];
}

/**
 * Extract year from data
 */
function extractYear(data, kind) {
    let dateStr = '';

    if (kind === 'incident' && data.occurred_at?.start) {
        dateStr = data.occurred_at.start;
    } else if (kind === 'victim' && data.date_of_death) {
        dateStr = data.date_of_death;
    } else if (kind === 'evidence' && data.captured_at) {
        dateStr = data.captured_at;
    }

    if (dateStr) {
        return String(new Date(dateStr).getFullYear());
    }

    return String(new Date().getFullYear());
}

/**
 * Generate incident YAML
 */
function generateIncidentYAML(data, year, id, evidenceFiles = []) {
    const evidenceYaml = evidenceFiles.length > 0
        ? `evidences:\n${evidenceFiles.map(f => `  - file_path: "${f.path}"\n    type: "${f.type}"`).join('\n')}`
        : '';

    const yaml = `# Incident ${id}
# Submitted via public submission form

title: "${data.title || 'Untitled Incident'}"

occurred_at:
  start: "${data.occurred_at?.start || ''}"
  start_time: "${data.occurred_at?.start_time || ''}"
  end: "${data.occurred_at?.end || ''}"
  end_time: "${data.occurred_at?.end_time || ''}"
  timezone: "${data.occurred_at?.timezone || 'Asia/Tehran'}"
  precision: "${data.occurred_at?.precision || 'Unknown'}"

location:
  country: "${data.location?.country || 'Iran'}"
  province: "${data.location?.province || ''}"
  city: "${data.location?.city || ''}"

description: |
  ${data.description || ''}

status: "not_verified"

ratings:
  truth_confidence: 5
  evidence_availability: ${evidenceFiles.length > 0 ? 8 : 5}
${evidenceYaml}

sources:
${data.sources && data.sources.length > 0 ? data.sources.map(s => `  - "${s}"`).join('\n') : '  []'}

submission:
  submitted_by: "${data.submitted_by || 'Anonymous'}"
  received_at: "${submittedAt}"
  submission_id: "${submissionId}"
`;

    return yaml;
}

/**
 * Generate victim YAML
 */
function generateVictimYAML(data, year, id, photoFilename) {
    const yaml = `# Victim ${id}
# Submitted via public submission form

${photoFilename ? `photo: "${photoFilename}"` : '# No photo provided'}

name: "${data.name || 'Unknown'}"
${data.age ? `age: ${data.age}` : '# Age unknown'}

country: "${data.country || 'Iran'}"
province: "${data.province || ''}"
city: "${data.city || ''}"

date_of_death: "${data.date_of_death || ''}"

status: "${data.status || 'not_verified'}"

${data.summary ? `summary: "${data.summary}"` : ''}

${data.notes ? `notes: |\n  ${data.notes.split('\n').join('\n  ')}` : ''}

sources:
${data.sources && data.sources.length > 0 ? data.sources.map(s => `  - "${s}"`).join('\n') : '  []'}

submission:
  submitted_by: "${data.submitted_by || 'Anonymous'}"
  received_at: "${submittedAt}"
  submission_id: "${submissionId}"
`;

    return yaml;
}

/**
 * Generate evidence YAML
 */
function generateEvidenceYAML(data, year, id, mediaPath) {
    const yaml = `# Evidence ${id}
# Submitted via public submission form

type: "${data.type || 'document'}"

title: "${data.title || 'Untitled Evidence'}"

description: |
  ${data.description || ''}

file_path: "${mediaPath}"

${data.captured_at ? `captured_at: "${formatDate(data.captured_at)}"` : '# Capture date unknown'}

${data.claimed_location ? `claimed_location: "${data.claimed_location}"` : ''}

provenance:
  submitted_by: "${data.provenance?.submitted_by || 'Anonymous'}"
  ${data.provenance?.first_published_at ? `first_published_at: "${data.provenance.first_published_at}"` : ''}
  ${data.provenance?.first_published_url ? `first_published_url: "${data.provenance.first_published_url}"` : ''}
  ${data.provenance?.chain_of_custody_note ? `chain_of_custody_note: "${data.provenance.chain_of_custody_note}"` : ''}

content_warning: "${data.content_warning || 'none'}"

flags: []

submission:
  received_at: "${submittedAt}"
  submission_id: "${submissionId}"
`;

    return yaml;
}

/**
 * Process submission
 */
function processSubmission() {
    const year = extractYear(data, kind);
    const id = getNextId(kind, year);

    console.log(`Generated ID: ${kind}-${year}-${id}`);

    let yamlFilename, yamlContent, mediaFiles = [];

    if (kind === 'incident') {
        yamlFilename = `inc-${year}-${id}.yaml`;

        // Handle evidence files if present
        const evidenceFiles = [];
        if (files && files.length > 0) {
            const month = getMonthName(data.occurred_at?.start || submittedAt);

            for (const file of files) {
                const sanitized = sanitizeFilename(file.originalName);
                const evidenceFilename = `${submissionId}-${sanitized}`;
                const evidencePath = `${year}/${month}/${evidenceFilename}`;

                const sourcePath = path.join('.submission-temp/uploads', path.basename(file.key));
                const destPath = path.join(ROOT_DIR, 'data/evidences', evidencePath);

                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied evidence: ${destPath}`);

                // Determine evidence type from mime
                let evidenceType = 'document';
                if (file.mime.startsWith('image/')) evidenceType = 'image';
                else if (file.mime.startsWith('video/')) evidenceType = 'video';

                evidenceFiles.push({ path: evidencePath, type: evidenceType });
                mediaFiles.push({ type: 'evidence', path: destPath });
            }
        }

        yamlContent = generateIncidentYAML(data, year, id, evidenceFiles);

        const yamlPath = path.join(ROOT_DIR, 'data/incidents', yamlFilename);
        fs.writeFileSync(yamlPath, yamlContent);
        console.log(`Created: ${yamlPath}`);

    } else if (kind === 'victim') {
        yamlFilename = `vic-${year}-${id}.yaml`;

        // Handle photo if present
        let photoFilename = null;
        if (files && files.length > 0) {
            const photo = files[0];
            const ext = path.extname(photo.originalName);
            photoFilename = `vic-${year}-${id}${ext}`;

            const sourcePath = path.join('.submission-temp/uploads', path.basename(photo.key));
            const destPath = path.join(ROOT_DIR, 'data/victims/img', photoFilename);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied photo: ${destPath}`);

            mediaFiles.push({ type: 'photo', path: destPath });
        }

        yamlContent = generateVictimYAML(data, year, id, photoFilename);

        const yamlPath = path.join(ROOT_DIR, 'data/victims', yamlFilename);
        fs.writeFileSync(yamlPath, yamlContent);
        console.log(`Created: ${yamlPath}`);

    } else if (kind === 'evidence') {
        yamlFilename = `evi-${year}-${id}.yaml`;

        // Handle media file
        let mediaPath = '';
        if (files && files.length > 0) {
            const file = files[0];
            const month = getMonthName(data.captured_at || submittedAt);
            const sanitized = sanitizeFilename(file.originalName);
            const mediaFilename = `${submissionId}-${sanitized}`;

            mediaPath = `${year}/${month}/${mediaFilename}`;

            const sourcePath = path.join('.submission-temp/uploads', path.basename(file.key));
            const destPath = path.join(ROOT_DIR, 'data/evidences', mediaPath);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied media: ${destPath}`);

            mediaFiles.push({ type: 'evidence', path: destPath });
        }

        yamlContent = generateEvidenceYAML(data, year, id, mediaPath);

        const yamlPath = path.join(ROOT_DIR, 'data/evidences', yamlFilename);
        fs.writeFileSync(yamlPath, yamlContent);
        console.log(`Created: ${yamlPath}`);
    }

    // Generate PR body
    const prBody = generatePRBody(kind, id, year, data, mediaFiles);
    fs.writeFileSync('.submission-temp/pr-body.md', prBody);

    console.log('✅ Submission processed successfully');
}

/**
 * Generate PR body
 */
function generatePRBody(kind, id, year, data, mediaFiles) {
    const kindLabels = {
        incident: 'Incident Report',
        victim: 'Victim Report',
        evidence: 'Evidence Submission'
    };

    let summary = '';
    if (kind === 'incident') {
        const evidenceCount = data.evidence_count || 0;
        summary = `**Title:** ${data.title}\n**Date:** ${data.occurred_at?.start || 'Unknown'}\n**Location:** ${data.location?.city || ''}, ${data.location?.province || ''}\n**Evidence Files:** ${evidenceCount}`;
    } else if (kind === 'victim') {
        summary = `**Name:** ${data.name}\n**Age:** ${data.age || 'Unknown'}\n**Date of Death:** ${data.date_of_death || 'Unknown'}\n**Location:** ${data.city}, ${data.province}`;
    } else if (kind === 'evidence') {
        summary = `**Title:** ${data.title}\n**Type:** ${data.type}\n**Date:** ${data.captured_at || 'Unknown'}`;
    }

    const body = `## ${kindLabels[kind]} Submission

**Submission ID:** \`${submissionId}\`  
**Received:** ${new Date(submittedAt).toLocaleString()}  
**Type:** ${kind}

---

### Summary

${summary}

---

### Files Created

- YAML: \`${kind === 'incident' ? 'data/incidents' : kind === 'victim' ? 'data/victims' : 'data/evidences'}/${kind.substring(0, 3)}-${year}-${id}.yaml\`
${mediaFiles.map(f => `- Media: \`${f.path.replace(ROOT_DIR, '')}\``).join('\n')}

---

### Review Checklist

- [ ] Verify information accuracy
- [ ] Check for personally identifying information (PII)
- [ ] Validate file content (if applicable)
- [ ] Confirm no malicious content
- [ ] Verify proper categorization
- [ ] Check YAML syntax is valid

---

### Actions

**To approve:** Merge this PR  
**To reject:** Close this PR without merging

> **Note:** Merging will publish this submission on the live site. All media will be loaded from GitHub raw URLs.
`;

    return body;
}

// Run
try {
    processSubmission();
} catch (error) {
    console.error('Error processing submission:', error);
    process.exit(1);
}
