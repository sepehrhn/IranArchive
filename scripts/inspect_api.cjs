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

        const event = events.find(e => e.end_time) || events[0];

        fs.writeFileSync(path.join(__dirname, 'sample_event.json'), JSON.stringify(event, null, 2));
        console.log('Saved sample event to sample_event.json');
        if (event.end_time) {
            console.log('Found event with end_time!');
        } else {
            console.log('Could not find event with end_time.');
        }
    } catch (e) {
        console.error(e);
    }
}

main();
