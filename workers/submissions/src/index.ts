import { Hono } from 'hono';
import type { Env } from './types';
import { handleInit } from './handlers/init';
import { handleComplete } from './handlers/complete';
import { sanitizeFilename, validateFile } from './lib/utils';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', async (c, next) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',');
    const origin = c.req.header('Origin') || '';

    if (allowedOrigins.includes(origin)) {
        c.header('Access-Control-Allow-Origin', origin);
        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        c.header('Access-Control-Max-Age', '86400');
        c.header('Vary', 'Origin');
    }

    if (c.req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: c.res.headers });
    }

    await next();
});

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Init upload
app.post('/api/submissions/init', handleInit);

// Complete submission
app.post('/api/submissions/complete', handleComplete);

// Upload file to R2 (direct upload via worker)
app.put('/api/submissions/upload/:submissionId/:filename', async (c) => {
    try {
        const submissionId = c.req.param('submissionId');
        const filename = sanitizeFilename(c.req.param('filename'));

        // Verify submission exists
        const recordKey = `submission:${submissionId}`;
        const recordValue = await c.env.SUBMISSIONS_KV.get(recordKey);

        if (!recordValue) {
            return c.json({ error: 'Submission not found' }, 404);
        }
        const record = JSON.parse(recordValue);
        if (record.status !== 'init') return c.json({ error: 'Submission is no longer accepting uploads' }, 409);
        const expectedFile = record.files.find((file: { name: string }) => sanitizeFilename(file.name) === filename);
        if (!expectedFile) return c.json({ error: 'Upload was not initialized' }, 403);

        const contentType = c.req.header('Content-Type') || '';
        const validation = validateFile(expectedFile, record.kind);
        if (!validation.valid || contentType !== expectedFile.mime) return c.json({ error: 'Upload does not match the initialized file' }, 400);

        const key = `submissions/${submissionId}/uploads/${filename}`;
        const body = await c.req.arrayBuffer();
        if (body.byteLength !== expectedFile.size) return c.json({ error: 'Upload size does not match the initialized file' }, 400);

        await c.env.SUBMISSIONS_BUCKET.put(key, body, {
            httpMetadata: {
                contentType
            },
            customMetadata: { originalName: expectedFile.name, sha256: expectedFile.sha256 }
        });

        return c.json({ ok: true, key });
    } catch (error) {
        console.error('Upload error:', error);
        return c.json({ error: 'Upload failed' }, 500);
    }
});

export default app;
