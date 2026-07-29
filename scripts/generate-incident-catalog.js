import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const victimsDir = path.join(rootDir, 'data', 'victims');
const batchPath = path.join(rootDir, 'data', 'incident-batches', '2026-verified-incidents.json');
const generatedRoot = path.join(rootDir, 'data', 'incidents', 'generated');
const maximumDir = path.join(generatedRoot, 'maximum-veracity');
const victimsOutputDir = path.join(generatedRoot, 'victim-linked');
const provinces = new Set(JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'provinces.json'), 'utf8')));

const TARGET_VICTIM_INCIDENTS = 100;
const REVIEW_DATE = '2026/07/29';
const EARLIEST_DATE = '2025-12-28';
const LATEST_DATE = '2026-07-29';

function resetDirectory(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(...values) {
  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map(cleanString)
    .filter(Boolean);
}

function validUrl(value) {
  return /^https?:\/\//i.test(value);
}

function validIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && value >= EARLIEST_DATE
    && value <= LATEST_DATE
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function unique(values) {
  return [...new Set(values)];
}

function domainOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function publisherFor(url) {
  const domain = domainOf(url);
  const known = {
    'x.com': 'X',
    'twitter.com': 'X',
    'instagram.com': 'Instagram',
    't.me': 'Telegram',
    'facebook.com': 'Facebook',
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'hengaw.net': 'Hengaw',
    'iranhr.net': 'Iran Human Rights',
    'amnesty.org': 'Amnesty International',
    'hrw.org': 'Human Rights Watch',
    'iranintl.com': 'Iran International',
    'bbc.com': 'BBC',
    'bbc.co.uk': 'BBC'
  };
  return known[domain] || domain || 'Source';
}

function yamlOptions() {
  return {
    noRefs: true,
    lineWidth: 110,
    quotingType: '"',
    forceQuotes: true,
    sortKeys: false
  };
}

function writeYaml(dir, id, data) {
  fs.writeFileSync(path.join(dir, `${id}.yaml`), yaml.dump(data, yamlOptions()), 'utf8');
}

function curatedIncident(record) {
  const sourceIds = record.sources.map((source) => source.id);
  return {
    status: 'verified',
    ratings: {
      veracity: 10,
      evidence_availability: 10
    },
    occurred_at: {
      start: record.date.replaceAll('-', '/'),
      start_time: '',
      end: '',
      end_time: '',
      timezone: 'Asia/Tehran',
      precision: record.precision || 'Exact'
    },
    location: {
      country: 'Iran',
      province: record.province,
      city: record.city,
      address: record.address || ''
    },
    incident_type: record.incident_type,
    severity: record.severity || {},
    title: record.title,
    summary: record.summary,
    narrative: record.narrative,
    key_claims: record.key_claims || [],
    open_questions: record.open_questions || [],
    limitations: record.limitations || [],
    evidence_ids: [],
    sources: record.sources,
    timeline: [{
      at: record.date.replaceAll('-', '/'),
      time: '',
      title: record.title,
      description: record.summary,
      evidence_ids: [],
      source_ids: sourceIds
    }],
    review_history: [{
      at: REVIEW_DATE,
      reviewer: 'IranArchive research review',
      change: 'created',
      to_status: 'verified',
      notes: 'Core event independently reviewed against the maximum-rating standard; source URLs and methodology retained for audit.'
    }],
    victims: record.victims || [],
    related_incidents: []
  };
}

function victimCandidate(fileName) {
  const victimId = fileName.replace(/\.ya?ml$/i, '');
  const raw = yaml.load(fs.readFileSync(path.join(victimsDir, fileName), 'utf8'));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const status = cleanString(raw.status).toLowerCase();
  if (status !== 'killed') return null;

  const name = cleanString(raw.name);
  const date = cleanString(raw.date_of_death);
  const city = cleanString(raw.incident_city || raw.city);
  if (!name || !city || !validIsoDate(date)) return null;

  const sources = unique(stringArray(
    raw.source,
    raw.sources,
    raw.source_social_media_link
  ).filter(validUrl));
  if (sources.length === 0) return null;

  const photos = unique(stringArray(raw.photo, raw.photos).filter(validUrl));
  const provinceRaw = cleanString(raw.incident_province || raw.province);
  const province = provinces.has(provinceRaw) ? provinceRaw : '';
  const precisionRaw = cleanString(raw.date_of_death_precision).toLowerCase();
  const exactDate = precisionRaw === 'exact' || precisionRaw === '';
  const sourceDomains = unique(sources.map(domainOf).filter(Boolean));
  const cause = cleanString(raw.cause_of_death);
  const actor = cleanString(raw.suspected_actor);
  const description = cleanString(raw.description);
  const age = Number.isFinite(Number(raw.age)) ? Number(raw.age) : null;

  const qualityScore =
    Math.min(sources.length, 5) * 12
    + Math.min(sourceDomains.length, 4) * 8
    + Math.min(photos.length, 3) * 5
    + (exactDate ? 8 : 0)
    + (province ? 3 : 0)
    + (cause ? 3 : 0)
    + (actor ? 3 : 0)
    + (description ? 2 : 0);

  return {
    victimId,
    name,
    date,
    city,
    province,
    sources,
    sourceDomains,
    photos,
    exactDate,
    cause,
    actor,
    description,
    age,
    qualityScore
  };
}

function sourceObjects(candidate) {
  return candidate.sources.map((url, index) => ({
    id: `src-${index + 1}`,
    label: `${publisherFor(url)} source for ${candidate.name}`,
    url,
    publisher: publisherFor(url),
    published_at: '',
    type: 'secondary',
    archived_urls: [],
    language: '',
    notes: `Source retained in IranArchive victim record ${candidate.victimId}.`
  }));
}

function victimIncident(candidate) {
  const sourceList = sourceObjects(candidate);
  const distinctSources = candidate.sourceDomains.length;
  const independentlyCorroborated = candidate.exactDate && distinctSources >= 2;
  const veracity = independentlyCorroborated ? 9 : candidate.sources.length >= 2 ? 8 : 7;
  const evidenceAvailability = Math.min(
    9,
    6
      + (candidate.sources.length >= 2 ? 1 : 0)
      + (distinctSources >= 2 ? 1 : 0)
      + (candidate.photos.length > 0 ? 1 : 0)
  );

  const locationText = candidate.province
    ? `${candidate.city}, ${candidate.province} province`
    : candidate.city;
  const details = [
    candidate.cause ? `The recorded cause of death is ${candidate.cause}.` : '',
    candidate.actor ? `The victim record identifies the suspected actor as ${candidate.actor}.` : '',
    candidate.age !== null ? `${candidate.name} was recorded as ${candidate.age} years old.` : ''
  ].filter(Boolean);

  return {
    status: independentlyCorroborated ? 'verified' : 'not_verified',
    ratings: {
      veracity,
      evidence_availability: evidenceAvailability
    },
    occurred_at: {
      start: candidate.date.replaceAll('-', '/'),
      start_time: '',
      end: '',
      end_time: '',
      timezone: 'Asia/Tehran',
      precision: candidate.exactDate ? 'Exact' : 'Approx'
    },
    location: {
      country: 'Iran',
      ...(candidate.province ? { province: candidate.province } : {}),
      city: candidate.city,
      address: ''
    },
    incident_type: 'Documented killing',
    severity: {
      deaths: { min: 1, max: 1 }
    },
    title: `Killing of ${candidate.name} in ${candidate.city}`,
    summary: `${candidate.name} is documented in IranArchive as killed on ${candidate.date} in ${locationText}; the linked victim record retains ${candidate.sources.length} source${candidate.sources.length === 1 ? '' : 's'}${candidate.photos.length ? ` and ${candidate.photos.length} image reference${candidate.photos.length === 1 ? '' : 's'}` : ''}.`,
    narrative: [
      `This incident is generated from IranArchive victim record **${candidate.victimId}**.`,
      `${candidate.name} is documented as killed on ${candidate.date} in ${locationText}.`,
      ...details,
      'The source links and any image references remain attached to the victim record and are reproduced here as source citations for incident-level discovery.'
    ].join('\n\n'),
    key_claims: [
      `${candidate.name} was killed on ${candidate.date}.`,
      `The recorded incident location is ${locationText}.`,
      `${candidate.sources.length} source link${candidate.sources.length === 1 ? '' : 's'} support the underlying victim record.`
    ],
    open_questions: independentlyCorroborated
      ? []
      : ['Can the core claim be corroborated by an additional independent source domain?'],
    limitations: [
      'This record is deterministically derived from the existing victim catalogue rather than independently re-investigated as a separate incident.',
      'Ratings are capped below 10/10; maximum ratings are reserved for manually reviewed incidents meeting the published standard.'
    ],
    evidence_ids: [],
    sources: sourceList,
    timeline: [{
      at: candidate.date.replaceAll('-', '/'),
      time: '',
      title: `Killing of ${candidate.name}`,
      description: `Victim-linked incident recorded in ${candidate.city}.`,
      evidence_ids: [],
      source_ids: sourceList.map((source) => source.id)
    }],
    review_history: [{
      at: REVIEW_DATE,
      reviewer: 'IranArchive deterministic catalogue generator',
      change: 'created',
      to_status: independentlyCorroborated ? 'verified' : 'not_verified',
      notes: `Generated from ${candidate.victimId}; selected through exact-date, named-location, and source-availability filters.`
    }],
    victims: [candidate.victimId],
    related_incidents: []
  };
}

function generateCurated() {
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  if (!Array.isArray(batch.incidents) || batch.incidents.length < 20) {
    throw new Error('The curated incident batch must contain at least 20 incidents.');
  }

  const ids = new Set();
  for (const record of batch.incidents) {
    if (!record.id || ids.has(record.id)) throw new Error(`Invalid or duplicate curated incident ID: ${record.id}`);
    if (!provinces.has(record.province)) throw new Error(`Invalid province for ${record.id}: ${record.province}`);
    if (!validIsoDate(record.date)) throw new Error(`Invalid date for ${record.id}: ${record.date}`);
    if (!Array.isArray(record.sources) || record.sources.length === 0) throw new Error(`Missing sources for ${record.id}`);
    ids.add(record.id);
    writeYaml(maximumDir, record.id, curatedIncident(record));
  }
  return [...ids];
}

function generateVictimLinked() {
  const files = fs.readdirSync(victimsDir)
    .filter((name) => /\.ya?ml$/i.test(name) && !name.endsWith('.example'));

  const candidates = files
    .map(victimCandidate)
    .filter(Boolean)
    .sort((a, b) =>
      b.qualityScore - a.qualityScore
      || b.sourceDomains.length - a.sourceDomains.length
      || b.sources.length - a.sources.length
      || a.date.localeCompare(b.date)
      || a.victimId.localeCompare(b.victimId)
    );

  const deduplicated = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = `${candidate.name.toLowerCase()}|${candidate.date}|${candidate.city.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduplicated.push(candidate);
  }

  if (deduplicated.length < TARGET_VICTIM_INCIDENTS) {
    throw new Error(`Only ${deduplicated.length} source-backed victim incidents passed filters; ${TARGET_VICTIM_INCIDENTS} required.`);
  }

  const selected = deduplicated.slice(0, TARGET_VICTIM_INCIDENTS);
  const ids = [];
  for (const candidate of selected) {
    const id = `inc-${candidate.victimId.replace(/^vic-/, 'victim-')}`;
    ids.push(id);
    writeYaml(victimsOutputDir, id, victimIncident(candidate));
  }
  return ids;
}

resetDirectory(maximumDir);
resetDirectory(victimsOutputDir);

const curatedIds = generateCurated();
const victimIds = generateVictimLinked();

const manifest = {
  generated_at: REVIEW_DATE,
  curated_maximum_rating_count: curatedIds.length,
  victim_linked_count: victimIds.length,
  total_generated_count: curatedIds.length + victimIds.length,
  curated_ids: curatedIds,
  victim_incident_ids: victimIds
};
fs.writeFileSync(
  path.join(generatedRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`Generated ${curatedIds.length} maximum-rating incidents and ${victimIds.length} victim-linked incidents.`);
