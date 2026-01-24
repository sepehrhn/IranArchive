
import fs from 'fs';
import path from 'path';

const eventsDir = path.join('d:\\FreeIran\\data\\events');

// Simple delay helper
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeEvents() {
    try {
        console.log('Starting geocoding process...');
        if (!fs.existsSync(eventsDir)) {
            console.error(`Directory not found: ${eventsDir}`);
            return;
        }

        const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.yaml') && f.startsWith('ev-'));
        console.log(`Found ${files.length} files.`);

        for (const file of files) {
            const filePath = path.join(eventsDir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            // Check if lat/lng are already set (non-empty)
            // Regex to find "lat: [number]"
            // If we find "lat: " with nothing or null/tilde, we process.
            // My previous script ensured "lat: " exists.

            const hasLat = content.match(/lat:\s*([0-9.-]+)/);
            if (hasLat) {
                // console.log(`Skipping ${file} - already has coordinates`);
                continue;
            }

            // Extract location details
            const countryMatch = content.match(/country:\s*"([^"]+)"/);
            const cityMatch = content.match(/city:\s*"([^"]+)"/);
            const addressMatch = content.match(/address:\s*"([^"]+)"/);

            const country = countryMatch ? countryMatch[1] : '';
            const city = cityMatch ? cityMatch[1] : '';
            const address = addressMatch ? addressMatch[1] : '';

            if (!city && !address) {
                console.log(`Skipping ${file} - insufficient location data`);
                continue;
            }

            // Construct query
            // Nominatim works well with structured queries or freeform.
            // Let's try freeform: "Address, City, Country"
            let query = [address, city, country].filter(Boolean).join(', ');

            console.log(`[${file}] Geocoding: ${query}...`);

            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'FreeIranEventGeocoder/1.0 (contact: admin@freeiran.org)' // Required by Nominatim
                    }
                });

                if (!response.ok) {
                    console.error(`Failed to fetch for ${file}: ${response.statusText}`);
                    continue;
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    console.log(`  -> Found: ${lat}, ${lon}`);

                    // Update file
                    // We look for the exact lines "lat: " and "lng: " (empty) and replace them
                    // Since we know the previous script formatted them as "  lat: \n  lng: " usually.

                    // Use regex that matches the empty keys specifically
                    content = content.replace(/lat:\s*(\r?\n)/, `lat: ${lat}$1`);
                    content = content.replace(/lng:\s*(\r?\n)/, `lng: ${lon}$1`);

                    // Fallback if they were on one line or different spacing, but strict regex helps.
                    // If my previous script put "lat:" without value, regex `lat:\s*$` (multiline) matches.

                    fs.writeFileSync(filePath, content, 'utf8');
                } else {
                    console.log(`  -> No results found.`);
                    // Try fallback: City + Country only?
                    if (address && city) {
                        console.log(`  -> Retrying with City only...`);
                        const query2 = [city, country].filter(Boolean).join(', ');
                        const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query2)}&format=json&limit=1`;
                        await delay(1000); // Wait before retry

                        const res2 = await fetch(url2, { headers: { 'User-Agent': 'FreeIranEventGeocoder/1.0' } });
                        const data2 = await res2.json();

                        if (data2 && data2.length > 0) {
                            const lat = data2[0].lat;
                            const lon = data2[0].lon;
                            console.log(`  -> Found (City level): ${lat}, ${lon}`);
                            content = content.replace(/lat:\s*(\r?\n)/, `lat: ${lat}$1`);
                            content = content.replace(/lng:\s*(\r?\n)/, `lng: ${lon}$1`);
                            fs.writeFileSync(filePath, content, 'utf8');
                        } else {
                            console.log(`  -> Still no results.`);
                        }
                    }
                }

            } catch (err) {
                console.error(`Error querying Nominatim for ${file}:`, err);
            }

            // Respect usage policy
            await delay(1200);
        }
        console.log('Geocoding complete.');
    } catch (err) {
        console.error('Geocoding critical failure:', err);
    }
}

geocodeEvents();
