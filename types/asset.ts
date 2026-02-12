export interface Asset {
    id: string;
    type: 'poster' | 'other';
    file: string; // relative path from data/assets/ usually
    format: string;
    source_url: string;

    countries: string[]; // ISO2 codes or []

}
