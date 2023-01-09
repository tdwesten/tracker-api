export interface Metric {
    _id: string;
    hash: string;
    name: string;
    units: string;
    qty: number;
    source: string | null;
    created_at: Date;
    updated_at: Date;
}
