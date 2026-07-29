import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const indexDir = path.join(rootDir, 'public', 'index');

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

function compact(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(' ');
  if (value && typeof value === 'object') return Object.values(value).filter(Boolean).join(' ');
  return value || '';
}

function yamlRecords(dirName, type, mapper) {
  const dir = path.join(dataDir, dirName);
  return listFilesRecursive(dir, (name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example'))
    .map((filePath) => {
      const id = path.basename(filePath).replace(/\.(yaml|yml)$/i, '');
      return mapper(readYaml(filePath), id);
    })
    .filter(Boolean);
}

const records = [
  ...yamlRecords('victims', 'victim', (record, id) => ({
    type: 'victim',
    id,
    title: record.persian_name ? `${record.name} ${record.persian_name}` : record.name,
    summary: record.description || record.cause_of_death || record.status || '',
    url: `/victims/${id}`,
    tags: [record.status, record.incident_city, record.incident_province].filter(Boolean),
    text: compact([record.name, record.persian_name, record.description, record.status, record.incident_city, record.incident_province])
  })),
  ...yamlRecords('incidents', 'incident', (record, id) => ({
    type: 'incident',
    id,
    title: record.title,
    summary: record.summary || record.incident_type || '',
    url: `/incidents/${id}`,
    tags: [record.status, record.incident_type, record.location?.city, record.location?.province].filter(Boolean),
    text: compact([record.title, record.summary, record.narrative, record.incident_type, record.location])
  })),
  ...yamlRecords('events', 'event', (record, id) => ({
    type: 'event',
    id,
    title: record.title,
    summary: record.description || record.type || '',
    url: `/events/${id}`,
    tags: [record.type, record.location?.city, record.location?.country].filter(Boolean),
    text: compact([record.title, record.description, record.type, record.location, record.organizer?.name])
  })),
  ...yamlRecords('evidences', 'evidence', (record, id) => ({
    type: 'evidence',
    id,
    title: record.title,
    summary: record.description || record.claimed_location || '',
    url: `/evidence/${id}`,
    tags: [record.type, record.claimed_location].filter(Boolean),
    text: compact([record.title, record.description, record.type, record.claimed_location])
  })),
  ...yamlRecords('countries', 'country', (record, id) => ({
    type: 'country',
    id: record.iso2 || id,
    title: record.name || id,
    summary: compact([record.region, record.subregion]),
    url: `/countries/${record.iso2 || id}`,
    tags: [record.region, record.subregion].filter(Boolean),
    text: compact([record.name, record.aliases, record.region, record.subregion, record.diplomacy?.summary, record.irgc_designation?.summary])
  })),
  ...yamlRecords('entities', 'entity', (record, id) => ({
    type: 'entity',
    id,
    title: record.names?.primary || id,
    summary: compact(record.stance?.summary),
    url: `/entities/${id.replace(/^ent-/, '')}`,
    tags: [record.type, record.entity_type, record.country?.iso2, record.stance?.label].filter(Boolean),
    text: compact([record.names, record.type, record.entity_type, record.country, record.stance])
  }))
].filter((record) => record.title);

records.sort((a, b) => `${a.type}:${a.title}`.localeCompare(`${b.type}:${b.title}`));

fs.mkdirSync(indexDir, { recursive: true });
fs.writeFileSync(path.join(indexDir, 'search.json'), JSON.stringify({
  generated_at: new Date().toISOString(),
  count: records.length,
  records
}, null, 2));

console.log(`Search index generated with ${records.length} records.`);
