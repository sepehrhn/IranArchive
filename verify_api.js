
async function verify() {
    const fullUrl = "https://www.change.org/p/deport-leila-khatami-end-islamic-regime-privilege/exp/cl_/cl_sharecopy_490983367_en-GB/9/741741874?utm_source=share_petition&utm_campaign=psf_combo_share_initial&utm_term=psf_promote_or_share&utm_medium=copylink&utm_content=cl_sharecopy_490983367_en-GB%3A9";
    const url = `http://localhost:3000/api/campaign-stats?url=${encodeURIComponent(fullUrl)}`;
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log("Status:", res.status);
        if (json._debug_snippet) {
            const fs = await import('fs');
            fs.writeFileSync('debug_output.html', json._debug_snippet);
            console.log("Wrote debug output to debug_output.html");
        }
        console.log("Signatures:", json.signatures);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
verify();
