import { type DateRange, type IncidentSeverity } from '../types/incident';

// Custom formatter for MMM D, YYYY (e.g., Jan 16, 2026)
function formatDateStyle(date: Date, locale: string = 'en'): string {
    if (locale === 'fa') {
        const formatter = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', calendar: 'persian' });
        const parts = formatter.formatToParts(date);

        let year = '';
        let month = '';
        let day = '';

        parts.forEach(p => {
            if (p.type === 'year') year = p.value;
            if (p.type === 'month') month = p.value;
            if (p.type === 'day') day = p.value;
        });

        // Convert Persian digits to English to do math
        const englishYear = parseInt(year.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()));

        // Add 1180 to Solar Hijri to get Kingdom (Shahanshahi) year
        // 1404 + 1180 = 2584
        const kingdomYear = englishYear + 1180;

        // Convert back to Persian digits
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const finalYear = kingdomYear.toString().replace(/\d/g, d => persianDigits[parseInt(d)]);

        return `\u202A${day} ${month}\u200E ${finalYear}\u202C`;
    }
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatDate(dateStr?: string, locale: string = 'en'): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return formatDateStyle(date, locale);
    } catch (e) {
        return dateStr;
    }
}

export function formatDateTime(dateStr?: string, locale: string = 'en'): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const datePart = formatDateStyle(date, locale);
        let timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (locale === 'fa') {
            // Convert time digits to Persian
            const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            timePart = timePart.replace(/\d/g, d => persianDigits[parseInt(d)]);
        }

        return `${datePart} ${timePart}`;
    } catch (e) {
        return dateStr;
    }
}

export function formatRange(range: DateRange): string {
    let start = formatDate(range.start);
    if (range.start_time) {
        start += ` ${range.start_time}`;
    }

    if (!range.end) return start;

    let end = formatDate(range.end);
    if (range.end_time) {
        end += ` ${range.end_time}`;
    }

    return `${start} - ${end}`;
}

export function formatSeverity(severity: IncidentSeverity): string {
    const parts = [];
    if (severity.deaths) {
        const { min, max } = severity.deaths;
        if (min && max) parts.push(`${min}-${max} Deaths`);
        else if (min) parts.push(`${min}+ Deaths`);
        else if (max) parts.push(`Up to ${max} Deaths`);
    }

    if (severity.injured) {
        const { min, max } = severity.injured;
        if (min || max) parts.push(`${min ? min + '+' : ''} Injured`);
    }

    if (severity.arrests) {
        const { min, max } = severity.arrests;
        if (min || max) parts.push(`${min ? min + '+' : ''} Arrests`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No casualty data';
}

export function formatStatus(status: string): string {
    if (!status) return '';
    // Replace underscores with spaces and capitalize words
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'verified': return 'success';
        case 'disputed': return 'warn';
        case 'not_verified': return 'danger';
        default: return 'secondary';
    }
}
