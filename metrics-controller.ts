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
                const date = data.date?.split(" ")[0];
                const id = `${metric.name}-${date}`;

                const existingMetric = await MetricSchema.where(
                    "id",
                    id
                ).first();

                console.log(existingMetric);

                if (existingMetric) {
                    console.log("Updating existing metric");
                    existingMetric.qty = data.qty;
                    existingMetric.source = data.source;

                    await existingMetric.update();
                } else {
                    console.log("Creating new metric");
                    await MetricSchema.create([
                        {
                            id: id,
                            name: metric.name,
                            units: metric.units,
                            created_at: new Date(date),
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

    /**
     * Return metric by name
     *
     * @param context
     *
     * @returns {Promise<Context>}
     *
     * @throws {Error}
     */
    async getByName(context: Context) {
        const name = context.req.param("name");

        if (!name) {
            throw new Error("No name provided");
        }

        console.log(`Returning metrics for: ${name}`);

        const metrics = await MetricSchema.where("name", name).get();

        return await context.json(metrics, 200);
    }
}
