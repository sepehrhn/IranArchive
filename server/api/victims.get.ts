import { defineEventHandler } from 'h3';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

const VICTIMS_DIR = resolve(process.cwd(), 'data/victims');
const INCIDENTS_DIR = resolve(process.cwd(), 'data/incidents');

type AnyRecord = Record<string, any>;

function isString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function parseYamlFile(filePath: string): AnyRecord | null {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const parsed = yaml.load(content);
        return (parsed && typeof parsed === 'object') ? (parsed as AnyRecord) : null;
    } catch (error) {
        console.error(`[victims api] Failed to parse YAML: ${filePath}`, error);
        return null;
    }
}

function listIncidentYamlFiles(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out;

    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            listIncidentYamlFiles(fullPath, out);
            continue;
        }

        const isYaml = entry.name.endsWith('.yaml') || entry.name.endsWith('.yml');
        if (isYaml && !entry.name.endsWith('.example')) {
            out.push(fullPath);
        }
    }

    return out;
}

function buildVictimIncidentMap(): Map<string, string[]> {
    const victimIncidentMap = new Map<string, string[]>();
    const incidentFiles = listIncidentYamlFiles(INCIDENTS_DIR);

    for (const incidentFile of incidentFiles) {
        const incidentData = parseYamlFile(incidentFile);
        if (!incidentData) continue;

        const incidentId = incidentFile
            .split(/[\\/]/)
            .pop()!
            .replace(/\.(yaml|yml)$/i, '');

        const victims = Array.isArray(incidentData.victims) ? incidentData.victims : [];
        for (const victimId of victims) {
            if (!isString(victimId)) continue;

            const existing = victimIncidentMap.get(victimId) || [];
            if (!existing.includes(incidentId)) {
                existing.push(incidentId);
                victimIncidentMap.set(victimId, existing);
            }
        }
    }

    return victimIncidentMap;
}

function normalizeVictim(raw: AnyRecord, id: string, victimIncidentMap: Map<string, string[]>) {
    const rawPhotos = raw.photos ?? raw.photo;
    let photos: string[] = [];

    if (Array.isArray(rawPhotos)) {
        photos = rawPhotos.filter(isString);
    } else if (isString(rawPhotos)) {
        photos = [rawPhotos];
    }

    const explicitIncidentIds = Array.isArray(raw.incident_ids)
        ? raw.incident_ids.filter(isString)
        : [];
    const mappedIncidentIds = victimIncidentMap.get(id) || [];
    const incident_ids = Array.from(new Set([...explicitIncidentIds, ...mappedIncidentIds]));

    return {
        ...raw,
        id,
        photos,
        photo: photos[0] || '/placeholder-victim.png',
        child: typeof raw.age === 'number' && raw.age <= 17,
        incident_ids
    };
}

export default defineEventHandler(async () => {
    if (!existsSync(VICTIMS_DIR)) {
        return [];
    }

    const victimIncidentMap = buildVictimIncidentMap();
    const victimFiles = readdirSync(VICTIMS_DIR).filter((file) =>
        (file.endsWith('.yaml') || file.endsWith('.yml')) && !file.endsWith('.example')
    );

    const victims = [];

    for (const victimFile of victimFiles) {
        const filePath = join(VICTIMS_DIR, victimFile);
        const id = victimFile.replace(/\.(yaml|yml)$/i, '');
        const raw = parseYamlFile(filePath);

        if (!raw || !isString(raw.name)) continue;
        victims.push(normalizeVictim(raw, id, victimIncidentMap));
    }

    return victims;
});
