const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sourcePath = 'd:\\FreeIran\\source.html';
const victimsDir = 'd:\\FreeIran\\data\\victims';
const imgDir = path.join(victimsDir, 'img');

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// 1. Map names
const victimMap = new Map();
fs.readdirSync(victimsDir).forEach(f => {
    if (!f.endsWith('.yaml')) return;
    const content = fs.readFileSync(path.join(victimsDir, f), 'utf8');
    const match = content.match(/^name:\s*"?([^"\n]+)"?/m);
    if (match) {
        const name = match[1].trim().toLowerCase();
        victimMap.set(name, f);
    }
});
console.log(`Loaded ${victimMap.size} victims.`);

// 2. Parse HTML
if (!fs.existsSync(sourcePath)) {
    console.error('source.html not found!');
    process.exit(1);
}
const html = fs.readFileSync(sourcePath, 'utf8');
const cardChunks = html.split('class="victim-card"');
console.log(`Found ${cardChunks.length - 1} cards.`);

// 3. Prepare Queue
const queue = [];

for (let i = 1; i < cardChunks.length; i++) {
    const chunk = cardChunks[i];
    const nameMatch = chunk.match(/class="victim-name">([^<]+)</);
    if (!nameMatch) continue;
    const lowerName = nameMatch[1].trim().toLowerCase();

    const filename = victimMap.get(lowerName);
    if (!filename) continue;

    const imgMatch = chunk.match(/data-src="([^"]+)"/);
    if (!imgMatch) continue;
    const imgUrl = imgMatch[1];

    if (!imgUrl.startsWith('http')) continue;

    let ext = '.jpg';
    if (imgUrl.includes('.png')) ext = '.png';
    if (imgUrl.includes('.jpeg')) ext = '.jpeg';

    const baseName = filename.replace('.yaml', '');
    const imgFilename = `${baseName}${ext}`;
    const destPath = path.join(imgDir, imgFilename);

    // Check if we need to update YAML even if image exists (in case it wasn't linked)
    // But primarily we want to download if missing.
    queue.push({
        url: imgUrl,
        dest: destPath,
        yamlPath: path.join(victimsDir, filename),
        imgFilename: imgFilename
    });
}

console.log(`${queue.length} images to check/download.`);

// 4. Process Queue with Concurrency
const CONCURRENCY = 30; // 30 concurrent requests
let active = 0;
let index = 0;
let completed = 0;

function downloadFile(url, dest) {
    return new Promise((resolve) => {
        if (fs.existsSync(dest)) return resolve(true); // Skip existing

        const protocol = url.startsWith('https') ? https : http;
        const request = protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(true));
                });
                file.on('error', () => {
                    fs.unlink(dest, () => { });
                    resolve(false);
                });
            } else {
                resolve(false);
            }
        }).on('error', (err) => {
            resolve(false);
        });
    });
}

function updateYaml(item) {
    try {
        let content = fs.readFileSync(item.yamlPath, 'utf8');
        if (!content.includes(`photo: "${item.imgFilename}"`)) {
            const re = /^photo:\s*(""|)?\s*$/m;
            if (re.test(content)) {
                const newContent = content.replace(re, `photo: "${item.imgFilename}"`);
                fs.writeFileSync(item.yamlPath, newContent);
            }
        }
    } catch (e) { }
}

async function worker() {
    while (index < queue.length) {
        const item = queue[index++];
        await downloadFile(item.url, item.dest);
        updateYaml(item);
        completed++;
        if (completed % 50 === 0) console.log(`Progress: ${completed}/${queue.length}`);
    }
}

const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
}

Promise.all(workers).then(() => {
    console.log('Done.');
});
