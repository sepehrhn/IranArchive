
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const events = [
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 23, 8pm",
        "location": {
            "city": "Ottawa",
            "country": "Canada",
            "venue": "Parliament of Canada grounds (Parliament Hill)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1PagvKCkPkGECV-zLeNx3yVbSRxP7Kacm/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 23, 12:30-1:30pm",
        "location": {
            "city": "Sydney",
            "country": "Australia",
            "venue": "50 Miller St, North Sydney"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1Wx3dJeVwmoBvvN5RIOgElGl36UBXviA9/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 23, 3pm-5pm",
        "location": {
            "city": "Lund",
            "country": "Sweden",
            "venue": "Clemenstorget"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1QZCWNA1fd71QqjA0ERU4A31GcmyDy-BL/view"]
    },
    {
        "title": "Ongoing Weekly Protest",
        "date_time": "Weekly (Weekdays: 5-7pm, Weekends: 3-5pm)",
        "location": {
            "city": "Stockholm",
            "country": "Sweden",
            "venue": "Norrmalmstorg"
        },
        "description": "Persistent weekly gatherings in support of Iran protests.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1MkObeW9dlBNAtFn7FtcI_2TNkwJG75VJ/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm-4pm",
        "location": {
            "city": "Chicago",
            "country": "USA",
            "venue": "Starting point: Gilson Park, Wilmette"
        },
        "description": "Solidarity rally/march for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1s_yqJD-SStK61sZvDkI5YP6iBDC8se19/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 3pm-5pm",
        "location": {
            "city": "Houston",
            "country": "USA",
            "venue": "In front of Starbucks 2521 Post Oak Blvd"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1FL2xvk1aCaJL2DcU154l9XEPKHaFakT1/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm-5:30pm",
        "location": {
            "city": "Berlin",
            "country": "Germany",
            "venue": "Kurfürstendamm / Joachimsthaler Str. (next to C&A)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1Q8m8lCLwrFXq78WxfiYWeiGZoUWIGlit/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2-4pm",
        "location": {
            "city": "Washington DC",
            "country": "USA",
            "venue": "US Capitol"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/open?id=1AGWQRz47velnUZWSK5vPYnt3jIFUbFPp&usp=drive_copy"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm-5pm",
        "location": {
            "city": "Duesseldorf",
            "country": "Germany",
            "venue": "Duesseldorf Hbf (Central Station)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1hdXRX2MYz8VS1FKmXXFcBbwV-s74x3xh/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm",
        "location": {
            "city": "Guadalajara",
            "country": "Mexico",
            "venue": "Glorieta de la Minerva"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/open?id=1g10yXSZC2lCpGtTyA_Ypa-9FeB2Qmhii&usp=drive_copy"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2-4pm",
        "location": {
            "city": "Montreal",
            "country": "Canada",
            "venue": "Atwater Metro to the U.S. Consulate, 2330 Sainte-Catherine St W"
        },
        "description": "Solidarity rally/march for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1y239yJdPQCAEz7e70gMhmjrxKqMEa-eU/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 4pm-5pm",
        "location": {
            "city": "Ravenna",
            "country": "Italy",
            "venue": "From Piazza Andrea Costa to Piazza del Popolo"
        },
        "description": "Solidarity march for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1-2Vk01vb96w9mzJqRfF3JbnDT3PIdaCH/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 5pm-8pm",
        "location": {
            "city": "Hamburg",
            "country": "Germany",
            "venue": "Jungfernstieg 54 (opposite Nivea-Haus)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1SR13OuHsEN4P7nWFkO5oVwQ7MWQ9mKVa/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm",
        "location": {
            "city": "Nice",
            "country": "France",
            "venue": "In front of the Statue of Liberty, Promenade des Anglais"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1qoXuW8KEoOfv-PoEOsQy_pFnfDkKWICE/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 1pm-2pm",
        "location": {
            "city": "Madison",
            "country": "USA",
            "venue": "Madison Capitol, State Street Corner"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1ePDyJC2y8xw1bqygweAkkDnFuUyPPzar/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 3pm-6pm",
        "location": {
            "city": "Frankfurt",
            "country": "Germany",
            "venue": "Rathenauplatz (Goethenplatz)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1LN9QIYBoOQQjfc0YjHLMiBwVLhitU83J/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm",
        "location": {
            "city": "Mexico City",
            "country": "Mexico",
            "venue": "El Ángel de la Independencia"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1JjJV5gnb1ysZvh8FLG9jsfAfWcLllG0w/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24 & 25, 2pm-4pm",
        "location": {
            "city": "Irvine",
            "country": "USA",
            "venue": "Culver & BARRANCE PKWY"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/195FdJUZKaLuupwP3rsBQnOzkCzfxeJ3Z/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 4pm-6pm",
        "location": {
            "city": "Brisbane",
            "country": "Australia",
            "venue": "Reddacliff Place, 266 George Street"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1dQ0ybv2aPO29i5F-cNMwV_AfOZlKr9Pu/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 2pm-4pm",
        "location": {
            "city": "San Diego",
            "country": "USA",
            "venue": "5270 Balboa Ave"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1LImlyBaogC-07qPTQ7qORd7_7F7INlr6/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 24, 3pm",
        "location": {
            "city": "Hannover",
            "country": "Germany",
            "venue": "Neues Rathaus, Platz der Menschenrechte 1"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1bnYGWepmW8tgBK9OyznltdfapPxdebLy/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 12pm-2pm",
        "location": {
            "city": "San Francisco",
            "country": "USA",
            "venue": "Harry Bridges Plaza (Embarcadero)"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1AeQUymFl-Zd_6HKsV4NzI8LAzu8Br0j9/view?usp=sharing"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 1pm-3pm",
        "location": {
            "city": "Los Angeles",
            "country": "USA",
            "venue": "Ventura Blvd & Penfield Ave, Woodland Hills"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1pIWbPDvCj6PwWo9wJURS5ly6lL6iYm3U/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm-4pm",
        "location": {
            "city": "Washington DC",
            "country": "USA",
            "venue": "World War I Memorial, 1400 Pennsylvania Ave NW"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1FRmaazKi3cj63QQ5C9Cs_RTVCwcCQfFM/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm",
        "location": {
            "city": "Jacksonville",
            "country": "USA",
            "venue": "501 W Adams St."
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1NzlqOo_criZLb4X4jFHRK2ShbbEKSfAm/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 1pm-2:30pm",
        "location": {
            "city": "Austin",
            "country": "USA",
            "venue": "Texas State Capitol, 1100 Congress Ave"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1eM_UJy51KA0WVUOKvi9eaVGHGpWkPNnu/view?usp=sharing"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm-5pm",
        "location": {
            "city": "Turin",
            "country": "Italy",
            "venue": "Piazza Castello"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1iXDqjILepgMJQMxE-WsY5ipvlxwgwPx8/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 5pm-7pm",
        "location": {
            "city": "Sydney",
            "country": "Australia",
            "venue": "North Hyde Park"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1f6vcvJo-Zm0Zugj5PpSFbb9p8ZMpxah0/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm",
        "location": {
            "city": "Atlanta",
            "country": "USA",
            "venue": "CNN center, 190 Marietta St NW"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1iIRPSPnQ-JLYmKDXwhiR6o1tdCEr9iiX/view"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 3pm-5pm",
        "location": {
            "city": "Scottsdale",
            "country": "USA",
            "venue": "7199 E Camelback Rd."
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1gDTiwxDEcLBhCiEIcQpXS3QgSkVit8dT/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm-3pm",
        "location": {
            "city": "Calgary",
            "country": "Canada",
            "venue": "Calgary City Hall Plaza"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1rb_LH6jLpMjMv2rS0-BIh9nE0X4QFqoS/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 1pm-3pm",
        "location": {
            "city": "Vancouver",
            "country": "Canada",
            "venue": "Vancouver Art Gallery, 750 Hornby St."
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/1MhryAGaqXRY_ODqPKjzy8wRcp3srd3aH/view?usp=drive_link"]
    },
    {
        "title": "Iran Protests Solidarity Event",
        "date_time": "Jan 25, 2pm",
        "location": {
            "city": "Brussels",
            "country": "Belgium",
            "venue": "Place Schumann"
        },
        "description": "Solidarity rally for the people of Iran.",
        "organizer": "Not specified",
        "links_sources": ["https://drive.google.com/file/d/14zKByzWbERYk8N5xCB36Xyk1lhNOREzL/view?usp=drive_link"]
    }
];

function guessTimezone(country, city) {
    const map = {
        'Canada': 'America/Toronto',
        'Australia': 'Australia/Sydney',
        'Sweden': 'Europe/Stockholm',
        'USA': 'America/New_York', // Default, need robust mapping
        'Germany': 'Europe/Berlin',
        'Mexico': 'America/Mexico_City',
        'Italy': 'Europe/Rome',
        'France': 'Europe/Paris',
        'Belgium': 'Europe/Brussels'
    };

    // Specific Cities overrides
    if (city === 'Los Angeles' || city === 'San Francisco' || city === 'San Diego' || city === 'Irvine') return 'America/Los_Angeles';
    if (city === 'Chicago' || city === 'Madison' || city === 'Austin' || city === 'Houston') return 'America/Chicago'; // Austin/Houston is Central
    if (city === 'Vancouver') return 'America/Vancouver';
    if (city === 'Calgary') return 'America/Edmonton';
    if (city === 'Brisbane') return 'Australia/Brisbane';
    if (city === 'Phoenix' || city === 'Scottsdale') return 'America/Phoenix';

    return map[country] || 'UTC';
}

function parseTime(dateStr, year = 2026) {
    // "Jan 23, 8pm" -> 2026-01-23T20:00:00
    // "Jan 23, 12:30-1:30pm"
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

    const parts = dateStr.match(/([a-zA-Z]+)\s+(\d+)(.*)/);
    if (!parts) return { start: null, end: null };

    const month = months[parts[1]];
    const day = parseInt(parts[2], 10);
    const timePart = parts[3].replace(',', '').trim(); // "8pm", "12:30-1:30pm"

    // Special case: Weekly
    if (dateStr.includes('Weekly')) {
        // Just put a placeholder future date
        return { start: '2026-01-23T17:00:00', end: '2026-01-23T19:00:00', weekly: true };
    }

    // Extract times
    let startTime = "12:00";
    let endTime = null;

    // Simple regex for times: (\d+)(?::(\d+))?(am|pm)?
    // Splitting by '-'
    const ranges = timePart.split(/[-&]/);

    const parseSingleTime = (t) => {
        const m = t.match(/(\d+)(?::(\d+))?\s*(am|pm|noon)?/i);
        if (!m) return null;
        let h = parseInt(m[1]);
        const min = m[2] || "00";
        const amp = m[3]?.toLowerCase();

        if (amp === 'pm' && h < 12) h += 12;
        if (amp === 'am' && h === 12) h = 0;

        return `${String(h).padStart(2, '0')}:${min}:00`;
    };

    if (ranges.length > 0) startTime = parseSingleTime(ranges[0]) || "12:00:00";
    if (ranges.length > 1) endTime = parseSingleTime(ranges[1]);

    const pad = (n) => String(n).padStart(2, '0');
    const dateBase = `${year}-${pad(month + 1)}-${pad(day)}`;

    return {
        start: `${dateBase}T${startTime}`,
        end: endTime ? `${dateBase}T${endTime}` : null
    };
}

const isoMap = {
    'Canada': 'CA',
    'Australia': 'AU',
    'Sweden': 'SE',
    'USA': 'US',
    'Germany': 'DE',
    'Mexico': 'MX',
    'Italy': 'IT',
    'France': 'FR',
    'Belgium': 'BE'
};

let counter = 1;

events.forEach(ev => {
    const times = parseTime(ev.date_time);

    // Skip if invalid
    if (!times.start) return;

    const id = `ev-2026-${String(counter).padStart(5, '0')}`;
    const tz = guessTimezone(ev.location.country, ev.location.city);

    const obj = {
        title: `${ev.location.city} Rally`, // Use City as title for clarity as "Iran Protests" is generic
        summary: `Solidarity gathering in ${ev.location.city}, ${ev.location.country}.`,
        description: `${ev.description}\n\n**Venue:** ${ev.location.venue}`,
        state: times.weekly ? 'ongoing' : 'upcoming', // Simple logic
        format: 'in_person',
        type: 'rally',
        start_at: times.start,
        end_at: times.end,
        timezone: tz,
        date_precision: 'Exact',
        location: {
            country: ev.location.country,
            country_iso2: isoMap[ev.location.country] || 'XX',
            city: ev.location.city,
            venue_name: ev.location.venue,
            location_visibility: 'public'
        },
        organizer: {
            name: 'Local Organizers',
            website: ev.links_sources[0] || 'https://example.com'
        },
        status: 'verified', // Assuming trusted source
        featured: false,
        sources: ev.links_sources.map(l => ({ title: 'Poster/Link', url: l }))
    };

    const yamlStr = yaml.dump(obj);
    fs.writeFileSync(path.join(__dirname, `../data/events/${id}.yaml`), yamlStr);
    console.log(`Created ${id}.yaml`);
    counter++;
});
