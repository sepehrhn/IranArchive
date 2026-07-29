import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const placeholderPatterns = [
  /Title of the Incident/i,
  /A brief summary of what happened/i,
  /A detailed description of the incident/i,
  /^Claim\s+\d+$/i,
  /News Report Title/i,
  /ev-YYYY/i,
  /ev-migrated-placeholder/i
];

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

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf-8')) || {};
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

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, out));
  }

  return out;
}

function hasPlaceholder(value) {
  return collectStrings(value).some((text) => placeholderPatterns.some((pattern) => pattern.test(text.trim())));
}

function sourceCount(record) {
  if (Array.isArray(record.source)) return record.source.length;
  if (typeof record.source === 'string' && record.source.trim()) return 1;
  if (Array.isArray(record.sources)) return record.sources.length;
  return 0;
}

function evidenceRefs(record) {
  const refs = [];
  if (Array.isArray(record.evidence_ids)) refs.push(...record.evidence_ids);
  if (Array.isArray(record.evidence_refs)) refs.push(...record.evidence_refs);
  if (Array.isArray(record.evidence)) refs.push(...record.evidence);
  return refs
    .map((ref) => {
      if (typeof ref === 'string') return ref;
      if (ref && typeof ref === 'object') return ref.id || ref.evidence_id || ref.ref || '';
      return '';
    })
    .filter(Boolean);
}

const yamlFiles = {
  victims: listFilesRecursive(path.join(dataDir, 'victims'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example')),
  incidents: listFilesRecursive(path.join(dataDir, 'incidents'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example')),
  evidence: listFilesRecursive(path.join(dataDir, 'evidences'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example')),
  countries: listFilesRecursive(path.join(dataDir, 'countries'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example')),
  entities: listFilesRecursive(path.join(dataDir, 'entities'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example')),
  campaigns: listFilesRecursive(path.join(dataDir, 'campaigns'), (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example'))
};

const evidenceIds = new Set(yamlFiles.evidence.map((filePath) => path.basename(filePath).replace(/\.(yaml|yml)$/i, '')));
const report = {
  totals: Object.fromEntries(Object.entries(yamlFiles).map(([key, files]) => [key, files.length])),
  incidents_without_evidence: [],
  records_with_placeholder_text: [],
  records_with_missing_evidence_refs: [],
  victims_without_source: []
};

for (const filePath of yamlFiles.victims) {
  const record = readYaml(filePath);
  const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
  if (sourceCount(record) === 0) report.victims_without_source.push(id);
  if (hasPlaceholder(record)) report.records_with_placeholder_text.push(`victim:${id}`);
}

for (const filePath of yamlFiles.incidents) {
  const record = readYaml(filePath);
  const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
  const refs = evidenceRefs(record);
  if (refs.length === 0 && record.status !== 'draft') report.incidents_without_evidence.push(id);
  if (hasPlaceholder(record)) report.records_with_placeholder_text.push(`incident:${id}`);
  refs.filter((ref) => !evidenceIds.has(ref)).forEach((ref) => report.records_with_missing_evidence_refs.push(`incident:${id}:${ref}`));
}

for (const [kind, files] of Object.entries({ countries: yamlFiles.countries, entities: yamlFiles.entities, campaigns: yamlFiles.campaigns })) {
  for (const filePath of files) {
    const record = readYaml(filePath);
    const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
    if (hasPlaceholder(record)) report.records_with_placeholder_text.push(`${kind}:${id}`);
    evidenceRefs(record).filter((ref) => !evidenceIds.has(ref)).forEach((ref) => report.records_with_missing_evidence_refs.push(`${kind}:${id}:${ref}`));
  }
}

console.log(JSON.stringify(report, null, 2));
