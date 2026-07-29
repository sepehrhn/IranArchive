import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const victimsDir = path.join(rootDir, 'data', 'victims');
const provincesPath = path.join(rootDir, 'data', 'provinces.json');
const faLocalePath = path.join(rootDir, 'i18n', 'locales', 'fa.json');

const writeChanges = process.argv.includes('--write');
const supabaseUrl = process.env.external_source_SUPABASE_URL;
const supabaseAnonKey = process.env.external_source_SUPABASE_ANON_KEY;
const external_sourceHeroesUrl = 'https://external_source.org/fa/heroes';
const pageSize = 1000;
let uniqueRemoteSourceReferences = new Set();
const invalidRemoteNameSamples = [];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Set external_source_SUPABASE_URL and external_source_SUPABASE_ANON_KEY before running this sync.'
  );
  process.exit(1);
}

const publicFilter =
  'status=eq.verified&approval_status=eq.finally_approved&or=(is_soft_deleted.is.null,is_soft_deleted.eq.false)';

const selects = {
  javidnaman: [
    'id',
    'first_name',
    'last_name',
    'full_name',
    'first_name_en',
    'first_name_fa',
    'last_name_en',
    'last_name_fa',
    'full_name_en',
    'full_name_fa',
    'father_name_en',
    'father_name_fa',
    'date_of_birth_gregorian',
    'date_of_death_gregorian',
    'place_of_death_en',
    'place_of_death_fa',
    'cause_of_death_en',
    'cause_of_death_fa',
    'age_at_death',
    'province_en',
    'province_fa',
    'city_en',
    'city_fa',
    'country_en',
    'country_fa',
    'gender',
    'source_post_url',
    'source_caption',
    'source_platform',
    'source_reference',
    'record_source_connector',
    'details',
    'extra_information',
    'notes',
    'dod_source_url',
    'dod_sources',
    'updated_at'
  ].join(','),
  detainees: [
    'id',
    'first_name',
    'last_name',
    'full_name',
    'first_name_en',
    'first_name_fa',
    'last_name_en',
    'last_name_fa',
    'full_name_en',
    'full_name_fa',
    'arrest_date_gregorian',
    'place_of_arrest_en',
    'place_of_arrest_fa',
    'arresting_authority_en',
    'arresting_authority_fa',
    'province_en',
    'province_fa',
    'city_en',
    'city_fa',
    'country_en',
    'country_fa',
    'risk_of_execution',
    'age_at_arrest',
    'gender',
    'source_post_url',
    'source_caption',
    'source_reference',
    'record_source_connector',
    'outcome_status',
    'outcome_date',
    'outcome_note',
    'case_context',
    'charges',
    'detention_or_execution_location',
    'notes',
    'updated_at'
  ].join(',')
};

const headers = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  Prefer: 'count=exact'
};

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasPersian(value) {
  return /[\u0600-\u06ff]/u.test(asString(value));
}

function hasLatin(value) {
  return /[a-z]/iu.test(asString(value));
}

function normalizeText(value) {
  return asString(value)
    .normalize('NFKC')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/gu, '')
    .replace(/[يى]/gu, 'ی')
    .replace(/ك/gu, 'ک')
    .replace(/[ةۀ]/gu, 'ه')
    .replace(/[أإٱآ]/gu, 'ا')
    .replace(/ؤ/gu, 'و')
    .replace(/ئ/gu, 'ی')
    .replace(/[\u064b-\u065f\u0670]/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function normalizeDate(value) {
  const match = asString(value).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/u);
  if (!match) return '';
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function normalizeGender(value) {
  const gender = normalizeText(value);
  if (['male', 'man', 'مرد'].includes(gender)) return 'Male';
  if (['female', 'woman', 'زن'].includes(gender)) return 'Female';
  return '';
}

function isHttpUrl(value) {
  return /^https?:\/\/\S+$/iu.test(asString(value));
}

function uniqueStrings(values) {
  return [...new Set(values.map(asString).filter(Boolean))];
}

function nameParts(row, language) {
  const first = asString(row[`first_name_${language}`]);
  const last = asString(row[`last_name_${language}`]);
  return [first, last].filter(Boolean).join(' ').trim();
}

const dateOfBirthNameArtifact =
  /(?:\s*[–—-]\s*)?(?:date\s+of\s+birth|birth\s+date|تاریخ\s*تولد|دیت\s*(?:آو|آف)\s*برث).*$/iu;
const unknownNameQualifier =
  /\(\s*(?:first\s+name\s+unknown|last\s+name\s+unknown|surname\s+unknown|نام\s+کوچک\s+نامشخص|نام\s+خانوادگی\s+نامشخص|نام\s+نامشخص)\s*\)/giu;

function cleanNameCandidate(value, language) {
  let candidate = asString(value)
    .normalize('NFKC')
    .replace(/\r?\n/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  if (!candidate) return '';

  const englishUnknownSurname = candidate.match(
    /^last\s+name\s+([^,()]+),\s*son\s+of\b/iu
  );
  if (englishUnknownSurname) candidate = englishUnknownSurname[1];
  const persianUnknownSurname = candidate.match(
    /^نام\s+خانوادگی\s+([^،()]+)،\s*پسر\b/u
  );
  if (persianUnknownSurname) candidate = persianUnknownSurname[1];

  candidate = candidate
    .replace(dateOfBirthNameArtifact, '')
    .replace(/\s*向\s*,?\s*key\s*:.*$/iu, '')
    .replace(/\s*<bos>\s*$/iu, '')
    .replace(/\s+\b(?:base|spinning|death|house)\b\s*$/iu, '')
    .replace(/^(?:an|ان)\s*:\s*/iu, '')
    .replace(
      /\s*\((?:in\s+news\s+agencies\b[^)]*|در\s+خبرگزاری(?:‌|\s)*ها\b[^)]*|arrested\s+along\b[^)]*|بازداشت\s+شده\s+به\s+همراه\b[^)]*)\)\s*$/iu,
      ''
    )
    .replace(unknownNameQualifier, ' ')
    .replace(/^\s*\(?\s*first\s+name\s+unknown\s*\)?\s*/iu, '')
    .replace(/\s+/gu, ' ')
    .replace(/^[,،;؛:\s]+|[,،;؛:\s]+$/gu, '')
    .trim();

  if (language === 'fa' && hasLatin(candidate)) return '';
  return candidate;
}

