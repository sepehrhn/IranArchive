import fs from 'fs';

const path = 'd:\\FreeIran\\assets\\geo\\world-countries.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);

    // Find Bahrain
    const idx = json.features.findIndex(f => f.properties.NAME === 'Bahrain');

    const bahrainGeometry = {
        "type": "MultiPolygon",
        "coordinates": [
            // Main Island (Clockwise)
            [[
                [50.50, 26.20],
                [50.55, 26.28], // North West tip
                [50.60, 26.28], // Manama
                [50.62, 26.20], // East Coast
                [50.60, 26.10],
                [50.58, 25.90],
                [50.55, 25.80], // Southern tip
                [50.50, 25.85],
                [50.45, 25.95],
                [50.42, 26.10],
                [50.45, 26.15],
                [50.50, 26.20]
            ]],
            // Muharraq Island (Clockwise)
            [[
                [50.58, 26.22],
                [50.62, 26.28],
                [50.68, 26.28], // Airport tip
                [50.66, 26.22],
                [50.58, 26.22]
            ]],
            // Sitra (Clockwise)
            [[
                [50.60, 26.18],
                [50.62, 26.18],
                [50.62, 26.12],
                [50.60, 26.12],
                [50.60, 26.18]
            ]]
        ]
    };

    if (idx !== -1) {
        json.features[idx].geometry = bahrainGeometry;
        console.log('Bahrain updated with MultiPolygon.');
    } else {
        const bahrain = {
            "type": "Feature",
            "properties": {
                "NAME": "Bahrain",
                "ISO_A2": "BH",
                "ISO_A3": "BHR"
            },
            "geometry": bahrainGeometry
        };
        json.features.push(bahrain);
        console.log('Bahrain added with MultiPolygon.');
    }

    fs.writeFileSync(path, JSON.stringify(json), 'utf8');

} catch (err) {
    console.error(err);
}
