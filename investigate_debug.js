
import fs from 'fs';

async function investigate(url) {
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const text = await response.text();

        const index = text.indexOf('signatureCount');
        if (index !== -1) {
            console.log('--- CONTEXT START ---');
            console.log(text.substring(index - 100, index + 300));
            console.log('--- CONTEXT END ---');
        } else {
            console.log('signatureCount NOT FOUND');
            // Try "total_signatures"
            const index2 = text.indexOf('total_signatures');
            if (index2 !== -1) {
                console.log('--- TOT_SIG CONTEXT START ---');
                console.log(text.substring(index2 - 100, index2 + 300));
                console.log('--- TOT_SIG CONTEXT END ---');
            }
        }

    } catch (e) {
        console.error(e);
    }
}

investigate("https://www.change.org/p/deport-leila-khatami-end-islamic-regime-privilege");
