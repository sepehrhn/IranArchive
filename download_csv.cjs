const fs = require('fs');
const https = require('https');
const path = require('path');

const csvUrl = 'https://iranvictims.com/victims.csv';
const htmlUrl = 'https://iranvictims.com/';

const csvPath = path.join(__dirname, 'victims.csv');
const htmlPath = path.join(__dirname, 'source.html');

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function main() {
    console.log('Downloading victims.csv...');
    await download(csvUrl, csvPath);
    console.log('Saved victims.csv');

    console.log('Downloading source.html...');
    await download(htmlUrl, htmlPath);
    console.log('Saved source.html');
}

main().catch(console.error);
