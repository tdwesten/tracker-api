import { Context } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { MetricSchema } from "./metric-schema.ts";
import Logger from "https://deno.land/x/logger@v1.0.2/logger.ts";
import { SyncRequest } from "./types/sync-request.ts";

export default class MetricController {
    log: Logger;

    constructor() {
        this.log = new Logger();
    }

    /**
     * Sync metrics
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async sync(context: Context) {
        const json: SyncRequest =
            (await context.req.json()) as unknown as SyncRequest;

        let counter = 0;

        json.data.metrics.forEach((metric) => {
            this.log.info(`Syncing metric ${metric.name}`);

            metric.data.forEach(async (data) => {
                const existingMetric = await MetricSchema.where(
                    "name",
                    metric.name
                )
                    .where("created_at", data.date)
                    .first();

                if (existingMetric) {
                    this.log.info(`Metric ${metric.name} already exists`);

                    existingMetric.qty = data.qty;
                    existingMetric.source = data.source;

                    await existingMetric.update();
                } else {
                    this.log.info(`Metric ${metric.name} does not exist`);

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
                counter++;
            });
        });

        this.log.info(`Synced ${counter} metrics`);

        return await context.json(
            { message: `Synced ${counter} metrics` },
            200
        );
    }

    /**
     * Return all metrics
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async all(context: Context) {
        const all = await await await MetricSchema.all();

        return await context.json(all, 200);
    }
}
