import { defineEventHandler, sendStream } from 'h3';
import { createReadStream, existsSync } from 'fs';
import { resolve } from 'path';
import fs from 'fs';

export default defineEventHandler(async (event) => {
    const slug = event.context.params?.slug;
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing file path' });
    }

    // Determine the path in the data/evidence directory
    // We expect the URL to be /evidence/2026/01/video.mp4, so slug is "2026/01/video.mp4"
    const safeSlug = slug;

    // Construct absolute path. Note: in production (bundled), managing data dir might be different.
    // For local dev and "prerender" copy logic, we look at the source.
    const filePath = resolve(process.cwd(), 'data', 'evidence', safeSlug);

    if (!existsSync(filePath)) {
        throw createError({ statusCode: 404, statusMessage: 'File not found' });
    }

    const { size } = fs.statSync(filePath);

    // Basic Mime type handling could be improved, but serve-static usually handles it.
    // Here we just stream.
    // const stream = createReadStream(filePath);
    // return sendStream(event, stream);

    return sendStream(event, createReadStream(filePath));
});
