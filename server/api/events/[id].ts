import { loadEvents } from '../../utils/events/loader';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const allEvents = await loadEvents();
    const found = allEvents.find(e => e.id === id);

    if (!found) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Event not found'
        });
    }

    return found;
});
