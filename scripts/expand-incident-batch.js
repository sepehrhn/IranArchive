import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const batchDir = path.join(rootDir, 'data', 'incident-batches');
const inputPath = path.join(batchDir, '2026-verified-incidents.compact.json');
const outputPath = path.join(batchDir, '2026-verified-incidents.json');

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!input.source_sets || !Array.isArray(input.incidents)) {
  throw new Error('Invalid compact incident batch.');
}

const defaultLimitations = [
  'Maximum ratings apply to the core event; underlying media remains available through the cited investigations.',
  'IranArchive has not yet mirrored every underlying video or photograph into its local evidence store.'
];

const incidents = input.incidents.map((record) => {
  const sources = input.source_sets[record.source_set];
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error(`Unknown or empty source set for ${record.id}: ${record.source_set}`);
  }

  const { source_set, ...incident } = record;
  return {
    ...incident,
    precision: 'Exact',
    narrative: incident.narrative || incident.summary,
    sources,
    limitations: incident.limitations || defaultLimitations
  };
});

fs.mkdirSync(batchDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ reviewed_at: input.reviewed_at, incidents }, null, 2)}\n`,
  'utf8'
);

console.log(`Expanded ${incidents.length} curated incident records.`);
