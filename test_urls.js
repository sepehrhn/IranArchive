
async function test() {
    const dirty = "https://www.change.org/p/deport-leila-khatami-end-islamic-regime-privilege/exp/cl_/cl_sharecopy_490983367_en-GB/9/741741874?utm_source=share_petition&utm_campaign=psf_combo_share_initial&utm_term=psf_promote_or_share&utm_medium=copylink&utm_content=cl_sharecopy_490983367_en-GB%3A9";
    const clean = "https://www.change.org/p/deport-leila-khatami-end-islamic-regime-privilege";

    console.log("Testing Dirty URL...");
    await fetchAndLog(dirty);

    console.log("\nTesting Clean URL...");
    await fetchAndLog(clean);
}

async function fetchAndLog(url) {
    try {
        const res = await fetch(url);
        const text = await res.text();
        const sigMatch = text.match(/"signatureCount":\s*(\d+)/);
        console.log(`URL: ${url}`);
        console.log(`SigMatch: ${sigMatch ? sigMatch[1] : 'null'}`);
        console.log(`Length: ${text.length}`);
    } catch (e) {
        console.error(e.message);
    }
}

test();
