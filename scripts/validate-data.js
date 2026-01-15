import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

const ajv = new Ajv();
addFormats(ajv);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schemasDir = path.resolve(__dirname, '../schemas');
const dataDir = path.resolve(__dirname, '../data');

// Load Schemas
const incidentSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'incident.schema.json'), 'utf-8'));
const evidenceSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'evidence.schema.json'), 'utf-8'));
const victimSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'victim.schema.json'), 'utf-8'));
const sourceSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'source.schema.json'), 'utf-8'));
const provinces = JSON.parse(fs.readFileSync(path.join(dataDir, 'provinces.json'), 'utf-8'));

const validateIncident = ajv.compile(incidentSchema);
const validateEvidence = ajv.compile(evidenceSchema);
const validateVictim = ajv.compile(victimSchema);
const validateSource = ajv.compile(sourceSchema);

// Custom validators for i18n
function validateEvidenceCustom(evidence, id) {
  if (!evidence.type) throw new Error(`Evidence ${id} missing 'type'`);
  if (!evidence.source_url) throw new Error(`Evidence ${id} missing 'source_url'`);
  if (evidence.pii_risk && !['low', 'medium', 'high'].includes(evidence.pii_risk)) {
    throw new Error(`Evidence ${id} invalid pii_risk`);
  }
  if (evidence.notes_i18n && typeof evidence.notes_i18n !== 'object') {
    throw new Error(`Evidence ${id} invalid notes_i18n`);
  }
}

function validateIncidentCustom(incident, id) {
  const required = ['date_start', 'city', 'title', 'summary', 'status', 'tags', 'evidence_ids'];
  required.forEach(field => {
    if (!incident[field]) throw new Error(`Incident ${id} missing '${field}'`);
  });

  if (incident.summary_i18n && typeof incident.summary_i18n !== 'object') {
    throw new Error(`Incident ${id} invalid summary_i18n`);
  }

  if (!Array.isArray(incident.tags)) throw new Error(`Incident ${id} tags must be array`);
  if (!Array.isArray(incident.evidence_ids)) throw new Error(`Incident ${id} evidence_ids must be array`);
}

let hasErrors = false;

// Store IDs for integrity check
const incidentIds = new Set();
const evidenceIds = new Set();
const victimIds = new Set();
const sourceIds = new Set();

const incidentEvidenceRefs = new Map(); // incident_id -> [evidence_ids]
const evidenceIncidentRefs = new Map(); // evidence_id -> incident_id
const victimSourceRefs = new Map(); // victim_id -> [source_ids]
const victimIncidentRefs = new Map(); // victim_id -> [{incident_id, supporting_sources}]

// Validate Incidents
const incidentsDir = path.join(dataDir, 'incidents');
if (fs.existsSync(incidentsDir)) {
  const files = fs.readdirSync(incidentsDir).filter(f => (f.endsWith('.yaml') || f.endsWith('.yml')) && f !== 'index.yaml');
  for (const file of files) {
    const content = yaml.load(fs.readFileSync(path.join(incidentsDir, file), 'utf-8'));
    const valid = validateIncident(content);
    if (!valid) {
      console.error(`[INVALID] Incident ${file}:`, validateIncident.errors);
      hasErrors = true;
    } else {
      if (incidentIds.has(content.incident_id)) {
        console.error(`[DUPLICATE] Incident ID ${content.incident_id} in ${file}`);
        hasErrors = true;
      }
      incidentIds.add(content.incident_id);
      incidentEvidenceRefs.set(content.incident_id, content.evidence_ids || []);

      try {
        validateIncidentCustom(content, content.incident_id);
      } catch (e) {
        console.error(`[INVALID] Incident ${file}:`, e.message);
        hasErrors = true;
      }

      if (content.province && !provinces.includes(content.province)) {
        console.error(`[INVALID_PROVINCE] Incident ${file} has invalid province: "${content.province}"`);
        hasErrors = true;
      }
    }
  }
}

// Validate Evidence
const evidenceDir = path.join(dataDir, 'evidence');
if (fs.existsSync(evidenceDir)) {
  const files = fs.readdirSync(evidenceDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(evidenceDir, file), 'utf-8'));
    const valid = validateEvidence(content);
    if (!valid) {
      console.error(`[INVALID] Evidence ${file}:`, validateEvidence.errors);
      hasErrors = true;
    } else {
      try {
        validateEvidenceCustom(content, content.evidence_id);
      } catch (e) {
        console.error(`[INVALID] Evidence ${file}:`, e.message);
        hasErrors = true;
      }

      if (evidenceIds.has(content.evidence_id)) {
        console.error(`[DUPLICATE] Evidence ID ${content.evidence_id} in ${file}`);
        hasErrors = true;
      }
      evidenceIds.add(content.evidence_id);
      evidenceIncidentRefs.set(content.evidence_id, content.incident_id);
    }
  }
}

// Validate Sources
const sourcesDir = path.join(dataDir, 'sources');
if (fs.existsSync(sourcesDir)) {
  const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(sourcesDir, file), 'utf-8'));
    const valid = validateSource(content);
    if (!valid) {
      console.error(`[INVALID] Source ${file}:`, validateSource.errors);
      hasErrors = true;
    } else {
      if (sourceIds.has(content.id)) {
        console.error(`[DUPLICATE] Source ID ${content.id} in ${file}`);
        hasErrors = true;
      }
      sourceIds.add(content.id);
      if (!content.archive_url) {
        console.warn(`[WARN] Source ${file} missing archive_url`);
      }
    }
  }
}