function isPlausibleIndividualName(value) {
  const candidate = asString(value);
  if (!candidate || candidate.length > 100 || /\r|\n/u.test(candidate)) return false;
  if (dateOfBirthNameArtifact.test(candidate) || /\d/u.test(candidate)) return false;

  const words = candidate.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length > 8) return false;

  const withoutEllipses = candidate.replace(/\.{2,}/gu, '');
  const groupSeparators =
    (withoutEllipses.match(/[,،;؛]/gu) || []).length +
    (withoutEllipses.match(/\.(?=\p{L})/gu) || []).length;
  if (groupSeparators >= 2) return false;

  if (
    /\b(?:va\s+baradarash|baradarzadeh|nirouhaye\s+amniati|hokumat\s+raboudeh|dar\s+hal\s+kharid|gerogan\s+gerefte|nemitonam\s+begam)\b/iu.test(
      candidate
    )
  ) {
    return false;
  }
  if (
    /(?:نیروهای\s+امنیتی|حکومت\s+ربوده|در\s+حال\s+خرید|برادرش|برادرزاده|گروگان\s+گرفته|نمیتونم\s+بگم)/u.test(
      candidate
    )
  ) {
    return false;
  }
  return true;
}

function captionNameCandidates(row) {
  const caption = asString(row.source_caption) || asString(row.details);
  if (!caption) return { english: '', persian: '' };

  const persianMatch = caption.match(
    /جا(?:‌|\s)*ویدنام\s*[:：]\s*([^\n.؛]+)/u
  );
  const englishMatch = caption.match(
    /(?:^|\n)\s*([A-Z][A-Za-z'’ -]+(?:\s*\([A-Za-z'’ -]+\))?)\s*,\s*(?:\n|$)/m
  );
  return {
    english: englishMatch ? englishMatch[1] : '',
    persian: persianMatch ? persianMatch[1] : ''
  };
}

function firstUsableName(candidates, language) {
  for (const value of candidates) {
    const candidate = cleanNameCandidate(value, language);
    if (isPlausibleIndividualName(candidate)) return candidate;
  }
  return '';
}

function remoteNames(row) {
  const captionNames = captionNameCandidates(row);
  const englishCandidates = [
    row.full_name_en,
    nameParts(row, 'en'),
    hasLatin(row.full_name) ? row.full_name : '',
    captionNames.english
  ];
  const persianCandidates = [
    row.full_name_fa,
    nameParts(row, 'fa'),
    hasPersian(row.full_name) ? row.full_name : '',
    captionNames.persian
  ];

  const english = firstUsableName(englishCandidates, 'en');
  const persian = firstUsableName(persianCandidates, 'fa');
  return {
    name: english || persian,
    persianName: persian,
    keys: uniqueStrings([english, persian].map(normalizeText)),
    englishKey: normalizeText(english),
    persianKey: normalizeText(persian)
  };
}

function localNameKeys(record) {
  return uniqueStrings([record.name, record.persian_name].map(normalizeText));
}

const provinces = JSON.parse(fs.readFileSync(provincesPath, 'utf8'));
const faLocale = JSON.parse(fs.readFileSync(faLocalePath, 'utf8'));
const provinceTranslations = faLocale.provinces || {};
const persianProvinceEntries = Object.entries(provinceTranslations)
  .map(([english, persian]) => [normalizeText(persian), english])
  .sort((a, b) => b[0].length - a[0].length);

const provinceAliases = new Map([
  ['hamedan', 'Hamadan'],
  ['hamedan province', 'Hamadan'],
  ['chaharmahal and bakhtiari', 'Chahar Mahaal and Bakhtiari'],
  ['khorasan razavi', 'Razavi Khorasan'],
  ['isfahan esfahan', 'Isfahan'],
  ['province of tehran', 'Tehran']
]);

const canonicalProvinceEntries = provinces
  .map((province) => [normalizeText(province), province])
  .sort((a, b) => b[0].length - a[0].length);

function canonicalProvince(row) {
  const persian = normalizeText(row.province_fa);
  for (const [needle, province] of persianProvinceEntries) {
    if (persian === needle || persian.includes(needle)) return province;
  }

  const english = normalizeText(row.province_en);
  if (provinceAliases.has(english)) return provinceAliases.get(english);
  for (const [needle, province] of canonicalProvinceEntries) {
    if (english === needle || english.startsWith(`${needle} `)) return province;
  }
  return '';
}

const suspiciousLocation =
  /\b(province|provincial|death|savage|suicide|custody|suspension|constellations|corridors|paginated|dropdown|monarchy|greenland|migration|orientation|pentagram|pentax|panorama|shards|proper|luxury|scan|spinning|theory)\b|[\u3400-\u9fff]|(\b\w+\b)(?:\s+\2){2,}/iu;

function cleanLocationValue(englishValue, persianValue) {
  const english = asString(englishValue);
  if (
    english &&
    english.length <= 100 &&
    hasLatin(english) &&
    !suspiciousLocation.test(english) &&
    !/\bunidentified\b/iu.test(english)
  ) {
    return english;
  }

  const persian = asString(persianValue);
  if (
    persian &&
    persian.length <= 100 &&
    hasPersian(persian) &&
    !/(نامشخص|نامعلوم|شناسایی نشده)/u.test(persian)
  ) {
    return persian;
  }
  return '';
}

