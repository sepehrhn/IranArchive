/**
 * Extracts a readable source name from a URL.
 * @param url The URL to parse
 * @returns A formatted source name (e.g., "X", "YouTube", "Iranintl") or the original URL if parsing fails.
 */
export function formatSourceName(url: string): string {
    let label = 'Source';
    try {
        const u = new URL(url);
        let hostname = u.hostname.replace('www.', '');

        // Special cases
        if (hostname === 'x.com' || hostname === 'twitter.com') return 'X';
        if (hostname === 'instagram.com') return 'Instagram';
        if (hostname === 'youtube.com' || hostname === 'youtu.be') return 'YouTube';
        if (hostname === 'facebook.com') return 'Facebook';
        if (hostname === 't.me') return 'Telegram';
        if (hostname === 'linkedin.com') return 'LinkedIn';

        // General case: Capitalize the first part of the domain
        // e.g. iranintl.com -> Iranintl
        const parts = hostname.split('.');
        if (parts.length > 0) {
            label = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        } else {
            label = hostname;
        }
    } catch (e) {
        // Fallback for non-URL strings or invalid URLs
        label = url;
    }
    return label;
}
