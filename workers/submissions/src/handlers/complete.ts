import type { Context } from 'hono';
import type { Env, CompleteRequest, CompleteResponse, SubmissionRecord } from '../types';
import { verifyTurnstile, hashIP } from '../lib/utils';

export async function handleComplete(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
        const body = await c.req.json() as CompleteRequest;
        const { submissionId, turnstileToken, kind, payload, uploadedFiles } = body;

        // Get client IP
        const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

        // Note: Turnstile is verified at init step. We rely on submissionId existence in KV as proof.
        // Re-verifying the same token would fail as they are one-time use.

        // Load submission record
        const recordKey = `submission:${submissionId}`;
        const recordValue = await c.env.SUBMISSIONS_KV.get(recordKey);

        if (!recordValue) {
            return c.json({ error: 'Submission not found' }, 404);
        }

        const record: SubmissionRecord = JSON.parse(recordValue);

        // Verify submission hasn't been completed
        if (record.status !== 'init') {
            return c.json({ error: 'Submission already processed' }, 400);
        }

        // Verify kind matches
        if (record.kind !== kind) {
            return c.json({ error: 'Submission kind mismatch' }, 400);
        }

        // Verify uploaded files exist in R2
        for (const file of uploadedFiles) {
            const object = await c.env.SUBMISSIONS_BUCKET.head(file.key);
            if (!object) {
                return c.json({ error: `File not found: ${file.originalName}` }, 400);
            }

            // Verify size matches
            if (object.size !== file.size) {
                return c.json({ error: `File size mismatch: ${file.originalName}` }, 400);
            }
        }

        // Store payload in R2
        const payloadKey = `submissions/${submissionId}/payload.json`;
        const payloadData = {
            kind,
            data: payload,
            files: uploadedFiles,
            submittedAt: new Date().toISOString()
        };

        await c.env.SUBMISSIONS_BUCKET.put(
            payloadKey,
            JSON.stringify(payloadData, null, 2),
            {
                httpMetadata: {
                    contentType: 'application/json'
                }
            }
        );

        // Update submission record
        record.status = 'completed';
        record.completedAt = new Date().toISOString();
        await c.env.SUBMISSIONS_KV.put(recordKey, JSON.stringify(record), { expirationTtl: 86400 });

        // Trigger GitHub Action via repository_dispatch
        try {
            const dispatchResponse = await fetch(
                `https://api.github.com/repos/${c.env.GH_REPO_OWNER}/${c.env.GH_REPO_NAME}/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${c.env.GH_DISPATCH_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'IranArchive-Submissions'
                    },
                    body: JSON.stringify({
                        event_type: 'iranarchive_submission',
                        client_payload: {
                            submissionId,
                            kind,
                            payloadKey,
                            uploadKeys: uploadedFiles.map(f => f.key)
                        }
                    })
                }
            );

            if (!dispatchResponse.ok) {
                console.error('GitHub dispatch failed:', await dispatchResponse.text());
                // Don't fail the request - we can retry dispatch later
            } else {
                record.status = 'dispatched';
                await c.env.SUBMISSIONS_KV.put(recordKey, JSON.stringify(record), { expirationTtl: 86400 });
            }
        } catch (error) {
            console.error('GitHub dispatch error:', error);
            // Continue - submission is saved, dispatch can be retried
        }

        const response: CompleteResponse = {
            ok: true,
            submissionId
        };

        return c.json(response);

    } catch (error) {
        console.error('Complete error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}
