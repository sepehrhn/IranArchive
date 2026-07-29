import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const schemasDir = path.join(rootDir, 'schemas');
const dataDir = path.join(rootDir, 'data');
const contentDir = path.join(rootDir, 'content');

const legacyEvidenceSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'evidence.schema.json'), 'utf-8'));
const legacyVictimSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'victim.schema.json'), 'utf-8'));
const legacySourceSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'source.schema.json'), 'utf-8'));
const provinces = JSON.parse(fs.readFileSync(path.join(dataDir, 'provinces.json'), 'utf-8'));

const validateLegacyEvidence = ajv.compile(legacyEvidenceSchema);
const validateLegacyVictim = ajv.compile(legacyVictimSchema);
const validateLegacySource = ajv.compile(legacySourceSchema);

let hasErrors = false;
let warnings = 0;

const evidenceIds = new Set();
const victimIds = new Set();
const incidentIds = new Set();
const eventIds = new Set();
const excludedEventSourceDomains = [
  'ncr-iran.org',
  'oiac.org',
  'iranfreedom.org',
  'mojahedin.org',
  'maryam-rajavi.com'
];
const placeholderPatterns = [
  /Title of the Incident/i,
  /A brief summary of what happened/i,
  /A detailed description of the incident/i,
  /^Claim\s+\d+$/i,
  /News Report Title/i,
  /ev-YYYY/i
];

function fail(message) {
  console.error(message);
  hasErrors = true;
}

function warn(message) {
  console.warn(message);
  warnings += 1;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUrl(value) {
  return isNonEmptyString(value) && /^https?:\/\//i.test(value);
}

function collectStrings(value, out = []) {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out));
    return out;
  }

  if (isPlainObject(value)) {
    Object.values(value).forEach((item) => collectStrings(item, out));
  }

  return out;
}

function hasPlaceholderText(value) {
  return collectStrings(value).some((text) => placeholderPatterns.some((pattern) => pattern.test(text.trim())));
}

function reportPlaceholder(scope, id, value, status = 'verified') {
  if (!hasPlaceholderText(value)) return;

  const message = `[PLACEHOLDER] ${scope} ${id} contains starter-template placeholder text.`;
  if (status === 'draft') {
    warn(`[WARN] ${message}`);
  } else {
    fail(message);
  }
}

function listFilesRecursive(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(fullPath, predicate, out);
    } else if (predicate(entry.name, fullPath)) {
      out.push(fullPath);
    }
  }

  return out;
}

function readYamlObject(filePath) {
  try {
    const parsed = yaml.load(fs.readFileSync(filePath, 'utf-8'));
    if (!isPlainObject(parsed)) {
      fail(`[INVALID_YAML] ${path.relative(rootDir, filePath)} must contain a YAML object.`);
      return null;
    }
    return parsed;
  } catch (error) {
    fail(`[INVALID_YAML] ${path.relative(rootDir, filePath)}: ${error.message}`);
    return null;
  }
}

function readJsonObject(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!isPlainObject(parsed)) {
      fail(`[INVALID_JSON] ${path.relative(rootDir, filePath)} must contain a JSON object.`);
      return null;
    }
    return parsed;
  } catch (error) {
    fail(`[INVALID_JSON] ${path.relative(rootDir, filePath)}: ${error.message}`);
    return null;
  }
}

function validateAgainstSchema(filePath, data, validateFn, label) {
  const valid = validateFn(data);
  if (valid) return;

  fail(`[INVALID] ${label} ${path.relative(rootDir, filePath)}: ${ajv.errorsText(validateFn.errors, { separator: '; ' })}`);
}

function validateVictimsYaml() {
  const victimsDir = path.join(dataDir, 'victims');
  const files = listFilesRecursive(victimsDir, (name) =>
    (name.endsWith('.yaml') || name.endsWith('.yml')) && !name.endsWith('.example')
  );

  for (const filePath of files) {
    const data = readYamlObject(filePath);
    if (!data) continue;

    const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
    if (victimIds.has(id)) {
      fail(`[DUPLICATE] Victim ID ${id} in ${path.relative(rootDir, filePath)}`);
    }
    victimIds.add(id);

    if (!isNonEmptyString(data.name)) fail(`[INVALID] Victim ${id} missing required "name".`);
    if (!isNonEmptyString(data.status)) fail(`[INVALID] Victim ${id} missing required "status".`);
    if (data.source !== undefined && !Array.isArray(data.source) && !isNonEmptyString(data.source)) {
      fail(`[INVALID] Victim ${id} "source" must be a URL string or array of URLs.`);
    }
    if (Array.isArray(data.source)) {
      data.source.forEach((source, index) => {
        if (!isUrl(source)) fail(`[INVALID] Victim ${id} source[${index}] must be an http(s) URL.`);
      });
    }
    if (isNonEmptyString(data.source) && !isUrl(data.source)) {
      fail(`[INVALID] Victim ${id} source must be an http(s) URL.`);
    }
    if (data.incident_province && !provinces.includes(data.incident_province)) {
      fail(`[INVALID_PROVINCE] Victim ${id} has invalid incident_province: "${data.incident_province}"`);
    }
    if (data.birth_province && !provinces.includes(data.birth_province)) {
      fail(`[INVALID_PROVINCE] Victim ${id} has invalid birth_province: "${data.birth_province}"`);
    }
  }
}