function cleanNarrative(value) {
  if (typeof value === 'string') {
    return value
      .replace(/[ \t]+$/gmu, '')
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(cleanNarrative).filter(Boolean).join('\n');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => {
        const text = cleanNarrative(item);
        return text ? `${key}: ${text}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function remoteSourceUrls(row) {
  const urls = [];
  if (isHttpUrl(row.source_post_url)) urls.push(row.source_post_url);
  if (isHttpUrl(row.dod_source_url)) urls.push(row.dod_source_url);
  if (Array.isArray(row.dod_sources)) {
    for (const source of row.dod_sources) {
      if (source && isHttpUrl(source.url)) urls.push(source.url);
    }
  }
  urls.push(external_sourceHeroesUrl);
  return uniqueStrings(urls);
}

function buildDescription(remote) {
  const caption = cleanNarrative(remote.raw.source_caption);
  if (caption) return caption;

  const location = [remote.city, remote.province].filter(Boolean).join(', ');
  if (remote.status === 'Killed') {
    const details = [
      remote.date ? `on ${remote.date}` : '',
      location ? `in ${location}` : ''
    ].filter(Boolean);
    return `external_source lists ${remote.name} among those killed${details.length ? ` ${details.join(' ')}` : ''}.`;
  }

  const qualifier = remote.riskOfExecution ? ' and at risk of execution' : '';
  const details = [
    remote.date ? `on ${remote.date}` : '',
    location ? `in ${location}` : ''
  ].filter(Boolean);
  return `external_source lists ${remote.name} as detained${qualifier}${details.length ? ` ${details.join(' ')}` : ''}.`;
}

function buildRemoteRecord(row, table) {
  const names = remoteNames(row);
  if (!names.name || names.keys.length === 0) {
    if (invalidRemoteNameSamples.length < 20) {
      invalidRemoteNameSamples.push({
        id: row.id,
        table,
        full_name_en: asString(row.full_name_en),
        full_name_fa: asString(row.full_name_fa),
        full_name: asString(row.full_name)
      });
    }
    return null;
  }

  const executed = table === 'detainees' && row.outcome_status === 'executed';
  const status = table === 'javidnaman' || executed ? 'Killed' : 'Missing';
  const date =
    table === 'javidnaman'
      ? normalizeDate(row.date_of_death_gregorian)
      : executed
        ? normalizeDate(row.outcome_date) || normalizeDate(row.arrest_date_gregorian)
        : normalizeDate(row.arrest_date_gregorian);
  const age =
    table === 'javidnaman'
      ? Number.isInteger(row.age_at_death)
        ? row.age_at_death
        : null
      : Number.isInteger(row.age_at_arrest)
        ? row.age_at_arrest
        : null;
  const province = canonicalProvince(row);
  const city = cleanLocationValue(row.city_en, row.city_fa);
  const place =
    table === 'javidnaman'
      ? cleanLocationValue(row.place_of_death_en, row.place_of_death_fa)
      : cleanLocationValue(row.place_of_arrest_en, row.place_of_arrest_fa);
  const cause =
    table === 'javidnaman'
      ? cleanLocationValue(row.cause_of_death_en, row.cause_of_death_fa)
      : '';
  const arrestingAuthority =
    table === 'detainees'
      ? cleanLocationValue(row.arresting_authority_en, row.arresting_authority_fa)
      : '';
  const category =
    table === 'javidnaman'
      ? 'javidnaman'
      : row.risk_of_execution && !executed
        ? 'at-risk'
        : 'detainees';

  const remote = {
    raw: row,
    table,
    id: row.id,
    category,
    status,
    name: names.name,
    persianName: names.persianName,
    nameKeys: names.keys,
    englishKey: names.englishKey,
    persianKey: names.persianKey,
    date,
    age,
    province,
    city,
    place,
    cause,
    gender: normalizeGender(row.gender),
    arrestingAuthority,
    riskOfExecution: Boolean(row.risk_of_execution && !executed),
    sourceReference: asString(row.source_reference),
    sourceUrls: remoteSourceUrls(row),
    updatedAt: asString(row.updated_at)
  };
  remote.description = buildDescription(remote);
  return remote;
}

function toVictimYaml(remote) {
  const detentionContext = [
    remote.place ? `Place of arrest: ${remote.place}` : '',
    remote.arrestingAuthority ? `Arresting authority: ${remote.arrestingAuthority}` : ''
  ].filter(Boolean);

  const record = {
    external_source_ids: [remote.id],
    external_source_categories: [remote.category],
    photo: [],
    name: remote.name,
    persian_name: remote.persianName,
    birth_date:
      remote.table === 'javidnaman'
        ? normalizeDate(remote.raw.date_of_birth_gregorian)
        : '',
    birth_province: '',
    birth_city: '',
    gender: remote.gender,
    age: remote.age,
    occupation: '',
    country: 'Iran',
    incident_province: remote.province,
    incident_city: remote.city || remote.place,
    incident_address: remote.place && remote.place !== remote.city ? remote.place : '',
    date_of_death: remote.date,
    date_of_death_precision: remote.date ? 'Exact' : 'Approximate',
    cause_of_death: remote.cause,
    disappearance_circumstances:
      remote.status === 'Missing'
        ? detentionContext.join('. ') || 'Reported detained'
        : '',
    suspected_actor: '',
    status: remote.status,
    description: remote.description,
    source_type: 'Human Rights Archive',
    source: remote.sourceUrls,
    external_source_updated_at: remote.updatedAt
  };

  if (remote.table === 'detainees') {
    record.detention_status = remote.raw.outcome_status || 'detained';
    record.risk_of_execution = remote.riskOfExecution;
    const charges = cleanNarrative(remote.raw.charges);
    const caseContext = cleanNarrative(remote.raw.case_context);
    const outcomeNote = cleanNarrative(remote.raw.outcome_note);
    const detentionLocation = cleanNarrative(remote.raw.detention_or_execution_location);
    const notes = [
      charges ? `Charges: ${charges}` : '',
      caseContext ? `Case context: ${caseContext}` : '',
      outcomeNote ? `Outcome: ${outcomeNote}` : '',
      detentionLocation ? `Detention or execution location: ${detentionLocation}` : ''
    ].filter(Boolean);
    if (notes.length) record.notes = notes.join('\n\n');
  }

  return record;
}

function loadLocalRecords() {
  return fs
    .readdirSync(victimsDir)
    .filter(
      (file) =>
        (file.endsWith('.yaml') || file.endsWith('.yml')) && !file.endsWith('.example')
    )
    .map((file) => {
      const filePath = path.join(victimsDir, file);
      const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
      return {
        file,
        filePath,
        data,
        originalDataJson: JSON.stringify(data),
        origin: 'existing',
        matchedRemoteIds: new Set(),
        changed: false
      };
    });
}

function indexRecord(indexes, wrapper) {
  for (const id of arrayValue(wrapper.data.external_source_ids).map(asString).filter(Boolean)) {
    indexes.byexternal_sourceId.set(id, wrapper);
  }
  for (const key of localNameKeys(wrapper.data)) {
    if (!indexes.byName.has(key)) indexes.byName.set(key, new Set());
    indexes.byName.get(key).add(wrapper);
  }
  const date = normalizeDate(wrapper.data.date_of_death);
  if (date) {
    if (!indexes.byDate.has(date)) indexes.byDate.set(date, new Set());
    indexes.byDate.get(date).add(wrapper);
  }
  const references = Array.isArray(wrapper.data.external_source_source_references)
    ? wrapper.data.external_source_source_references
    : wrapper.data.external_source_source_reference
      ? [wrapper.data.external_source_source_reference]
      : [];
  for (const reference of references.map(asString).filter(Boolean)) {
    if (uniqueRemoteSourceReferences.has(reference)) {
      indexes.bySourceReference.set(reference, wrapper);
    }
  }
}

function buildIndexes(records) {
  const indexes = {
    byexternal_sourceId: new Map(),
    byName: new Map(),
    byDate: new Map(),
    bySourceReference: new Map()
  };
  for (const record of records) indexRecord(indexes, record);
  return indexes;
}

function recordIdentity(wrapper) {
  const data = wrapper.data;
  return {
    status: asString(data.status),
    date: normalizeDate(data.date_of_death),
    age: Number.isInteger(data.age) ? data.age : null,
    province: normalizeText(data.incident_province),
    city: normalizeText(data.incident_city),
    gender: normalizeGender(data.gender),
    sourceUrls: new Set(
      (Array.isArray(data.source) ? data.source : [data.source]).filter(isHttpUrl)
    )
  };
}

function remoteIdentity(remote) {
  return {
    status: remote.status,
    date: remote.date,
    age: remote.age,
    province: normalizeText(remote.province),
    city: normalizeText(remote.city || remote.place),
    gender: remote.gender,
    sourceUrls: new Set(remote.sourceUrls)
  };
}

function exactSignals(remote, wrapper) {
  const a = remoteIdentity(remote);
  const b = recordIdentity(wrapper);
  const sourceOverlap = [...a.sourceUrls].some(
    (url) => url !== external_sourceHeroesUrl && b.sourceUrls.has(url)
  );
  return {
    date: Boolean(a.date && b.date && a.date === b.date),
    age: Boolean(a.age !== null && b.age !== null && a.age === b.age),
    province: Boolean(a.province && b.province && a.province === b.province),
    city: Boolean(a.city && b.city && a.city === b.city),
    gender: Boolean(a.gender && b.gender && a.gender === b.gender),
    source: sourceOverlap
  };
}

function conflictingSignals(remote, wrapper) {
  const a = remoteIdentity(remote);
  const b = recordIdentity(wrapper);
  return {
    date: Boolean(a.date && b.date && a.date !== b.date),
    age: Boolean(a.age !== null && b.age !== null && a.age !== b.age),
    province: Boolean(a.province && b.province && a.province !== b.province),
    city: Boolean(a.city && b.city && a.city !== b.city),
    gender: Boolean(a.gender && b.gender && a.gender !== b.gender)
  };
}

function candidateScore(remote, wrapper) {
  const data = wrapper.data;
  const keys = new Set(localNameKeys(data));
  let score = 0;
  if (remote.persianKey && keys.has(remote.persianKey)) score += 110;
  if (remote.englishKey && keys.has(remote.englishKey)) score += 90;
  const exact = exactSignals(remote, wrapper);
  const conflict = conflictingSignals(remote, wrapper);
  if (exact.source) score += 100;
  if (exact.date) score += 60;
  if (exact.city) score += 35;
  if (exact.age) score += 30;
  if (exact.province) score += 20;
  if (exact.gender) score += 10;
  if (asString(data.status) === remote.status) score += 25;
  if (conflict.date) score -= 80;
  if (conflict.city) score -= 20;
  if (conflict.age) score -= 25;
  if (conflict.province) score -= 10;
  if (conflict.gender) score -= 15;
  return { wrapper, score, exact, conflict };
}

function hasStrongIdentity(remote, wrapper) {
  const exact = exactSignals(remote, wrapper);
  if (exact.source) return true;
  if (exact.date && (exact.city || exact.province || exact.age)) return true;
  if (exact.city && exact.province && exact.age) return true;
  if (
    exact.date &&
    remote.persianKey &&
    remote.englishKey &&
    localNameKeys(wrapper.data).includes(remote.persianKey) &&
    localNameKeys(wrapper.data).includes(remote.englishKey)
  ) {
    return true;
  }
  return false;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }
  return previous[b.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

function nameSimilarity(remote, wrapper) {
  let best = 0;
  for (const remoteKey of remote.nameKeys) {
    for (const localKey of localNameKeys(wrapper.data)) {
      best = Math.max(best, similarity(remoteKey, localKey));
    }
  }
  return best;
}

function chooseMatch(remote, indexes) {
  if (indexes.byexternal_sourceId.has(remote.id)) {
    return {
      wrapper: indexes.byexternal_sourceId.get(remote.id),
      method: 'external_source_id'
    };
  }
  if (
    remote.sourceReference &&
    uniqueRemoteSourceReferences.has(remote.sourceReference) &&
    indexes.bySourceReference.has(remote.sourceReference)
  ) {
    return {
      wrapper: indexes.bySourceReference.get(remote.sourceReference),
      method: 'source_reference'
    };
  }

  const exactCandidates = new Set();
  for (const key of remote.nameKeys) {
    for (const wrapper of indexes.byName.get(key) || []) {
      if (asString(wrapper.data.status) === remote.status) exactCandidates.add(wrapper);
    }
  }

  const ranked = [...exactCandidates]
    .map((wrapper) => candidateScore(remote, wrapper))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 1) {
    const candidate = ranked[0].wrapper;
    if (candidate.matchedRemoteIds.size === 0 || hasStrongIdentity(remote, candidate)) {
      return { wrapper: candidate, method: 'exact_unique' };
    }
  } else if (ranked.length > 1) {
    const best = ranked[0];
    const second = ranked[1];
    const discriminatorCount = Object.values(best.exact).filter(Boolean).length;
    if (
      discriminatorCount > 0 &&
      best.score >= second.score + 20 &&
      (best.wrapper.matchedRemoteIds.size === 0 ||
        hasStrongIdentity(remote, best.wrapper))
    ) {
      return { wrapper: best.wrapper, method: 'exact_ranked' };
    }
  }

  if (remote.date && indexes.byDate.has(remote.date)) {
    const fuzzy = [...indexes.byDate.get(remote.date)]
      .filter((wrapper) => asString(wrapper.data.status) === remote.status)
      .map((wrapper) => ({
        wrapper,
        similarity: nameSimilarity(remote, wrapper),
        exact: exactSignals(remote, wrapper)
      }))
      .filter(
        (candidate) =>
          candidate.similarity >= 0.88 &&
          (candidate.exact.city ||
            candidate.exact.province ||
            candidate.exact.age ||
            candidate.similarity >= 0.95)
      )
      .sort((a, b) => b.similarity - a.similarity);

    if (
      fuzzy.length > 0 &&
      (fuzzy.length === 1 || fuzzy[0].similarity >= fuzzy[1].similarity + 0.05) &&
      (fuzzy[0].wrapper.matchedRemoteIds.size === 0 ||
        hasStrongIdentity(remote, fuzzy[0].wrapper))
    ) {
      return { wrapper: fuzzy[0].wrapper, method: 'fuzzy_same_date' };
    }
  }

  if (remote.status === 'Killed') {
    const transitioned = new Set();
    for (const key of remote.nameKeys) {
      for (const wrapper of indexes.byName.get(key) || []) {
        if (asString(wrapper.data.status) === 'Missing') transitioned.add(wrapper);
      }
    }
    const strongTransitions = [...transitioned]
      .filter((wrapper) => hasStrongIdentity(remote, wrapper))
      .map((wrapper) => candidateScore(remote, wrapper))
      .sort((a, b) => b.score - a.score);
    if (
      strongTransitions.length > 0 &&
      (strongTransitions.length === 1 ||
        strongTransitions[0].score >= strongTransitions[1].score + 20)
    ) {
      return { wrapper: strongTransitions[0].wrapper, method: 'status_transition' };
    }
  }

  return null;
}

function setIfMissing(target, key, value) {
  const missing =
    target[key] === undefined ||
    target[key] === null ||
    target[key] === '' ||
    (Array.isArray(target[key]) && target[key].length === 0);
  if (!missing || value === undefined || value === null || value === '') return false;
  target[key] = value;
  return true;
}

function isexternal_sourceManagedRecord(wrapper) {
  return (
    /^vic-2026-[0-9a-f]{12}\.ya?ml$/u.test(wrapper.file) &&
    arrayValue(wrapper.data.external_source_ids).length > 0
  );
}

function mergeRemote(wrapper, remote) {
  const data = wrapper.data;
  let changed = false;
  const managedRecord = isexternal_sourceManagedRecord(wrapper);
  const previousName = asString(data.name);

  const existingIds = Array.isArray(data.external_source_ids)
    ? data.external_source_ids
    : data.external_source_id
      ? [data.external_source_id]
      : [];
  const ids = uniqueStrings([...existingIds, remote.id]);
  if (JSON.stringify(ids) !== JSON.stringify(existingIds)) {
    data.external_source_ids = ids;
    delete data.external_source_id;
    changed = true;
  }

  const existingCategories = Array.isArray(data.external_source_categories)
    ? data.external_source_categories
    : [];
  const categories = uniqueStrings([...existingCategories, remote.category]);
  if (JSON.stringify(categories) !== JSON.stringify(existingCategories)) {
    data.external_source_categories = categories;
    changed = true;
  }

  const existingSources = Array.isArray(data.source)
    ? data.source
    : data.source
      ? [data.source]
      : [];
  const sources = uniqueStrings([...existingSources, ...remote.sourceUrls]);
  if (JSON.stringify(sources) !== JSON.stringify(existingSources)) {
    data.source = sources;
    changed = true;
  }

  if (managedRecord && data.name !== remote.name) {
    data.name = remote.name;
    changed = true;
  }
  if (managedRecord && asString(data.persian_name) !== remote.persianName) {
    data.persian_name = remote.persianName;
    changed = true;
  } else {
    changed = setIfMissing(data, 'persian_name', remote.persianName) || changed;
  }
  changed = setIfMissing(data, 'gender', remote.gender) || changed;
  changed = setIfMissing(data, 'age', remote.age) || changed;
  changed = setIfMissing(data, 'country', 'Iran') || changed;
  changed = setIfMissing(data, 'incident_province', remote.province) || changed;
  changed =
    setIfMissing(data, 'incident_city', remote.city || remote.place) || changed;
  changed =
    setIfMissing(
      data,
      'incident_address',
      remote.place && remote.place !== remote.city ? remote.place : ''
    ) || changed;
  changed = setIfMissing(data, 'date_of_death', remote.date) || changed;
  changed =
    setIfMissing(
      data,
      'date_of_death_precision',
      remote.date ? 'Exact' : 'Approximate'
    ) || changed;
  changed = setIfMissing(data, 'cause_of_death', remote.cause) || changed;
  if (
    managedRecord &&
    asString(data.description).startsWith(`external_source lists ${previousName}`) &&
    data.description !== remote.description
  ) {
    data.description = remote.description;
    changed = true;
  } else {
    changed = setIfMissing(data, 'description', remote.description) || changed;
  }
  changed = setIfMissing(data, 'source_type', 'Human Rights Archive') || changed;
  if (remote.status === 'Killed' && data.status === 'Missing') {
    data.status = 'Killed';
    changed = true;
  }

  if (remote.table === 'detainees') {
    changed =
      setIfMissing(
        data,
        'disappearance_circumstances',
        [
          remote.place ? `Place of arrest: ${remote.place}` : '',
          remote.arrestingAuthority
            ? `Arresting authority: ${remote.arrestingAuthority}`
            : ''
        ]
          .filter(Boolean)
          .join('. ') || 'Reported detained'
      ) || changed;
    changed =
      setIfMissing(
        data,
        'detention_status',
        remote.raw.outcome_status || 'detained'
      ) || changed;
    if (remote.riskOfExecution && data.risk_of_execution !== true) {
      data.risk_of_execution = true;
      changed = true;
    }
  }

  const currentexternal_sourceUpdatedAt = asString(data.external_source_updated_at);
  if (
    remote.updatedAt &&
    (!currentexternal_sourceUpdatedAt ||
      Date.parse(remote.updatedAt) > Date.parse(currentexternal_sourceUpdatedAt))
  ) {
    data.external_source_updated_at = remote.updatedAt;
    changed = true;
  }
  if (remote.sourceReference) {
    const existingReferences = Array.isArray(data.external_source_source_references)
      ? data.external_source_source_references
      : data.external_source_source_reference
        ? [data.external_source_source_reference]
        : [];
    const references = uniqueStrings([
      ...existingReferences,
      remote.sourceReference
    ]);
    if (JSON.stringify(references) !== JSON.stringify(existingReferences)) {
      data.external_source_source_references = references;
      delete data.external_source_source_reference;
      changed = true;
    }
  }

  wrapper.matchedRemoteIds.add(remote.id);
  wrapper.changed = wrapper.changed || changed;
  return changed;
}

function newVictimId(remote, usedFiles) {
  const digest = crypto
    .createHash('sha256')
    .update(`external_source:${remote.table}:${remote.id}`)
    .digest('hex');
  for (let length = 12; length <= digest.length; length += 2) {
    const file = `vic-2026-${digest.slice(0, length)}.yaml`;
    if (!usedFiles.has(file)) return file;
  }
  throw new Error(`Unable to allocate a unique victim ID for external_source ${remote.id}`);
}

function likelyDuplicateKey(record) {
  const names = localNameKeys(record);
  const persian = names.find(hasPersian);
  const name = persian || names[0] || '';
  const date = normalizeDate(record.date_of_death);
  const age = Number.isInteger(record.age) ? String(record.age) : '';
  const city = normalizeText(record.incident_city);
  const province = normalizeText(record.incident_province);
  const gender = normalizeGender(record.gender);
  const hasEnoughIdentity =
    (date && (age || city || province)) ||
    (city && province) ||
    (age && city) ||
    (city && gender);
  if (!name || !hasEnoughIdentity) return '';
  return [asString(record.status), name, date, age, city, province, gender].join(
    '|'
  );
}

function arrayValue(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function duplicatePrimaryScore(wrapper) {
  const data = wrapper.data;
  const numericSuffix = wrapper.file.match(/^vic-\d{4}-(\d+)\.ya?ml$/u)?.[1];
  const canonicalNumericBonus =
    numericSuffix && numericSuffix.length <= 6 ? 5000 : 0;
  const populatedFields = Object.values(data).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;
  return (
    (wrapper.origin === 'existing' ? 10000 : 0) +
    canonicalNumericBonus +
    arrayValue(data.source).length * 20 +
    arrayValue(data.photo).length * 10 +
    populatedFields * 5 +
    asString(data.description).length / 100
  );
}

function mergeDuplicateData(primary, duplicate) {
  let changed = false;
  const target = primary.data;
  const source = duplicate.data;

  for (const key of [
    'photo',
    'source',
    'incident_ids',
    'external_source_ids',
    'external_source_categories',
    'external_source_source_references'
  ]) {
    const before = arrayValue(target[key]);
    const merged = uniqueStrings([...before, ...arrayValue(source[key])]);
    if (JSON.stringify(merged) !== JSON.stringify(before)) {
      target[key] = merged;
      changed = true;
    }
  }

  const externalIds = uniqueStrings([
    ...arrayValue(target.external_card_ids),
    target.external_card_id,
    ...arrayValue(source.external_card_ids),
    source.external_card_id
  ]);
  if (externalIds.length > 1) {
    target.external_card_ids = externalIds;
    changed = true;
  }

  for (const [key, value] of Object.entries(source)) {
    if (
      [
        'photo',
        'source',
        'incident_ids',
        'external_source_ids',
        'external_source_categories',
        'external_source_source_references',
        'external_card_id',
        'external_card_ids',
        'description',
        'notes'
      ].includes(key)
    ) {
      continue;
    }
    changed = setIfMissing(target, key, value) || changed;
  }

  for (const key of ['description', 'notes']) {
    const current = asString(target[key]);
    const candidate = asString(source[key]);
    if (candidate.length > current.length) {
      target[key] = candidate;
      changed = true;
    }
  }

  primary.changed = primary.changed || changed;
  duplicate.deleted = true;
  duplicate.duplicateOf = primary.file;
}

function consolidateStrongDuplicates(records) {
  const groups = new Map();
  for (const wrapper of records) {
    const key = likelyDuplicateKey(wrapper.data);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(wrapper);
  }

  const merged = [];
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    group.sort(
      (a, b) =>
        duplicatePrimaryScore(b) - duplicatePrimaryScore(a) ||
        a.file.localeCompare(b.file)
    );
    const primary = group[0];
    for (const duplicate of group.slice(1)) {
      mergeDuplicateData(primary, duplicate);
      merged.push({
        key,
        primary: primary.file,
        removed: duplicate.file
      });
    }
  }
  return merged;
}

function listYamlFilesRecursive(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) listYamlFilesRecursive(fullPath, out);
    else if (
      (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) &&
      !entry.name.endsWith('.example')
    ) {
      out.push(fullPath);
    }
  }
  return out;
}

function rewriteIncidentVictimIds(merges) {
  const replacements = new Map(
    merges.map(({ primary, removed }) => [
      removed.replace(/\.(yaml|yml)$/iu, ''),
      primary.replace(/\.(yaml|yml)$/iu, '')
    ])
  );
  const changes = [];
  if (replacements.size === 0) return changes;

  for (const filePath of listYamlFilesRecursive(path.join(rootDir, 'data', 'incidents'))) {
    const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
    if (!data || !Array.isArray(data.victims)) continue;
    const replaced = uniqueStrings(
      data.victims.map((victimId) => replacements.get(victimId) || victimId)
    );
    if (JSON.stringify(replaced) === JSON.stringify(data.victims)) continue;
    data.victims = replaced;
    changes.push({ filePath, data });
  }
  return changes;
}

async function fetchTable(table) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const query = new URLSearchParams({
      select: selects[table],
      order: 'id.asc',
      limit: String(pageSize),
      offset: String(offset)
    });
    const url = `${supabaseUrl}/rest/v1/${table}?${query}&${publicFilter}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `${table} request failed (${response.status}): ${await response.text()}`
      );
    }
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function dumpYaml(data) {
  return yaml.dump(data, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
    sortKeys: false
  });
}

