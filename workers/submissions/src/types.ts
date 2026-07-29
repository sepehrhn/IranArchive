export interface Env {
    SUBMISSIONS_BUCKET: R2Bucket;
    SUBMISSIONS_KV: KVNamespace;
    TURNSTILE_SECRET_KEY: string;
    GH_DISPATCH_TOKEN: string;
    ALLOWED_ORIGINS: string;
    GH_REPO_OWNER: string;
    GH_REPO_NAME: string;
}

export type SubmissionKind = 'incident' | 'victim' | 'evidence';

export interface FileInfo {
    name: string;
    size: number;
    mime: string;
    sha256: string;
}

export interface InitRequest {
    turnstileToken: string;
    kind: SubmissionKind;
    files: FileInfo[];
}

export interface InitResponse {
    submissionId: string;
    uploads: Array<{
        key: string;
        putUrl: string;
        fileName: string;
    }>;
}

export interface CompleteRequest {
    submissionId: string;
    turnstileToken: string;
    kind: SubmissionKind;
    payload: any;
    uploadedFiles: Array<{
        key: string;
        sha256: string;
        originalName: string;
        mime: string;
        size: number;
    }>;
}

export interface CompleteResponse {
    ok: boolean;
    submissionId: string;
}

export interface SubmissionRecord {
    id: string;
    kind: SubmissionKind;
    status: 'init' | 'completed' | 'dispatched';
    createdAt: string;
    ipHash: string;
    files: FileInfo[];
    completedAt?: string;
}
