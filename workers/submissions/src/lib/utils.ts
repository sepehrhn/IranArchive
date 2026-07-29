import type { Env } from '../types';

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string, secretKey: string, ip: string): Promise<boolean> {
    if (!token || !secretKey) return false;
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) return false;
    const data = await response.json() as { success: boolean };
    return data.success === true;
}

/**
 * Hash IP address for privacy
 */
export async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check rate limit (spam prevention)
 */
export async function checkRateLimit(env: Env, ipHash: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - (60 * 60 * 1000); // 1 hour window

    // Get recent submissions for this IP
    const key = `ratelimit:${ipHash}`;
    const value = await env.SUBMISSIONS_KV.get(key);

    if (!value) {
        // First submission, allow
        await env.SUBMISSIONS_KV.put(key, JSON.stringify([now]), { expirationTtl: 3600 });
        return true;
    }

    const timestamps: number[] = JSON.parse(value);
    const recentSubmissions = timestamps.filter(t => t > windowStart);

    // Allow at most five initialized submissions per hour per hashed IP.
    if (recentSubmissions.length >= 5) {
        return false;
    }

    // Add current timestamp
    recentSubmissions.push(now);
    await env.SUBMISSIONS_KV.put(key, JSON.stringify(recentSubmissions), { expirationTtl: 3600 });
    return true;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    const sanitized = filename
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/\.+/g, '.')
        .replace(/-+/g, '-')
        .toLowerCase();
    return sanitized.replace(/^\.+|\.+$/g, '').slice(0, 120) || 'upload';
}

/**
 * Validate file based on kind
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 75 * 1024 * 1024;
export const MAX_FILES_PER_SUBMISSION = 10;

export function validateFile(file: { mime: string; size: number; name?: string }, kind: string): { valid: boolean; error?: string } {

    if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'Invalid file size' };
    }

    if (!file.name || sanitizeFilename(file.name) === 'upload') return { valid: false, error: 'Invalid file name' };

    const allowedMimes: Record<string, string[]> = {
        victim: ['image/jpeg', 'image/png', 'image/webp'],
        incident: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf'
        ],
        evidence: [
            'image/jpeg', 'image/png', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf'
        ],
        event: []
    };

    const allowed = allowedMimes[kind] || [];
    if (kind === 'event' && file.size > 0) return { valid: false, error: 'Event submissions do not accept files' };
    if (allowed.length > 0 && !allowed.includes(file.mime)) {
        return { valid: false, error: 'Invalid file type' };
    }

    return { valid: true };
}

/**
 * Generate presigned PUT URL for R2
 */
export async function generatePresignedPutUrl(
    bucket: R2Bucket,
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    // R2 presigned URLs using HTTP API
    // For Workers, we'll use a simpler approach: generate a signed URL manually
    // or use the direct put method
    // Since Workers have direct R2 access, we don't need presigned URLs
    // We'll return a placeholder that the frontend will use to upload via the worker
    return `/api/submissions/upload/${encodeURIComponent(key)}`;
}