const localRecords = loadLocalRecords();
const initialCount = localRecords.length;
const initialDuplicateMerges = consolidateStrongDuplicates(localRecords);
const indexes = buildIndexes(
  localRecords.filter((record) => !record.deleted)
);
const usedFiles = new Set(localRecords.map((record) => record.file));
console.log('Fetching verified external_source fallen and detainee records...');
const [javidRows, detaineeRows] = await Promise.all([
  fetchTable('javidnaman'),
  fetchTable('detainees')
]);

const remotes = [
  ...javidRows.map((row) => buildRemoteRecord(row, 'javidnaman')),
  ...detaineeRows.map((row) => buildRemoteRecord(row, 'detainees'))
].filter(Boolean);
const validRemoteIds = new Set(remotes.map((remote) => remote.id));

const sourceReferenceCounts = new Map();
for (const remote of remotes) {
  if (!remote.sourceReference) continue;
  sourceReferenceCounts.set(
    remote.sourceReference,
    (sourceReferenceCounts.get(remote.sourceReference) || 0) + 1
  );
}
uniqueRemoteSourceReferences = new Set(
  [...sourceReferenceCounts.entries()]
    .filter(([, count]) => count === 1)
    .map(([reference]) => reference)
);
for (const wrapper of localRecords.filter((record) => !record.deleted)) {
  indexRecord(indexes, wrapper);
}

