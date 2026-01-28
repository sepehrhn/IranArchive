const fs = require('fs');
const path = require('path');

const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'houston_event.json'), 'utf8'));
const timeStr = json.event_time;
console.log('Time String:', timeStr);
for (let i = 0; i < timeStr.length; i++) {
    console.log(`Char ${i}: ${timeStr[i]} (${timeStr.charCodeAt(i)})`);
}
