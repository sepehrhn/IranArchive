
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const CAMPAIGNS_DIR = path.join(process.cwd(), 'data/campaigns');

async function fetchCampaignStats(url) {
    try {
        console.log(`Fetching ${url}...`);

        // Clean URL: remove /exp/... and query params
        const cleanUrl = url.split('/exp/')[0].split('?')[0];

        const response = await fetch(cleanUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();

        // 1. Signatures
        // Look for "signatureCount":123 or "signatureCount":{"displayed":123...}
        const sigMatch = text.match(/"signatureCount":\s*(\d+)/) ||
            text.match(/"signatureCount":\s*\{\s*"displayed":\s*(\d+)/) ||
            text.match(/"total_signatures":\s*(\d+)/) ||
            text.match(/data-progress="(\d+)"/) ||
            text.match(/"userInteractionCount":\s*"?(\d+)"?/);

        // 2. Goal - IGNORE (Calculated dynamically)

        // 3. Author
        // Try to find the creator's display name
        let author = null;
        const authorMatch = text.match(/"creator":\s*\{[^}]*"displayName":"([^"]+)"/);
        if (authorMatch) {
            author = authorMatch[1];
        } else {
            // Fallback: look for generic displayName, but valid authors usually appear early or in specific blocks.
            // Risk of picking up a commenter.
            // Let's try "details": { ... "author_name": "..." } structure or similar if exists
            // Or meta tags? <meta name="author" content="..."> ?? Change.org might not use standard meta author for the petition starter.
            const metaAuthor = text.match(/<meta name="author" content="([^"]+)"/); // Standard meta
            if (metaAuthor) author = metaAuthor[1];
        }

        return {
            signatures: sigMatch ? parseInt(sigMatch[1], 10) : null,
            author,
        };

    } catch (e) {
        console.error(`Failed to fetch ${url}:`, e.message);
        return null;
    }
}

async function updateCampaigns() {
    if (!fs.existsSync(CAMPAIGNS_DIR)) {
        console.error(`Directory not found: ${CAMPAIGNS_DIR}`);
        return;
    }

    const files = fs.readdirSync(CAMPAIGNS_DIR).filter(f => f.endsWith('.yaml') && !f.endsWith('.example'));

    console.log(`Found ${files.length} campaign files.`);

    for (const file of files) {
        const filePath = path.join(CAMPAIGNS_DIR, file);
        const originalContent = fs.readFileSync(filePath, 'utf8');
        let data;

        try {
            data = yaml.load(originalContent);
        } catch (e) {
            console.error(`Error parsing YAML ${file}:`, e.message);
            continue;
        }

        if (!data || !data.url || (!data.url.includes('change.org') && !data.url.includes('c.org'))) {
            console.log(`Skipping ${file}: No valid Change.org URL.`);
            continue;
        }

        const stats = await fetchCampaignStats(data.url);

        if (stats) {
            console.log(`Stats for ${file}:`, stats);

            // Smart Update: regex replacement to preserve comments/structure if possible

            let newContent = originalContent;

            // 1. Author
            if (stats.author) {
                if (newContent.includes('author:')) {
                    newContent = newContent.replace(/^author:.*$/m, `author: "${stats.author}"`);
                } else {
                    newContent += `\nauthor: "${stats.author}"`;
                }
            }

            // 2. Signatures
            if (stats.signatures) {
                if (newContent.includes('signatures:')) {
                    newContent = newContent.replace(/^signatures:.*$/m, `signatures: ${stats.signatures}`);
                } else {
                    newContent += `\nsignatures: ${stats.signatures}`;
                }
            }

            // 3. Remove Goal (It's calculated dynamically now)
            if (newContent.includes('goal:')) {
                newContent = newContent.replace(/^goal:.*$/m, '').trim();
                // Using trim might acceptably clean up trailing newlines, but we need to be careful not to merge unrelated lines. 
                // Let's use a cleaner regex for removal including the newline.
                // Re-read original content to be safe against the trim logic above potentially affecting the whole file if not applied carefully.
                // Actually, let's just use the Replace logic again safely.
            }

            // Safe removal of goal:
            newContent = newContent.replace(/^goal:.*\r?\n?/m, '');


            // Clean up multiple newlines if appended/removed (compacting >2 newlines to 2)
            newContent = newContent.replace(/\n{3,}/g, '\n\n');

            if (newContent !== originalContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated ${file}`);
            } else {
                console.log(`No changes for ${file}`);
            }
        }

        // Politeness delay
        await new Promise(r => setTimeout(r, 500));
    }
}

updateCampaigns();