remotes.sort((a, b) => {
  const completeness = (record) =>
    [
      record.persianName,
      record.date,
      record.age,
      record.province,
      record.city,
      record.sourceReference,
      ...record.sourceUrls.filter((url) => url !== external_sourceHeroesUrl)
    ].filter(Boolean).length;
  return completeness(b) - completeness(a) || a.id.localeCompare(b.id);
});

let matched = 0;
let created = 0;
const updatedFiles = new Set();
const matchMethods = {};
const matchSamples = {};
const matchedExistingFiles = new Set();
const matchedexternal_sourceFiles = new Set();

for (const remote of remotes) {
  const match = chooseMatch(remote, indexes);
  let wrapper = match?.wrapper || null;
  if (wrapper) {
    matched += 1;
    matchMethods[match.method] = (matchMethods[match.method] || 0) + 1;
    if (
      ['exact_ranked', 'fuzzy_same_date', 'status_transition'].includes(
        match.method
      )
    ) {
      if (!matchSamples[match.method]) matchSamples[match.method] = [];
      if (matchSamples[match.method].length < 8) {
        matchSamples[match.method].push({
          remote_id: remote.id,
          remote_name: remote.name,
          remote_persian_name: remote.persianName,
          remote_status: remote.status,
          remote_date: remote.date,
          remote_city: remote.city,
          local_file: wrapper.file,
          local_name: wrapper.data.name,
          local_persian_name: wrapper.data.persian_name,
          local_status: wrapper.data.status,
          local_date: wrapper.data.date_of_death,
          local_city: wrapper.data.incident_city,
          name_similarity: Number(nameSimilarity(remote, wrapper).toFixed(3)),
          exact_signals: exactSignals(remote, wrapper)
        });
      }
    }
    if (wrapper.origin === 'existing') matchedExistingFiles.add(wrapper.file);
    else matchedexternal_sourceFiles.add(wrapper.file);
    if (mergeRemote(wrapper, remote)) updatedFiles.add(wrapper.file);
    continue;
  }

  const file = newVictimId(remote, usedFiles);
  const data = toVictimYaml(remote);
  wrapper = {
    file,
    filePath: path.join(victimsDir, file),
    data,
    origin: 'external_source',
    matchedRemoteIds: new Set([remote.id]),
    changed: true
  };
  if (remote.sourceReference) {
    data.external_source_source_references = [remote.sourceReference];
  }
  localRecords.push(wrapper);
  usedFiles.add(file);
  indexRecord(indexes, wrapper);
  created += 1;
}

