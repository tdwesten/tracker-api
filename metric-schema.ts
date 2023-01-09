import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/deps.ts";

export interface MetricSchema {
    _id: ObjectId;
    hash: string;
    name: string;
    units: string;
    qty: number;
    source: string | null;
    created_at: Date;
    updated_at: Date;
}
