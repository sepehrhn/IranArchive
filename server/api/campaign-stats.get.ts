
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const url = query.url as string;

    if (!url || (!url.includes('change.org') && !url.includes('c.org'))) {
        return { error: 'Invalid URL' };
    }

    // Clean URL: remove /exp/... and query params
    const cleanUrl = url.split('/exp/')[0].split('?')[0];
    const fetchUrl = cleanUrl; // Use this for fetching

    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();

        // 1. Signatures
        const sigMatch = text.match(/"signatureCount":\s*(\d+)/) ||
            text.match(/"signatureCount":\s*\{\s*"displayed":\s*(\d+)/) ||
            text.match(/"total_signatures":\s*(\d+)/) ||
            text.match(/data-progress="(\d+)"/) ||
            text.match(/"userInteractionCount":\s*"?(\d+)"?/);

        // 2. Author
        let author = null;
        const authorMatch = text.match(/"creator":\s*\{[^}]*"displayName":"([^"]+)"/);
        if (authorMatch) {
            author = authorMatch[1];
        } else {
            const metaAuthor = text.match(/<meta name="author" content="([^"]+)"/);
            if (metaAuthor) author = metaAuthor[1];
        }

        return {
            signatures: sigMatch ? parseInt(sigMatch[1], 10) : null,
            author,
        };

    } catch (e) {
        console.error(`Failed to fetch ${url}:`, e);
        return { error: 'Failed to fetch data' };
    }
});
