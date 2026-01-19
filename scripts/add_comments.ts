
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const COUNTRIES_DIR = 'd:/FreeIran/data/countries';

const COMMENT_BLOCK = `# -----------------------------------------------------------------------------
# FIELD OPTIONS REFERENCE
#
# scores.force_tier:
#   - A (Max Pressure), B (High), C (Targeted), D (Neutral), E (Engagement),
#   - F (Supportive), G (Regime-Aligned), Unknown
#
# diplomacy.status:
#   - severed, no_resident_mission, downgraded, full_relations, enhanced_engagement, unknown
#
# diplomacy.expelled_diplomats:
#   - all, major, limited, none, unknown
#
# diplomacy.iran_mission_status:
#   - none, interests_section, consulate_only, embassy, unknown
#
# irgc_designation.status:
#   - designated_full, designated_partial, under_consideration, rejected_or_no, unknown
#
# un_posture.status:
#   - leads_accountability, supports_accountability, neutral_inconsistent, opposes_accountability, protects_regime, unknown
#
# security_posture.status:
#   - explicit_support, conditional_support, unclear, opposed, unknown
# -----------------------------------------------------------------------------
`;

function main() {
    const files = readdirSync(COUNTRIES_DIR).filter(f => f.endsWith('.yaml'));

    for (const file of files) {
        const path = join(COUNTRIES_DIR, file);
        const content = readFileSync(path, 'utf8');

        // Check if comment block already exists (fuzzy check)
        if (content.includes('FIELD OPTIONS REFERENCE')) {
            console.log(`Skipping ${file}, comments already present.`);
            continue;
        }

        const newContent = COMMENT_BLOCK + '\n' + content;
        writeFileSync(path, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
}

main();