function validateEvidenceYaml() {
  const evidencesDir = path.join(dataDir, 'evidences');
  const files = listFilesRecursive(evidencesDir, (name) =>
    (name.endsWith('.yaml') || name.endsWith('.yml')) && !name.endsWith('.example')
  );

  for (const filePath of files) {
    const data = readYamlObject(filePath);
    if (!data) continue;

    const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
    if (evidenceIds.has(id)) {
      fail(`[DUPLICATE] Evidence ID ${id} in ${path.relative(rootDir, filePath)}`);
    }
    evidenceIds.add(id);

    if (!['video', 'image', 'document', 'doc'].includes(data.type)) {
      fail(`[INVALID] Evidence ${id} has invalid "type": ${data.type}`);
    }
    if (!isNonEmptyString(data.title)) fail(`[INVALID] Evidence ${id} missing required "title".`);
    if (!isNonEmptyString(data.description)) fail(`[INVALID] Evidence ${id} missing required "description".`);
    reportPlaceholder('Evidence', id, {
      title: data.title,
      description: data.description,
      provenance: data.provenance,
      corroboration: data.corroboration
    }, 'verified');
    if (!isNonEmptyString(data.file_path)) {
      fail(`[INVALID] Evidence ${id} missing required "file_path".`);
    } else {
      const mediaPath = path.join(evidencesDir, data.file_path);
      if (!fs.existsSync(mediaPath)) {
        fail(`[MISSING_FILE] Evidence ${id} points to missing media file: ${data.file_path}`);
      }
    }
    if (!isPlainObject(data.provenance)) {
      fail(`[INVALID] Evidence ${id} missing required "provenance" object.`);
    } else if (data.provenance.first_published_url && !isUrl(data.provenance.first_published_url)) {
      fail(`[INVALID] Evidence ${id} provenance.first_published_url must be an http(s) URL.`);
    }
    if (!isPlainObject(data.corroboration)) fail(`[INVALID] Evidence ${id} missing required "corroboration" object.`);
    if (!isPlainObject(data.technical)) warn(`[WARN] Evidence ${id} missing optional "technical" object.`);
    if (typeof data.content_warning !== 'boolean') fail(`[INVALID] Evidence ${id} "content_warning" must be true or false.`);
  }
}

function validateIncidentsYaml() {
  const incidentsDir = path.join(dataDir, 'incidents');
  const files = listFilesRecursive(incidentsDir, (name) =>
    (name.endsWith('.yaml') || name.endsWith('.yml')) && !name.endsWith('.example')
  );

  for (const filePath of files) {
    const data = readYamlObject(filePath);
    if (!data) continue;

    const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
    if (incidentIds.has(id)) {
      fail(`[DUPLICATE] Incident ID ${id} in ${path.relative(rootDir, filePath)}`);
    }
    incidentIds.add(id);

    if (!['draft', 'not_verified', 'disputed', 'verified'].includes(data.status)) {
      fail(`[INVALID] Incident ${id} has invalid "status": ${data.status}`);
    }
    if (!isPlainObject(data.occurred_at) || !isNonEmptyString(data.occurred_at.start)) {
      fail(`[INVALID] Incident ${id} missing required "occurred_at.start".`);
    }
    if (!isPlainObject(data.location)) {
      fail(`[INVALID] Incident ${id} missing required "location" object.`);
    } else {
      if (!isNonEmptyString(data.location.country)) fail(`[INVALID] Incident ${id} missing "location.country".`);
      if (data.location.province && !provinces.includes(data.location.province)) {
        fail(`[INVALID_PROVINCE] Incident ${id} has invalid province: "${data.location.province}"`);
      }
    }
    if (!isNonEmptyString(data.title)) fail(`[INVALID] Incident ${id} missing required "title".`);
    if (!isNonEmptyString(data.summary)) fail(`[INVALID] Incident ${id} missing required "summary".`);
    reportPlaceholder('Incident', id, {
      title: data.title,
      summary: data.summary,
      narrative: data.narrative,
      key_claims: data.key_claims,
      sources: data.sources,
      evidence_ids: data.evidence_ids,
      timeline: data.timeline
    }, data.status);
    if (data.evidence_ids !== undefined && !Array.isArray(data.evidence_ids)) {
      fail(`[INVALID] Incident ${id} "evidence_ids" must be an array.`);
    }
    if (Array.isArray(data.evidence_ids)) {
      data.evidence_ids.forEach((evidenceId) => {
        if (!evidenceIds.has(evidenceId)) {
          fail(`[MISSING_LINK] Incident ${id} references missing evidence ${evidenceId}`);
        }
      });
    }
    if (data.sources !== undefined && !Array.isArray(data.sources)) {
      fail(`[INVALID] Incident ${id} "sources" must be an array.`);
    }
  }
}

