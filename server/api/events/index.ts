import { loadEvents } from '../../utils/events/loader';

export default defineEventHandler(async (event) => {
    const events = await loadEvents();
    return events;
});
