/**
 * Media URL Utility
 * 
 * Generates GitHub raw URLs for media files stored in the repository.
 * Media files are NOT copied to static output; they are loaded at runtime from GitHub.
 */

import { useRuntimeConfig } from '#app';

export type MediaKind = 'evidence' | 'victim_photo' | 'entity_photo' | 'asset'; // Added asset, entity_photo

export interface MediaUrlOptions {
    kind: MediaKind;
    relativePath: string;
}

/**
 * Generate a GitHub raw URL for a media file
 * 
 * @param options - Media kind and relative path
 * @returns Fully qualified GitHub raw URL
 * 
 * @example
 * ```ts
 * // Evidence: /data/evidences/2026/jan/video.mp4
 * getMediaUrl({ kind: 'evidence', relativePath: '2026/jan/video.mp4' })
 * // Returns: https://raw.githubusercontent.com/sepehrhn/IranArchive/main/data/evidences/2026/jan/video.mp4
 * 
 * // Campaign: /data/campaigns/img/camp-2026-001.jpg
 * getMediaUrl({ kind: 'campaign_img', relativePath: 'camp-2026-001.jpg' })
 * // Returns: https://raw.githubusercontent.com/sepehrhn/IranArchive/main/data/campaigns/img/camp-2026-001.jpg
 * 
 * // Victim: /data/victims/img/vic-2026-000007.jpg
 * getMediaUrl({ kind: 'victim_photo', relativePath: 'vic-2026-000007.jpg' })
 * // Returns: https://raw.githubusercontent.com/sepehrhn/IranArchive/main/data/victims/img/vic-2026-000007.jpg
 * 
 * // Asset: /data/assets/img/poster.jpg
 * getMediaUrl({ kind: 'asset', relativePath: 'img/poster.jpg' })
 * // Returns: https://raw.githubusercontent.com/sepehrhn/IranArchive/main/data/assets/img/poster.jpg
 * ```
 */
export function getMediaUrl(options: MediaUrlOptions, config?: any): string {
    const runtimeConfig = config || useRuntimeConfig();
    const { kind, relativePath } = options;

    // Validate and sanitize the relative path
    if (!relativePath || typeof relativePath !== 'string') {
        throw new Error(`Invalid relativePath: ${relativePath}`);
    }

    // Security: Reject path traversal attempts
    if (relativePath.includes('..')) {
        throw new Error(`Path traversal detected in relativePath: ${relativePath}`);
    }

    // Normalize slashes
    const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');

    // Build the full repository path based on media kind
    let fullPath: string;
    switch (kind) {
        case 'evidence':
            fullPath = `data/evidences/${normalizedPath}`;
            break;

        case 'victim_photo':
            fullPath = `data/victims/img/${normalizedPath}`;
            break;

        case 'asset':
            fullPath = `data/assets/${normalizedPath}`;
            break;

        case 'entity_photo':
            fullPath = `data/entities/img/${normalizedPath}`;
            break;

        default:
            throw new Error(`Unknown media kind: ${kind}`);
    }

    // Get configuration
    const baseUrl = runtimeConfig.public.mediaBaseRawUrl as string;
    const owner = runtimeConfig.public.mediaRepoOwner as string;
    const repo = runtimeConfig.public.mediaRepoName as string;
    const ref = runtimeConfig.public.mediaRepoRef as string;

    // URL-encode the path segments
    const encodedPath = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');

    // Handle development vs production
    // In development (local), serve from the local media proxy
    // In production (build/generate), serve from GitHub Raw URLs
    if (process.dev) {
        return `/media/${kind}/${normalizedPath}`;
    }

    // Build the final URL for production
    const url = `${baseUrl}/${owner}/${repo}/${ref}/${encodedPath}`;

    return url;
}
