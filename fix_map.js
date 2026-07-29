import fs from 'fs';

const path = 'd:\\FreeIran\\assets\\geo\\world-countries.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);

    // Check 1st feature for winding order hint (just printing coords of first ring)
    if (json.features.length > 0) {
        const f1 = json.features[0];
        if (f1.geometry.type === 'Polygon') {
            console.log('Sample Polygon Ring:', JSON.stringify(f1.geometry.coordinates[0].slice(0, 5)));
        } else if (f1.geometry.type === 'MultiPolygon') {
            console.log('Sample MultiPolygon Ring:', JSON.stringify(f1.geometry.coordinates[0][0].slice(0, 5)));
        }
    }

    // Define Bahrain with Clockwise winding (Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left -> Top-Left)
    // Or rather: (50.5, 26.3) -> (50.7, 26.3) -> (50.7, 26.0) -> (50.5, 26.0) -> (50.5, 26.3)
    // previous was CCW. Let's try CW.
    const bahrain = {
        "type": "Feature",
        "properties": {
            "NAME": "Bahrain",
            "ISO_A2": "BH",
            "ISO_A3": "BHR"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[50.5, 26.3], [50.7, 26.3], [50.7, 26.0], [50.5, 26.0], [50.5, 26.3]]]
        }
    };

    // Check if exists
    const exists = json.features.find(f => f.properties.NAME === 'Bahrain');
    if (!exists) {
        json.features.push(bahrain);
        console.log('Bahrain added.');
    } else {
        console.log('Bahrain already exists.');
    }

    fs.writeFileSync(path, JSON.stringify(json), 'utf8');

} catch (err) {
    console.error(err);
}
