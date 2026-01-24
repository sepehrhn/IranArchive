import type { Context } from 'hono';
import { ulid } from 'ulid';
import type { Env, InitRequest, InitResponse, SubmissionRecord } from '../types';
import { verifyTurnstile, hashIP, checkRateLimit, validateFile, sanitizeFilename } from '../lib/utils';

export async function handleInit(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
        const body = await c.req.json() as InitRequest;
        const { turnstileToken, kind, files } = body;

        // Get client IP
        const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
        const ipHash = await hashIP(ip);

        // Verify Turnstile
        const turnstileValid = await verifyTurnstile(turnstileToken, c.env.TURNSTILE_SECRET_KEY, ip);
        if (!turnstileValid) {
            return c.json({ error: 'Invalid captcha' }, 403);
        }

        // Check rate limit
        const rateLimitOk = await checkRateLimit(c.env, ipHash);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
        }

        // Validate files
        let totalSize = 0;
        for (const file of files) {
            const validation = validateFile(file, kind);
            if (!validation.valid) {
                return c.json({ error: validation.error }, 400);
            }
            totalSize += file.size;
        }

        if (totalSize > 90 * 1024 * 1024) {
            return c.json({ error: 'Total file size exceeds 90MB' }, 400);
        }

        // Generate submission ID
        const submissionId = ulid();

        // Create upload keys and URLs
        const uploads = files.map(file => {
            const sanitized = sanitizeFilename(file.name);
            const key = `submissions/${submissionId}/uploads/${sanitized}`;

            return {
                key,
                putUrl: `/api/submissions/upload/${submissionId}/${encodeURIComponent(sanitized)}`,
                fileName: sanitized
            };
        });

        // Store submission record in KV
        const record: SubmissionRecord = {
            id: submissionId,
            kind,
            status: 'init',
            createdAt: new Date().toISOString(),
            ipHash,
            files
        };

        await c.env.SUBMISSIONS_KV.put(
            `submission:${submissionId}`,
            JSON.stringify(record),
            { expirationTtl: 86400 } // 24 hours
        );

        const response: InitResponse = {
            submissionId,
            uploads
        };

        return c.json(response);

    } catch (error) {
        console.error('Init error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}
