import { loadEvents } from '../../../utils/events/loader';

export default defineEventHandler(async (event) => {
    const allEvents = await loadEvents();
    // Filter only upcoming and ongoing for the subscription feed
    const activeEvents = allEvents.filter(e => ['upcoming', 'ongoing'].includes(e.computed_state));

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
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
        const start = formatDate(ev.start_at);
        const end = ev.end_at ? formatDate(ev.end_at) : formatDate(new Date(new Date(ev.start_at).getTime() + 3600000).toISOString());

        const description = `
${ev.summary}

Organizer: ${ev.organizer.name}
Link: https://iranarchive.net/events/${ev.id}

${ev.description || ''}
`.trim();

        const location = ev.format === 'online' ? 'Online' : `${ev.location?.venue_name || ''} ${ev.location?.address || ''}, ${ev.location?.city || ''}, ${ev.location?.country || ''}`;

        lines.push(
            'BEGIN:VEVENT',
            `UID:${ev.id}@iranarchive.net`,
            `DTSTAMP:${formatDate(new Date().toISOString())}`,
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
