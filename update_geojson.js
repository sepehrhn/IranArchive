import fs from 'fs';
const path = 'd:\\FreeIran\\assets\\geo\\world-countries.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);

    // Check if Qatar already exists
    const exists = json.features.find(f => f.properties.NAME === 'Qatar');
    if (exists) {
        console.log('Qatar already exists.');
    } else {
        const qatar = {
            "type": "Feature",
            "properties": {
                "NAME": "Qatar",
                "ISO_A2": "QA",
                "ISO_A3": "QAT"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[50.7, 24.5], [51.6, 24.5], [51.6, 26.2], [50.7, 26.2], [50.7, 24.5]]]
            }
        };

        json.features.push(qatar);
        fs.writeFileSync(path, JSON.stringify(json), 'utf8');
        console.log('Qatar added successfully.');
    }
} catch (err) {
    console.error('Error:', err);
}
