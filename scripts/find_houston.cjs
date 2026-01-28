const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', (err) => reject(err));
    });
}

async function main() {
    try {
        const response = await fetchJson('https://www.iranmonitor.org/api/protests?days=60');
        let events = Array.isArray(response) ? response : (response.data || response.events || []);

        const houstonEvents = events.filter(e => e.city.toLowerCase().includes('houston'));

        console.log(`Found ${houstonEvents.length} Houston events`);
        if (houstonEvents.length > 0) {
            fs.writeFileSync(path.join(__dirname, 'houston_events.json'), JSON.stringify(houstonEvents, null, 2));
            houstonEvents.forEach(e => {
                console.log(`- ${e.title} (${e.event_date}) Time: ${e.event_time}`);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

main();