let invalidManagedRecordsRemoved = 0;
for (const wrapper of localRecords) {
  if (wrapper.deleted || !isexternal_sourceManagedRecord(wrapper)) continue;
  const ids = arrayValue(wrapper.data.external_source_ids).map(asString).filter(Boolean);
  if (ids.some((id) => validRemoteIds.has(id))) continue;
  if (isPlausibleIndividualName(wrapper.data.name)) continue;
  wrapper.deleted = true;
  wrapper.deleteReason = 'external_source source row has no usable individual name';
  invalidManagedRecordsRemoved += 1;
}

const finalDuplicateMerges = consolidateStrongDuplicates(
  localRecords.filter((record) => !record.deleted)
);
const duplicateMerges = [
  ...initialDuplicateMerges,
  ...finalDuplicateMerges
];
const activeRecords = localRecords.filter((record) => !record.deleted);
const incidentChanges = rewriteIncidentVictimIds(duplicateMerges);

const idOwners = new Map();
const duplicateexternal_sourceIds = [];
for (const wrapper of activeRecords) {
  const ids = Array.isArray(wrapper.data.external_source_ids)
    ? wrapper.data.external_source_ids
    : [];
  for (const id of ids) {
    if (idOwners.has(id) && idOwners.get(id) !== wrapper.file) {
      duplicateexternal_sourceIds.push([id, idOwners.get(id), wrapper.file]);
    } else {
      idOwners.set(id, wrapper.file);
    }
  }
}

