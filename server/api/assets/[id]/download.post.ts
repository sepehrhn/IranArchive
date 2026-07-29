import { defineEventHandler, createError } from 'h3';
// Auto-imported by Nuxt/Nitro
// import { incrementDownloadCount } from '../../../utils/assetStats';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing asset ID' });
    }

    try {
        const newCount = incrementDownloadCount(id);
        return { success: true, new_count: newCount };
    } catch (e) {
        console.error(`Failed to update download count for ${id}:`, e);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});
