import { loadEvents } from '../../../utils/events/loader';

export default defineEventHandler(async (event) => {
    const allEvents = await loadEvents();
    // Filter only upcoming and ongoing for the subscription feed
    const activeEvents = allEvents.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state));

    // Helper to parse event date from YAML structure
    const parseEventDate = (dateStr: string, timeStr?: string | null): Date => {
        const d = new Date(dateStr + (timeStr ? ' ' + timeStr : ''));
        return d;
    };

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IranArchive//Events Feed//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Iran Archive Events',
        'X-WR-TIMEZONE:UTC',
    ];

    for (const ev of activeEvents) {
        const startDate = parseEventDate(ev.date.start, ev.date.start_time);
        const start = formatDate(startDate);

        let endDate: Date;
        if (ev.date.end) {
            endDate = parseEventDate(ev.date.end, ev.date.end_time);
        } else {
            // Default to 1 hour after start if no end time specified
            endDate = new Date(startDate.getTime() + 3600000);
        }
        const end = formatDate(endDate);

        const description = `
${ev.summary}

Organizer: ${ev.organizer.name}
Link: https://iranarchive.net/events/${ev.id}

${ev.description || ''}
`.trim();

        const location = ev.format === 'online' ? 'Online' : `${ev.location?.address || ''}, ${ev.location?.city || ''}, ${ev.location?.country || ''}`.trim();

        lines.push(
            'BEGIN:VEVENT',
            `UID:${ev.id}@iranarchive.net`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${ev.title}`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            `LOCATION:${location}`,
            'END:VEVENT'
        );
    }

    lines.push('END:VCALENDAR');

    setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8');
    setHeader(event, 'Content-Disposition', 'attachment; filename="events.ics"');

    return lines.join('\r\n');
});
