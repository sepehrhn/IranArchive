
import fs from 'fs';

async function investigate(url) {
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const text = await response.text();

        console.log(`Length: ${text.length}`);

        // Check for specific JSON structure often used by Change.org (Apollo state or similar)
        const signatureMatch = text.match(/"total_signatures":\s*(\d+)/) || text.match(/"signatureCount":\s*(\d+)/);
        if (signatureMatch) console.log(`FOUND_SIGNATURES: ${signatureMatch[1]}`);

        const goalMatch = text.match(/"signatureGoal":\s*(\d+)/) || text.match(/"goal":\s*(\d+)/);
        if (goalMatch) console.log(`FOUND_GOAL: ${goalMatch[1]}`);

        // Author is tricky. Let's look for "creator" or "user" object
        // "creator":{"id":"...","displayName":"..."
        const creatorMatch = text.match(/"creator":\{[^}]*"displayName":"([^"]+)"/);
        if (creatorMatch) console.log(`FOUND_AUTHOR_CREATOR: ${creatorMatch[1]}`);

        // Fallback: look for generic displayName but print context
        const displayNames = [...text.matchAll(/"displayName":"([^"]+)"/g)];
        console.log(`ALL_DISPLAY_NAMES: ${displayNames.slice(0, 3).map(m => m[1]).join(', ')}`);

    } catch (e) {
        console.error(e);
    }
}

investigate("https://www.change.org/p/deport-leila-khatami-end-islamic-regime-privilege");
