import { defineEventHandler } from 'h3';
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import yaml from 'js-yaml';

const ASSETS_DIR = resolve(process.cwd(), 'data/assets');

export default defineEventHandler(async (event) => {
    // 1. Scan for .yaml files
    if (!existsSync(ASSETS_DIR)) {
        return [];
    }

    const files = readdirSync(ASSETS_DIR).filter(f => f.endsWith('.yaml'));
    const assets = [];

    for (const file of files) {
        const id = file.replace('.yaml', '');
        const filePath = join(ASSETS_DIR, file);

        try {
            const content = readFileSync(filePath, 'utf-8');
            const data = yaml.load(content) as any;

            if (data && data.file) {
                // Resolve file path to get stats
                // data.file is relative to data/assets/ usually, e.g. "img/foo.jpg"
                const assetFilePath = join(ASSETS_DIR, data.file);

                let size = 'Unknown';
                let format = 'Unknown';

                if (existsSync(assetFilePath)) {
                    const stats = statSync(assetFilePath);
                    const bytes = stats.size;

                    // Format size
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    size = (i < 0) ? '0 B' : parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];

                    // Format extension
                    const ext = data.file.split('.').pop();
                    if (ext) format = ext.toUpperCase();
                }

                assets.push({
                    id,
                    type: data.type || 'poster',
                    file: data.file,
                    size,
                    format,
                    source_url: data.source_url || '',

                    countries: data.countries || [],

                });
            }
        } catch (e) {
            console.error(`Failed to process asset ${file}:`, e);
        }
    }

    // Sort by ID ascending (filename order)
    return assets.sort((a, b) => {
        const numA = parseInt(a.id.replace('asset-', '')) || 0;
        const numB = parseInt(b.id.replace('asset-', '')) || 0;
        return numA - numB;
    });
});
