
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const COUNTRIES_DIR = 'd:/FreeIran/data/countries';

// Regex to remove the old header block
const HEADER_REGEX = /# -----------------------------------------------------------------------------[\s\S]*?# -----------------------------------------------------------------------------\n/;

const SCORES_COMMENT = `# force_tier options: A, B, C, D, E, F, G, Unknown`;

const DIPLOMACY_COMMENT = `# status: severed, no_resident_mission, downgraded, full_relations, enhanced_engagement, unknown
# expelled_diplomats: all, major, limited, none, unknown
# iran_mission_status: none, interests_section, consulate_only, embassy, unknown`;

const IRGC_COMMENT = `# status: designated_full, designated_partial, under_consideration, rejected_or_no, unknown`;

const UN_COMMENT = `# status: leads_accountability, supports_accountability, neutral_inconsistent, opposes_accountability, protects_regime, unknown`;

const SECURITY_COMMENT = `# status: explicit_support, conditional_support, unclear, opposed, unknown`;

function main() {
    const files = readdirSync(COUNTRIES_DIR).filter(f => f.endsWith('.yaml'));

    for (const file of files) {
        const path = join(COUNTRIES_DIR, file);
        let content = readFileSync(path, 'utf8');

        // 1. Remove old header if present
        if (HEADER_REGEX.test(content)) {
            content = content.replace(HEADER_REGEX, '').trimStart();
        }

        // 2. Remove existing inline comments if we are re-running (simple check)
        // Ideally we assume clean slate or overwrite. 
        // Let's just do simple replacements. If comments are already there, we might duplicate if we are not careful.
        // We will check if the specific comment string exists before adding it.

        // Helper to replace safely
        const injectComment = (key: string, comment: string) => {
            if (!content.includes(comment)) {
                // Remove previous versions of comments if they exist (hard to do perfectly without parser, 
                // but we know exact strings from previous step if we had them. 
                // As this is a migration from Header -> Inline, we assume no inline exists yet).

                // Replace "key:" with "comment\nkey:"
                // Use regex to match key at start of line
                const regex = new RegExp(`^${key}:`, 'm');
                content = content.replace(regex, `${comment}\n${key}:`);
            }
        };

        injectComment('scores', SCORES_COMMENT);
        injectComment('diplomacy', DIPLOMACY_COMMENT);
        injectComment('irgc_designation', IRGC_COMMENT);
        injectComment('un_posture', UN_COMMENT);
        injectComment('security_posture', SECURITY_COMMENT);

        writeFileSync(path, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

main();
