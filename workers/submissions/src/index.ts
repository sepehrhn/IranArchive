import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { handleInit } from './handlers/init';
import { handleComplete } from './handlers/complete';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', async (c, next) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',');
    const origin = c.req.header('Origin') || '';

    if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
        c.header('Access-Control-Allow-Origin', origin);
        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        c.header('Access-Control-Max-Age', '86400');
    }

    if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
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
        const filename = c.req.param('filename');

        // Verify submission exists
        const recordKey = `submission:${submissionId}`;
        const recordValue = await c.env.SUBMISSIONS_KV.get(recordKey);

        if (!recordValue) {
            return c.json({ error: 'Submission not found' }, 404);
        }

        const key = `submissions/${submissionId}/uploads/${filename}`;
        const body = await c.req.arrayBuffer();

        await c.env.SUBMISSIONS_BUCKET.put(key, body, {
            httpMetadata: {
                contentType: c.req.header('Content-Type') || 'application/octet-stream'
            }
        });

        return c.json({ ok: true, key });
    } catch (error) {
        console.error('Upload error:', error);
        return c.json({ error: 'Upload failed' }, 500);
    }
});

export default app;