// Validate Victims
const victimsDir = path.join(dataDir, 'victims');
if (fs.existsSync(victimsDir)) {
  const files = fs.readdirSync(victimsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(victimsDir, file), 'utf-8'));
    const valid = validateVictim(content);

    // Slug match check
    const slugFromFilename = file.replace('.json', '');
    if (content.slug !== slugFromFilename) {
      console.error(`[MISMATCH] Victim slug ${content.slug} does not match filename ${file}`);
      hasErrors = true;
    }

    if (!valid) {
      console.error(`[INVALID] Victim ${file}:`, validateVictim.errors);
      hasErrors = true;
    } else {
      if (victimIds.has(content.id)) {
        console.error(`[DUPLICATE] Victim ID ${content.id} in ${file}`);
        hasErrors = true;
      }
      victimIds.add(content.id);
      victimSourceRefs.set(content.id, content.sources || []);

      if (content.incident_links) {
        victimIncidentRefs.set(content.id, content.incident_links);
      }

      const p = content.death?.location?.province;
      if (p && !provinces.includes(p)) {
        console.error(`[INVALID_PROVINCE] Victim ${file} has invalid province: "${p}"`);
        hasErrors = true;
      }
    }
  }
}

// Check Integrity
// 1. Check if all evidence_ids referenced in incidents exist
for (const [incId, evIds] of incidentEvidenceRefs) {
  for (const evId of evIds) {
    if (!evidenceIds.has(evId)) {
      console.error(`[MISSING_LINK] Incident ${incId} references missing evidence ${evId}`);
      hasErrors = true;
    }
  }
}

// 2. Check if all incident_ids referenced in evidence exist
for (const [evId, incId] of evidenceIncidentRefs) {
  if (!incidentIds.has(incId)) {
    console.error(`[MISSING_LINK] Evidence ${evId} references missing incident ${incId}`);
    hasErrors = true;
  }

  // Strict bidirectional check:
  const incidentRefs = incidentEvidenceRefs.get(incId);
  if (!incidentRefs || !incidentRefs.includes(evId)) {
    console.error(`[MISSING_LINK] Evidence ${evId} points to Incident ${incId}, but Incident does not list it.`);
    hasErrors = true;
  }
}

// 3. Check Victim -> Source links
for (const [vicId, srcIds] of victimSourceRefs) {
  for (const srcId of srcIds) {
    if (!sourceIds.has(srcId)) {
      console.error(`[MISSING_LINK] Victim ${vicId} references missing source ${srcId}`);
      hasErrors = true;
    }
  }
}

// 4. Check Victim -> Incident links and supporting sources
for (const [vicId, links] of victimIncidentRefs) {
  for (const link of links) {
    if (!incidentIds.has(link.incident_id)) {
      console.error(`[MISSING_LINK] Victim ${vicId} references missing incident ${link.incident_id}`);
      hasErrors = true;
    }
    for (const srcId of link.supporting_sources) {
      if (!sourceIds.has(srcId)) {
        console.error(`[MISSING_LINK] Victim ${vicId} incident link references missing source ${srcId}`);
        hasErrors = true;
      }
    }
  }
}

// --- Validate Content Collections (Articles & Resources) ---
console.log('Validating content collections...');
const contentDir = path.join(__dirname, '../src/content');
const articlesDir = path.join(contentDir, 'articles');
const resourcesDir = path.join(contentDir, 'resources');

// Validate Articles
if (fs.existsSync(articlesDir)) {
  const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  articleFiles.forEach(file => {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    const { data } = matter(content);

    if (!data.title) {
      console.error(`[INVALID_ARTICLE] ${file} missing 'title'`);
      hasErrors = true;
    }
    if (!data.date) {
      console.error(`[INVALID_ARTICLE] ${file} missing 'date'`);
      hasErrors = true;
    }
    if (!data.summary) {
      console.error(`[INVALID_ARTICLE] ${file} missing 'summary'`);
      hasErrors = true;
    }
    if (!data.language || !['en', 'fa'].includes(data.language)) {
      console.error(`[INVALID_ARTICLE] ${file} invalid or missing 'language' (must be 'en' or 'fa')`);
      hasErrors = true;
    }
  });
}

// Validate Resources
if (fs.existsSync(resourcesDir)) {
  const resourceFiles = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  resourceFiles.forEach(file => {
    const content = fs.readFileSync(path.join(resourcesDir, file), 'utf-8');
    const { data } = matter(content);

    if (!data.title) {
      console.error(`[INVALID_RESOURCE] ${file} missing 'title'`);
      hasErrors = true;
    }
    if (!data.url) {
      console.error(`[INVALID_RESOURCE] ${file} missing 'url'`);
      hasErrors = true;
    }
    // Simple URL regex check
    if (data.url && !/^https?:\/\//.test(data.url)) {
      console.error(`[INVALID_RESOURCE] ${file} 'url' must start with http:// or https://`);
      hasErrors = true;
    }
  });
}

if (hasErrors) {
  console.error("Validation FAILED");
  process.exit(1);
} else {
  console.log("Validation SUCCESS");
  process.exit(0);
}
