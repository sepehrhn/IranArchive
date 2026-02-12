/**
 * Submissions API Client
 * 
 * Handles communication with the Cloudflare Workers submission gateway.
 * Implements 2-step upload: init → upload files to R2 → complete
 */

export type SubmissionKind = 'incident' | 'victim' | 'event';

export interface FileInfo {
    name: string;
    size: number;
    mime: string;
    sha256: string;
}

export interface UploadedFileInfo extends FileInfo {
    key: string;
    originalName: string;
}

export interface InitUploadParams {
    turnstileToken: string;
    files: Omit<FileInfo, 'sha256'>[];
    kind: SubmissionKind;
}

export interface InitUploadResponse {
    submissionId: string;
    uploads: Array<{
        key: string;
        putUrl: string;
        fileName: string;
    }>;
}

export interface CompleteSubmissionParams {
    submissionId: string;
    kind: SubmissionKind;
    payload: any;
    uploadedFiles: UploadedFileInfo[];
    turnstileToken: string;
}

export interface CompleteSubmissionResponse {
    ok: boolean;
    submissionId: string;
}

/**
 * Calculate SHA-256 hash of a file using Web Crypto API
 */
export async function calculateSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Initialize file upload and get presigned URLs
 */
export async function initUpload(params: InitUploadParams): Promise<InitUploadResponse> {
    const config = useRuntimeConfig();
    const baseUrl = config.public.submissionApiBase || 'https://iranarchive-submissions.sepehrhadaeghnia.workers.dev';

    // Calculate SHA-256 for all files
    const filesWithHash: FileInfo[] = [];
    for (const file of params.files) {
        filesWithHash.push(file as FileInfo);
    }

    const response = await $fetch<InitUploadResponse>(`${baseUrl}/api/submissions/init`, {
        method: 'POST',
        body: {
            turnstileToken: params.turnstileToken,
            kind: params.kind,
            files: filesWithHash
        },
        onRequest({ request, options }) {
            console.log('Client: initUpload request', request);
        },
        onResponseError({ request, response, options }) {
            console.error('Client: initUpload error', response);
        }
    });

    return response;
}

/**
 * Complete submission after files are uploaded
 */
export async function completeSubmission(params: CompleteSubmissionParams): Promise<CompleteSubmissionResponse> {
    const config = useRuntimeConfig();
    const baseUrl = config.public.submissionApiBase || 'https://iranarchive-submissions.sepehrhadaeghnia.workers.dev';

    const response = await $fetch<CompleteSubmissionResponse>(`${baseUrl}/api/submissions/complete`, {
        method: 'POST',
        body: {
            submissionId: params.submissionId,
            turnstileToken: params.turnstileToken,
            kind: params.kind,
            payload: params.payload,
            uploadedFiles: params.uploadedFiles
        }
    });

    return response;
}

/**
 * Upload file to R2 using presigned URL
 */
export async function uploadToR2(file: File, putUrl: string): Promise<void> {
    const config = useRuntimeConfig();
    const baseUrl = config.public.submissionApiBase || 'https://iranarchive-submissions.sepehrhadaeghnia.workers.dev';

    // If putUrl is relative, prepend baseUrl
    const url = putUrl.startsWith('http') ? putUrl : `${baseUrl}${putUrl}`;

    const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, kind: SubmissionKind): { valid: boolean; error?: string } {
    const MAX_SIZE = 90 * 1024 * 1024; // 90MB

    // Check size
    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${Math.round(MAX_SIZE / 1024 / 1024)}MB`
        };
    }

    // Check MIME type
    const allowedTypes: Record<SubmissionKind, string[]> = {
        victim: ['image/jpeg', 'image/png', 'image/webp'],
        incident: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf'
        ],
        event: [], // No files for events

    };

    const allowed = allowedTypes[kind];
    if (allowed.length > 0 && !allowed.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${allowed.map(t => t.split('/')[1]).join(', ')}`
        };
    }

    return { valid: true };
}
