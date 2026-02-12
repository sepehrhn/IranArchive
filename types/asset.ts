export interface Asset {
    id: string;
    type: 'poster' | 'other';
    file: string; // relative path from data/assets/ usually
    size: string;
    format: string;
    source_url: string;

    countries: string[]; // ISO2 codes or []

}