if (duplicateexternal_sourceIds.length > 0) {
  console.error('external_source IDs assigned to more than one victim record:');
  console.error(duplicateexternal_sourceIds.slice(0, 20));
  process.exit(1);
}

const afterDuplicateKeyFiles = new Map();
for (const wrapper of activeRecords) {
  const key = likelyDuplicateKey(wrapper.data);
  if (!key) continue;
  if (!afterDuplicateKeyFiles.has(key)) afterDuplicateKeyFiles.set(key, []);
  afterDuplicateKeyFiles.get(key).push(wrapper.file);
}
const remainingLikelyDuplicates = [...afterDuplicateKeyFiles.entries()].filter(
  ([, files]) => files.length > 1
);

if (remainingLikelyDuplicates.length > 0) {
  console.error('Strong duplicate identity fingerprints remain after consolidation:');
  console.error(remainingLikelyDuplicates.slice(0, 20));
  process.exit(1);
}

const changedRecords = activeRecords.filter(
  (record) =>
    record.origin === 'external_source' ||
    JSON.stringify(record.data) !== record.originalDataJson
);
if (writeChanges) {
  for (const wrapper of changedRecords) {
    fs.writeFileSync(wrapper.filePath, dumpYaml(wrapper.data), 'utf8');
  }
  for (const wrapper of localRecords.filter((record) => record.deleted)) {
    if (fs.existsSync(wrapper.filePath)) fs.unlinkSync(wrapper.filePath);
  }
  for (const incident of incidentChanges) {
    fs.writeFileSync(incident.filePath, dumpYaml(incident.data), 'utf8');
  }
}

