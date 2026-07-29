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
 * Get unique ID for a given kind and year
 * Uses first 8 chars of submissionId to ensure uniqueness across concurrent PRs
 */
function getNextId(kind, year) {
    const dirs = {
        incident: path.join(ROOT_DIR, 'data/incidents'),
        victim: path.join(ROOT_DIR, 'data/victims'),
        evidence: path.join(ROOT_DIR, 'data/evidences'),
        event: path.join(ROOT_DIR, 'data/events'),
        campaign: path.join(ROOT_DIR, 'data/campaigns')
    };

    const dir = dirs[kind];

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Use short hash of submission ID for uniqueness
    // validation against duplicates is low risk due to UUID source
    return submissionId.slice(0, 8);
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
    } else if (kind === 'event' && data.date?.start) {
        dateStr = data.date.start;
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
  ${data.location?.address ? `address: "${data.location.address}"` : ''}
  ${data.location?.lat ? `lat: ${data.location.lat}` : ''}
  ${data.location?.lng ? `lng: ${data.location.lng}` : ''}

description: |
  ${data.description || ''}

status: "not_verified"

${data.severity ? `severity:
  deaths:
    min: ${data.severity.deaths?.min || 0}
    max: ${data.severity.deaths?.max || 0}
  injured:
    min: ${data.severity.injured?.min || 0}
    max: ${data.severity.injured?.max || 0}
  arrests:
    min: ${data.severity.arrests?.min || 0}
    max: ${data.severity.arrests?.max || 0}
` : ''}

ratings:
  veracity: 5
  evidence_availability: ${evidenceFiles.length > 0 ? 8 : 5}
${evidenceYaml}

${data.evidence_ids && data.evidence_ids.length > 0 ? `evidence_ids:\n${data.evidence_ids.map(id => `  - "${id}"`).join('\n')}` : ''}

sources:
${data.sources && data.sources.length > 0 ? data.sources.map(s => `  - "${s}"`).join('\n') : '  []'}

${data.victims && data.victims.length > 0 ? `victims:\n${data.victims.map(id => `  - "${id}"`).join('\n')}` : ''}

${data.related_incidents && data.related_incidents.length > 0 ? `related_incidents:\n${data.related_incidents.map(id => `  - "${id}"`).join('\n')}` : ''}

submission:
  submitted_by: "${data.submitted_by || ''}"
  received_at: "${submittedAt}"
  submission_id: "${submissionId}"
`;

    return yaml;
}

/**
 * Generate victim YAML
 */
function generateVictimYAML(data, id, photos) {
    // Standardize photos list
    let photosYaml = '';
    if (photos && photos.length > 0) {
        photosYaml = `photo:\n${photos.map(p => `  - ${p}`).join('\n')}`;
    } else {
        photosYaml = `photo:\n  - ""`;
    }

    const yaml = `# ==========================================
# Victim Documentation
# ==========================================
# File Naming Convention: vic-YYYY-XXXXX.yaml (e.g., vic-2026-00001.yaml)
# Location: \\data\\victims\\

# -----------------------------------------------------------------------------
# Core Identification
# -----------------------------------------------------------------------------

# Photo Handling:
# 1. Place the image in \`\\data\\victims\\img\\\`
# 2. Enter JUST the filename here (e.g., "vic-xxxx.jpg")
# The system will automatically find and optimize it.
${photosYaml}

# Full Name in English
name: "${data.name || 'Unknown'}"

# Full Name in Persian (Optional)
persian_name: "${data.persian_name || ''}"

# -----------------------------------------------------------------------------
# Personal & Birth Information
# -----------------------------------------------------------------------------

# Date of Birth (Format: YYYY/MM/DD, Optional)
birth_date: "${data.birth_date || ''}"

# Province of Birth (Optional)
birth_province: "${data.birth_province || ''}"

# City of Birth (Optional)
birth_city: "${data.birth_city || ''}"

# Gender (Optional: "Male" or "Female")
gender: "${data.gender || ''}"

# Age at time of death (Optional, remove if unknown)
age: ${data.age !== null && data.age !== undefined ? data.age : ''}

# Occupation (Optional)
occupation: "${data.occupation || ''}"

# -----------------------------------------------------------------------------
# Location & Timing
# -----------------------------------------------------------------------------

# Country
country: "${data.country || 'Iran'}"

# Incident Location
incident_province: "${data.incident_province || ''}"
incident_city: "${data.incident_city || ''}"
incident_address: "${data.incident_address || ''}"

# Date of Death (Format: YYYY/MM/DD)
date_of_death: "${data.date_of_death || ''}"

# Date of Death Precision: 'Exact' | 'Approximate'
# - Exact: Confirmed exact date
# - Approximate: Estimated or uncertain date
date_of_death_precision: "${data.date_of_death_precision || 'Exact'}"

# Cause of Death (Optional, for status: Killed)
# Options: 'Gunshot' | 'Beating' | 'Torture' | 'Execution' | 'Unknown'
cause_of_death: "${data.cause_of_death || ''}"

# -----------------------------------------------------------------------------
# Missing Person Fields (Only for status: Missing)
# -----------------------------------------------------------------------------

# Disappearance Circumstances (Optional, for status: Missing)
# Options: 'Disappeared during protests' | 'Arrested and transferred to unknown location' | 
#          'Abducted from home' | 'Disappeared after detention' | 'Unknown'
disappearance_circumstances: "${data.disappearance_circumstances || ''}"

# Suspected Actor (Optional, for status: Missing)
# Options: 'Security Forces' | 'Plainclothes Agents' | 'Unknown'
suspected_actor: "${data.suspected_actor || ''}"

# -----------------------------------------------------------------------------
# Status
# -----------------------------------------------------------------------------

# Status: 'Killed' | 'Missing'
# - Killed: Confirmed death
# - Missing: Person is missing, status unknown
status: "${data.status || 'verified'}"

# -----------------------------------------------------------------------------
# Narrative
# -----------------------------------------------------------------------------

# Detailed incident description. Supports basic markdown.
${data.description ? `description: |
  ${data.description.split('\n').join('\n  ')}` : 'description: ""'}

# -----------------------------------------------------------------------------
# Sources & References
# -----------------------------------------------------------------------------

# Source Link (Required)
# Can be a single link or a list of links
source:
${data.source && data.source.length > 0 ? data.source.map(s => `  - "${s}"`).join('\n') : '  - ""'}


# -----------------------------------------------------------------------------
# Relationships
# -----------------------------------------------------------------------------
# Note: Incident linking is handled in the INCIDENT YAML files.
# Do NOT list incident IDs here.
# To link this victim to an incident, add their ID to the 'victims' list in the relevant incident YAML.

# Submission Metadata
# submitted_by: "${data.submitted_by || ''}"
# received_at: "${submittedAt}"
# submission_id: "${submissionId}"
# original_id: "${id}"
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
  submitted_by: "${data.provenance?.submitted_by || ''}"
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
 * Generate event YAML
 */
function generateEventYAML(data, year, id) {
    const yaml = `# -----------------------------------------------------------------------------
# EVENT DATA - EV-${year}-${id}
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# EVENT DATA SCHEMA - IRAN ARCHIVE
# -----------------------------------------------------------------------------
# This file serves as a template and documentation for adding new events.
# Use this structure to submit new events to the platform.
#
# FILENAME CONVENTION:
#   ev-YYYY-XXXXX.yaml (e.g., ev-2026-00001.yaml)
#   The filename (without extension) becomes the unique Event ID.
# -----------------------------------------------------------------------------

# [REQUIRED] Core Details
# The visible title of the event (e.g. "Berlin Rally for Freedom")
title: "${data.title || 'Untitled Event'}"

# Set to true to highlight this event in the list
featured: ${data.featured || false}

# A full description of the event. Supports Markdown (bold, links, lists).
# Use the pipe (|) for multi-line text blocks.
description: |
  ${(data.description || '').split('\n').join('\n  ')}

# [REQUIRED] Categorization
# The type of event (physical vs online format)
# Options: in_person, online, hybrid
type: "${data.type || 'in_person'}" 

# [REQUIRED] Timing
date:
  # Start date in YYYY/MM/DD format
  start: "${data.date?.start || ''}"
  # Start time in HH:mm format (optional)
  start_time: "${data.date?.start_time || ''}"
  # End date (optional)
  end: "${data.date?.end || ''}"
  # End time (optional)
  end_time: "${data.date?.end_time || ''}"

# Location (Required for in_person/hybrid events)
${data.type === 'online' ? `location: []
  # country: "${data.location?.country || ''}"
  # city: "${data.location?.city || ''}"
  # address: "${data.location?.address || ''}"
  # lat: ${data.location?.lat || "null"}
  # lng: ${data.location?.lng || "null"}` : `location:
  country: "${data.location?.country || ''}"
  # City name
  city: "${data.location?.city || ''}"
  # Specific address or landmark (optional)
  address: "${data.location?.address || ''}"
  # Latitude (auto-calculated from address if not provided)
  lat: ${data.location?.lat || "null"}
  # Longitude (auto-calculated from address if not provided)
  lng: ${data.location?.lng || "null"}`}

# Online Specifics (Required for online/hybrid events)
${data.type === 'in_person' ? `online: []
  # e.g., Zoom, YouTube, X Spaces
  # platform: "${data.online?.platform || ''}"
  # join_url: "${data.online?.join_url || ''}"
  # registration_url: "${data.online?.registration_url || ''}"` : `online:
  # e.g., Zoom, YouTube, X Spaces
  platform: "${data.online?.platform || ''}"
  join_url: "${data.online?.join_url || ''}"
  registration_url: "${data.online?.registration_url || ''}"`}

# Organizer
organizer:
  name: "${data.organizer?.name || ''}"
  website: "${data.organizer?.website || ''}"
  contact_email: "${data.organizer?.contact_email || ''}"
  # Social media links for the organizer
  socials:
    x: "${data.organizer?.socials?.x || ''}"
    instagram: "${data.organizer?.socials?.instagram || ''}"
    telegram: "${data.organizer?.socials?.telegram || ''}"

# Announcement link (Required) - e.g. Instgram post or tweet
announcement: "${data.announcement || '-'}"

# INTERNAL USE - Submission Metadata
submission:
  submitted_by: "${data.submitted_by || ''}"
  received_at: "${submittedAt}"
  submission_id: "${submissionId}"
`;

    return yaml;
}

/**
 * Generate campaign YAML
 */
function generateCampaignYAML(data, year, id, thumbnailFilename) {
    const yaml = `# Campaign ${id}
# Submitted via public submission form

url: "${data.url || ''}"

title: "${data.title || 'Untitled Campaign'}"

${thumbnailFilename ? `thumbnail: "${thumbnailFilename}"` : '# No thumbnail provided'}

status: "${data.status || 'active'}"

${data.description ? `description: |
  ${data.description}
` : ''}

countries: []

featured: false

created_at: "${formatDate(submittedAt)}"

submission:
  submitted_by: "${data.submitted_by || ''}"
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
    let id;

    // Determine ID
    if (kind === 'victim' && data.is_update && data.original_victim_id) {
        // Use existing ID
        // Format: vic-YYYY-XXXXX -> extract XXXXX
        const match = data.original_victim_id.match(/vic-\d{4}-([a-f0-9]+)/);
        if (match) {
            id = match[1];
            console.log(`Using existing ID for update: ${id}`);
        } else {
            console.warn(`Could not parse original ID: ${data.original_victim_id}, generating new one`);
            id = getNextId(kind, year);
        }
    } else {
        id = getNextId(kind, year);
    }

    console.log(`Processing ID: ${kind}-${year}-${id}`);

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
        const yamlPath = path.join(ROOT_DIR, 'data/victims', yamlFilename);

        // 1. Determine existing photos from file system if updating
        let currentPhotos = [];
        if (data.is_update && fs.existsSync(yamlPath)) {
            try {
                const existingContent = fs.readFileSync(yamlPath, 'utf8');
                // Simple regex to find photos since we need to know what's physically there
                // Matches photo: [list] or photo: "string"
                // For simplicity, we assume we might need to delete any image associated with this victim
                // that is NOT in the new list.
                // BUT, better is to check data.photo (which the form sends back as the list of KEPT photos)
            } catch (e) {
                console.error("Error reading existing YAML:", e);
            }
        }

        // 2. Determine final list of photos
        // Start with photos kept from UI (data.photo is array of strings)
        let finalPhotos = [];
        if (data.photo && Array.isArray(data.photo)) {
            finalPhotos = [...data.photo.filter(p => !!p)];
        } else if (data.photo && typeof data.photo === 'string') {
            finalPhotos = [data.photo];
        }

        // 3. Handle NEW uploaded photos
        if (files && files.length > 0) {
            for (const photo of files) {
                const ext = path.extname(photo.originalName);
                // Generate unique filename for new photo
                const photoFilename = `vic-${year}-${id}-${Date.now().toString().slice(-4)}${ext}`;

                const sourcePath = path.join('.submission-temp/uploads', path.basename(photo.key));
                const destPath = path.join(ROOT_DIR, 'data/victims/img', photoFilename);

                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied photo: ${destPath}`);

                mediaFiles.push({ type: 'photo', path: destPath });
                finalPhotos.push(photoFilename);
            }
        }

        // 4. Handle DELETIONS (files on disk that are NOT in finalPhotos)
        // This relies on the directory scan of files starting with `vic-YEAR-ID`
        if (data.is_update && finalPhotos.length > 0) {
            const imgDir = path.join(ROOT_DIR, 'data/victims/img');
            // Find all images for this victim ID
            // Naming convention is loose, but usually vic-YEAR-ID...
            // Be careful not to delete others.
            // Safer approach: Read the PREVIOUS YAML to know exact filenames to delete?
            // Or better: The form told us what it KEPT (data.photo). 
            // Logic:
            // 1. Read existing YAML at `yamlPath`
            // 2. Parse `photo` field(s)
            // 3. Diff with `finalPhotos`

            try {
                if (fs.existsSync(yamlPath)) {
                    const existingContent = fs.readFileSync(yamlPath, 'utf8');
                    // Dirty parsing to avoid heavy deps, or use regex
                    // We need to extract the existing photo filenames
                    // Regex for list items: - vic-....jpg or photo: "vic-....jpg"
                    const allStrings = existingContent.match(/vic-[\w-]+\.(jpg|jpeg|png|webp)/gi) || [];
                    const existingFiles = [...new Set(allStrings)]; // Unique

                    for (const existingFile of existingFiles) {
                        // If existing file is NOT in finalPhotos, delete it
                        if (!finalPhotos.includes(existingFile)) {
                            const filePath = path.join(imgDir, existingFile);
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                                console.log(`Deleted removed photo: ${filePath}`);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error processing deletions:", e);
            }
        }

        // Ensure no empty strings
        finalPhotos = finalPhotos.filter(p => p && p.trim().length > 0);

        yamlContent = generateVictimYAML(data, id, finalPhotos);

        fs.writeFileSync(yamlPath, yamlContent);
        console.log(`Created/Updated: ${yamlPath}`);

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
    } else if (kind === 'event') {
        yamlFilename = `ev-${year}-${id}.yaml`;
        yamlContent = generateEventYAML(data, year, id);

        const yamlPath = path.join(ROOT_DIR, 'data/events', yamlFilename);
        fs.mkdirSync(path.dirname(yamlPath), { recursive: true });
        fs.writeFileSync(yamlPath, yamlContent);
        console.log(`Created: ${yamlPath}`);

    } else if (kind === 'campaign') {
        yamlFilename = `camp-${year}-${id}.yaml`;

        // Handle thumbnail if present
        let thumbnailFilename = null;
        if (files && files.length > 0) {
            const thumbnail = files[0];
            const ext = path.extname(thumbnail.originalName);
            thumbnailFilename = `camp-${year}-${id}${ext}`;

            const sourcePath = path.join('.submission-temp/uploads', path.basename(thumbnail.key));
            const destPath = path.join(ROOT_DIR, 'data/campaigns/img', thumbnailFilename);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied thumbnail: ${destPath}`);

            mediaFiles.push({ type: 'thumbnail', path: destPath });
        }

        yamlContent = generateCampaignYAML(data, year, id, thumbnailFilename);

        const yamlPath = path.join(ROOT_DIR, 'data/campaigns', yamlFilename);
        fs.mkdirSync(path.dirname(yamlPath), { recursive: true });
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
        evidence: 'Evidence Submission',
        event: 'Event Submission',
        campaign: 'Campaign Submission'
    };

    let summary = '';
    if (kind === 'incident') {
        const evidenceCount = data.evidence_count || 0;
        summary = `**Title:** ${data.title}\n**Date:** ${data.occurred_at?.start || 'Unknown'}\n**Location:** ${data.location?.city || ''}, ${data.location?.province || ''}\n**Evidence Files:** ${evidenceCount}`;
    } else if (kind === 'victim') {
        const status = data.status || 'Killed';
        const dateLabel = status === 'Missing' ? 'Last Seen Date' : 'Date of Death';
        const dateValue = data.date_of_death || 'Unknown';
        const city = data.incident_location_city || data.incident_city || '';
        const province = data.incident_location_province || data.incident_province || '';

        summary = `**Name:** ${data.name}\n**Status:** ${status}\n**Age:** ${data.age || 'Unknown'}\n**${dateLabel}:** ${dateValue}\n**Location:** ${city}, ${province}`;
    } else if (kind === 'evidence') {
        summary = `**Title:** ${data.title}\n**Type:** ${data.type}\n**Date:** ${data.captured_at || 'Unknown'}`;
    } else if (kind === 'event') {
        summary = `**Title:** ${data.title}\n**Date:** ${data.date?.start || 'Unknown'}\n**Format:** ${data.format}\n**Type:** ${data.type}\n**Location:** ${data.location?.city || 'Online'}, ${data.location?.country || ''}`;
    } else if (kind === 'campaign') {
        summary = `**Title:** ${data.title}\n**URL:** ${data.url}\n**Status:** ${data.status}`;
    }

    const dirMap = {
        incident: 'data/incidents',
        victim: 'data/victims',
        evidence: 'data/evidences',
        event: 'data/events',
        campaign: 'data/campaigns'
    };

    const filePrefix = {
        incident: 'inc',
        victim: 'vic',
        evidence: 'evi',
        event: 'ev',
        campaign: 'camp'
    };

    const body = `## ${kindLabels[kind]} Submission

**Submission ID:** \`${submissionId}\`  
**Received:** ${new Date(submittedAt).toLocaleString()}  
**Type:** ${kind}

---

### Summary

${summary}

---

### Files Created

- YAML: \`${dirMap[kind]}/${filePrefix[kind]}-${year}-${id}.yaml\`
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
