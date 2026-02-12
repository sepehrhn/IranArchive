import { defineEventHandler, sendStream, createError } from 'h3';
import { createReadStream, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import mime from 'mime-types';

export default defineEventHandler(async (event) => {
    const kind = event.context.params?.kind;
    const pathParam = event.context.params?.path || '';

    let baseDir: string;
    switch (kind) {
        case 'victim_photo':
            baseDir = resolve(process.cwd(), 'data/victims/img');
            break;

        case 'evidence':
            baseDir = resolve(process.cwd(), 'data/evidences');
            break;

        case 'asset':
            baseDir = resolve(process.cwd(), 'data/assets');
            break;
        default:
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid media kind'
            });
    }

    const filePath = resolve(baseDir, pathParam);

    // Security check: ensure filePath is inside baseDir to prevent traversal
    const normalizedFilePath = filePath.toLowerCase();
    const normalizedBaseDir = baseDir.toLowerCase();

    if (!normalizedFilePath.startsWith(normalizedBaseDir)) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden'
        });
    }

    if (!existsSync(filePath)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'File not found'
        });
    }

    const stat = statSync(filePath);
    if (!stat.isFile()) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not a file'
        });
    }

    // Set Content-Type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    event.node.res.setHeader('Content-Type', mimeType);
    event.node.res.setHeader('Content-Length', stat.size);

    // Serve file
    return sendStream(event, createReadStream(filePath));
});
