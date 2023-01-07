export type SyncRequest = {
    data: {
        metrics: {
            name: string;
            units: string;
            data: {
                date: string;
                source: string | null;
                qty: number;
            }[];
        }[];
    };
};
