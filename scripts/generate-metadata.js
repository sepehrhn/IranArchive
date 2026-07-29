
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const EVIDENCE_DIR = path.join(DATA_DIR, 'evidences');
const OUTPUT_FILE = path.join(DATA_DIR, 'generated', 'evidence-metadata.json');

// Map of extension to mime type (incomplete, but covers basics)
const MIME_TYPES = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg'
};

function getFileStats(filePath) {
    const buffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(buffer);
    const sha256 = hashSum.digest('hex');
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return {
        sha256,
        file_size_bytes: stats.size,
        format: ext.replace('.', ''),
        mime_type: MIME_TYPES[ext] || 'application/octet-stream',
        // Duration and verification of re-encoding would require ffmpeg, skipping for now
        // reencoded: false 
    };
}

function scanDirectory(dir, relativePath = '') {
    let results = {};
    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item).replace(/\\/g, '/'); // Force forward slashes

        if (fs.statSync(fullPath).isDirectory()) {
            Object.assign(results, scanDirectory(fullPath, relPath));
        } else {
            // Only process known types if needed, or all files
            console.log(`Processing ${relPath}...`);
            try {
                results[relPath] = getFileStats(fullPath);
            } catch (e) {
                console.error(`Error processing ${relPath}:`, e);
            }
        }
    }
    return results;
}

console.log('Generating metadata...');
const metadata = scanDirectory(EVIDENCE_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
console.log(`Metadata written to ${OUTPUT_FILE}`);
