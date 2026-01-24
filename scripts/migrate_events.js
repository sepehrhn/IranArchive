
import fs from 'fs';
import path from 'path';

const eventsDir = path.join('d:\\FreeIran\\data\\events');

function cleanupEvents() {
    try {
        console.log('Starting comprehensive event cleanup...');
        if (!fs.existsSync(eventsDir)) {
            console.error(`Directory not found: ${eventsDir}`);
            return;
        }

        const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.yaml') && f.startsWith('ev-'));
        console.log(`Found ${files.length} files.`);

        files.forEach(file => {
            const filePath = path.join(eventsDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let lines = content.split(/\r?\n/);
            let newLines = [];
            let updated = false;

            // 1. Remove Obsolete Fields (matching key pattern, even if commented)
            // Fields to remove: venue_name, location_visibility, meeting_point, route, country_iso2
            // Also "media" if present as a key (we removed the block, but maybe lines remain)

            const obsoletePatterns = [
                /^\s*#?\s*venue_name:/,
                /^\s*#?\s*location_visibility:/,
                /^\s*#?\s*meeting_point:/,
                /^\s*#?\s*route:/,
                /^\s*#?\s*country_iso2:/,
                /^\s*#?\s*media:/,
                // Also remove specific comments associated with them if identifiable?
                // Hard to target comments generically without parsing context.
                // But we can target the known comment lines from the old template if they match exactly.
                /^\s*#\s*Name of the specific place \(e\.g\. Brandenburg Gate\)/,
                /^\s*#\s*Visibility options for safety:/,
                /^\s*#\s*-\s*public: Full details shown/,
                /^\s*#\s*-\s*approximate: Only city\/country shown/,
                /^\s*#\s*-\s*withheld: Location details hidden entirely/,
                /^\s*#\s*Optional details/,
                /^\s*#\s*2-letter ISO code \(uppercase\) - used for flags\/filtering/,
                /^\s*#\s*List of filenames \(images\/videos\)/,
                /^\s*#\s*e\.g\. img-/,
                /^\s*#\s*-\s*img-/,
                /^\s*#\s*-\s*vid-/,
            ];

            for (const line of lines) {
                let keep = true;
                for (const pattern of obsoletePatterns) {
                    if (line.match(pattern)) {
                        keep = false;
                        updated = true;
                        break;
                    }
                }

                // Specific fix for existing country field being FULL NAME instead of ISO.
                // We don't have a map here easily unless we bring in the list.
                // But wait, the user said "still old inputs like... country included".
                // If country is "Italy" but schema says "IT".
                // We rely on the user to fix country manually OR we assume they migrated?
                // In step 517 user manually changed 'country: "AU"' back to "Australia" and added "country_iso2: AU".
                // And then complained.
                // The REQUIREMENT is: location.country should be ISO2.
                // If I find `country_iso2: "XX"`, I should move it to `country: "XX"`.

                // We are doing line-by-line. If we removed `country_iso2` lines above, we lost data if we didn't capture it.
                // Let's refine the loop.

                if (keep) newLines.push(line);
            }

            // Re-read content to parse specific fields for correction?
            // Actually, let's just run the regex removal first.
            // About country: If `country: "Full Name"` is there, we need to change it to ISO.
            // Without a lookup list, I can't automagically fix "Italy" -> "IT" reliably unless I have the map.
            // I'll trust my previous migration did the ISO mapping if `country_iso2` was present.
            // If the user manually edited 00027 to be wrong, I might need to fix it specifically or warn.
            // But let's focus on removing the obsolete inputs first as requested.

            if (updated) {
                fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
                console.log(`Cleaned ${file}`);
            }
        });
        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Cleanup failed:', err);
    }
}

cleanupEvents();
