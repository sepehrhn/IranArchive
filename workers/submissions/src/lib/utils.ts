import type { Env } from '../types';

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string, secretKey: string, ip: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
    });

    const data = await response.json() as { success: boolean };
    return data.success;
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

    // Allow max 20 submissions per hour
    if (recentSubmissions.length >= 20) {
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
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/\.+/g, '.')
        .replace(/-+/g, '-')
        .toLowerCase();
}

/**
 * Validate file based on kind
 */
export function validateFile(file: { mime: string; size: number }, kind: string): { valid: boolean; error?: string } {
    const MAX_SIZE = 90 * 1024 * 1024; // 90MB total

    if (file.size > MAX_SIZE) {
        return { valid: false, error: 'File too large' };
    }

    const allowedMimes: Record<string, string[]> = {
        victim: ['image/jpeg', 'image/png', 'image/webp'],
        evidence: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf'
        ]
    };

    const allowed = allowedMimes[kind] || [];
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
