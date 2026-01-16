import { type Evidence } from '~/types/incident';

export const useEvidence = () => {
    // Eagerly load all evidence files.
    // In a larger app, we could optimize this or use a server endpoint.
    const evidenceFiles = import.meta.glob('~/data/evidence/**/*.yaml', { eager: true });

    const fetchEvidenceById = (id: string): Evidence | null => {
        // Since we are looking for a file named <id>.yaml

        const matchPath = Object.keys(evidenceFiles).find(path => {
            const parts = path.split('/');
            const filename = parts[parts.length - 1];
            // Removing .yaml extension
            const fileId = filename.replace('.yaml', '');
            return fileId === id;
        });

        if (matchPath) {
            const mod = evidenceFiles[matchPath] as any;
            const data = mod.default || mod;

            // Inject the ID from the filename at runtime
            const parts = matchPath.split('/');
            const filename = parts[parts.length - 1];
            const derivedId = filename.replace('.yaml', '');

            return {
                ...data,
                id: derivedId
            } as Evidence;
        }

        console.warn(`Evidence with ID ${id} not found.`);
        return null;
    };

    return {
        fetchEvidenceById
    };
};