function validateEventsYaml() {
  const eventsDir = path.join(dataDir, 'events');
  const files = listFilesRecursive(eventsDir, (name) =>
    (name.endsWith('.yaml') || name.endsWith('.yml')) && !name.endsWith('.example')
  );

  for (const filePath of files) {
    const data = readYamlObject(filePath);
    if (!data) continue;

    const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
    if (eventIds.has(id)) {
      fail(`[DUPLICATE] Event ID ${id} in ${path.relative(rootDir, filePath)}`);
    }
    eventIds.add(id);

    const organizerName = data.organizer?.name || '';
    const explicitlyUnaffiliated = /\b(non[- ]?mek|not affiliated with mek|distinguish from mek|avoid mek)\b/i.test(organizerName);
    const excludedOrganizer = /\b(ncri|pmoi|mek|oiac)\b|national council of resistance|mojah(?:e|a)din|maryam rajavi|iran democratic association/i.test(organizerName);

    if (excludedOrganizer && !explicitlyUnaffiliated) {
      fail(`[EXCLUDED_EVENT] Event ${id} has an NCRI/PMOI/MEK-affiliated organizer: "${organizerName}".`);
    }

    const urls = [
      data.organizer?.website,
      ...(Array.isArray(data.source) ? data.source : [])
    ].filter(isNonEmptyString);

    for (const url of urls) {
      try {
        const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
        if (excludedEventSourceDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
          fail(`[EXCLUDED_EVENT] Event ${id} uses excluded NCRI/PMOI/MEK-affiliated source domain: ${hostname}.`);
        }
      } catch {
        fail(`[INVALID] Event ${id} source or organizer website must be an http(s) URL: ${url}`);
      }
    }
  }
}

function validateLegacyJsonDirectories() {
  const legacyEvidenceDir = path.join(dataDir, 'evidence');
  const legacySourcesDir = path.join(dataDir, 'sources');
  const victimsDir = path.join(dataDir, 'victims');

  for (const filePath of listFilesRecursive(legacyEvidenceDir, (name) => name.endsWith('.json'))) {
    const data = readJsonObject(filePath);
    if (data) validateAgainstSchema(filePath, data, validateLegacyEvidence, 'Legacy evidence');
  }

  for (const filePath of listFilesRecursive(legacySourcesDir, (name) => name.endsWith('.json'))) {
    const data = readJsonObject(filePath);
    if (data) {
      validateAgainstSchema(filePath, data, validateLegacySource, 'Legacy source');
      if (!data.archive_url) warn(`[WARN] Source ${path.relative(rootDir, filePath)} missing archive_url`);
    }
  }

  for (const filePath of listFilesRecursive(victimsDir, (name) => name.endsWith('.json'))) {
    const data = readJsonObject(filePath);
    if (!data) continue;

    validateAgainstSchema(filePath, data, validateLegacyVictim, 'Legacy victim');
    const slugFromFilename = path.basename(filePath, '.json');
    if (data.slug !== slugFromFilename) {
      fail(`[MISMATCH] Victim slug ${data.slug} does not match filename ${path.basename(filePath)}`);
    }
  }
}

function validateContentDocs() {
  console.log('Validating content docs...');
  const files = listFilesRecursive(contentDir, (name) => name.endsWith('.md') || name.endsWith('.mdx'));

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content);
    const body = parsed.content.trim();
    if (!body) fail(`[INVALID_CONTENT] ${path.relative(rootDir, filePath)} is empty.`);
    if (parsed.data.url && !isUrl(parsed.data.url)) {
      fail(`[INVALID_CONTENT] ${path.relative(rootDir, filePath)} frontmatter url must be an http(s) URL.`);
    }
  }
}

console.log('Validating live YAML data...');
validateVictimsYaml();
validateEvidenceYaml();
validateIncidentsYaml();
validateEventsYaml();
validateLegacyJsonDirectories();
validateContentDocs();

if (hasErrors) {
  console.error('Validation FAILED');
  process.exit(1);
}

console.log(`Validation SUCCESS${warnings > 0 ? ` with ${warnings} warning(s)` : ''}`);
process.exit(0);
