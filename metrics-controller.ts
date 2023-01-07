import { Context } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { MetricSchema } from "./metric-schema.ts";
import { SyncRequest } from "./types/sync-request.ts";

export default class MetricController {
    constructor() {
        console.log("Metric controller initialized");
    }

    /**
     * Sync metrics
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async sync(context: Context) {
        console.log(context.req.headers);

        console.log("Syncing metrics");

        const json: SyncRequest =
            (await context.req.json()) as unknown as SyncRequest;

        if (!json?.data?.metrics) {
            console.error("WRONG datastructure, No metrics provided");

            return await context.json(
                { message: "WRONG datastructure, No metrics provided" },
                400
            );
        }

        json.data.metrics.forEach((metric) => {
            metric.data.forEach(async (data) => {
                const existingMetric = await MetricSchema.where(
                    "name",
                    metric.name
                )
                    .where("created_at", data.date)
                    .first();

                if (existingMetric) {
                    existingMetric.qty = data.qty;
                    existingMetric.source = data.source;

                    await existingMetric.update();
                } else {
                    await MetricSchema.create([
                        {
                            name: metric.name,
                            units: metric.units,
                            created_at: new Date(data.date.split(" ")[0]),
                            source: data.source,
                            qty: data.qty,
                        },
                    ]);
                }
            });
        });

        return await context.json({ message: `Synced metrics` }, 200);
    }

    /**
     * Return all metrics
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async all(context: Context) {
        console.log("Returning all metrics");

        const all = await await await MetricSchema.all();

        return await context.json(all, 200);
    }
}
