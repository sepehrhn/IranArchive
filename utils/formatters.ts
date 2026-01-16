import { type DateRange, type IncidentSeverity } from '~/types/incident';

// Custom formatter for YYYY/MM/DD
function formatDateStyle(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
}

export function formatDate(dateStr?: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        // Ignore options to enforce consistent yy/mm/dd
        return formatDateStyle(date);
    } catch (e) {
        return dateStr;
    }
}

export function formatDateTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const datePart = formatDateStyle(date);
        const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
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