const summary = {
  mode: writeChanges ? 'write' : 'dry-run',
  local_before: initialCount,
  external_source: {
    javidnaman: javidRows.length,
    detainees: detaineeRows.length,
    at_risk: detaineeRows.filter(
      (row) => row.risk_of_execution === true && row.outcome_status !== 'executed'
    ).length,
    executed_detainees: detaineeRows.filter(
      (row) => row.outcome_status === 'executed'
    ).length,
    skipped_without_name: javidRows.length + detaineeRows.length - remotes.length,
    skipped_name_samples: invalidRemoteNameSamples,
    unique_source_references: uniqueRemoteSourceReferences.size,
    repeated_source_references: [...sourceReferenceCounts.values()].filter(
      (count) => count > 1
    ).length
  },
  matched_remote_rows: matched,
  match_methods: matchMethods,
  match_samples: matchSamples,
  matched_existing_files: matchedExistingFiles.size,
  matched_new_external_source_files: matchedexternal_sourceFiles.size,
  updated_matched_files: updatedFiles.size,
  created_records_before_deduplication: created,
  retained_created_records: activeRecords.filter(
    (record) => record.origin === 'external_source'
  ).length,
  duplicate_records_consolidated: duplicateMerges.length,
  invalid_managed_records_removed: invalidManagedRecordsRemoved,
  duplicate_consolidation_samples: duplicateMerges.slice(0, 20),
  incident_files_relinked: incidentChanges.length,
  changed_files: changedRecords.length,
  changed_file_samples: changedRecords.slice(0, 30).map((record) => record.file),
  deleted_duplicate_files: localRecords.filter((record) => record.deleted).length,
  local_after: activeRecords.length,
  unique_external_source_ids: idOwners.size,
  duplicate_external_source_ids: duplicateexternal_sourceIds.length,
  remaining_likely_duplicate_fingerprints: remainingLikelyDuplicates.length,
  records_with_multiple_external_source_ids: activeRecords.filter(
    (record) =>
      Array.isArray(record.data.external_source_ids) && record.data.external_source_ids.length > 1
  ).length,
  maximum_external_source_ids_on_one_record: Math.max(
    0,
    ...activeRecords.map((record) =>
      Array.isArray(record.data.external_source_ids) ? record.data.external_source_ids.length : 0
    )
  ),
  largest_external_source_id_groups: activeRecords
    .filter(
      (record) =>
        Array.isArray(record.data.external_source_ids) &&
        record.data.external_source_ids.length > 1
    )
    .sort((a, b) => b.data.external_source_ids.length - a.data.external_source_ids.length)
    .slice(0, 10)
    .map((record) => ({
      file: record.file,
      name: record.data.name,
      persian_name: record.data.persian_name,
      count: record.data.external_source_ids.length
    }))
};

console.log(JSON.stringify(summary, null, 2));
