
import { defineEventHandler, sendStream, createError } from 'h3';
import { createReadStream, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import mime from 'mime-types';

export default defineEventHandler(async (event) => {
    // Get the path from the request URL params
    // Route is /evidence/[...path] so event.context.params.path is the string
    const pathParam = event.context.params?.path || '';

    // Construct absolute path to data/evidence
    // We assume the app root is where package.json is, data is adjacent to server/
    const dataEvidenceDir = resolve(process.cwd(), 'data', 'evidence');
    const filePath = join(dataEvidenceDir, pathParam);

    // Security check: ensure filePath is inside dataEvidenceDir to prevent traversal
    if (!filePath.startsWith(dataEvidenceDir)) {
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
