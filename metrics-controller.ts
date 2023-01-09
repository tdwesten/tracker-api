import { Context } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { Logger } from "https://deno.land/x/optic@1.3.5/mod.ts";
import DatabaseService from "./database.ts";
import { SyncRequest } from "./types/sync-request.ts";

export default class MetricController {
    db: DatabaseService;
    logger: Logger;

    constructor() {
        console.log("Metric controller initialized");
        this.logger = new Logger();
        this.db = new DatabaseService();
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
                const hash = `${metric.name}-${date}`;

                const existingMetric = await this.db.metrics.findOne({
                    hash: hash,
                });

                if (existingMetric) {
                    await this.db.metrics.updateOne(
                        { hash: hash },
                        {
                            $set: {
                                qty: data.qty,
                                source: data.source,
                                updated_at: new Date(),
                            },
                        }
                    );

                    this.logger.info(
                        `Updated metric with id: ${existingMetric._id}`
                    );
                } else {
                    const insertId = await this.db.metrics.insertOne({
                        hash: hash,
                        name: metric.name,
                        units: metric.units,
                        created_at: new Date(date),
                        updated_at: new Date(),
                        source: data.source,
                        qty: data.qty,
                    });

                    this.logger.info(`Inserted metric with id: ${insertId}`);
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
        this.logger.info("Returning all metrics");

        const all = await this.db.metrics.find().toArray();

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

        this.logger.info(`Returning metrics for: ${name}`);

        const metrics = await this.db.metrics.find({ name: name }).toArray();

        return await context.json(metrics, 200);
    }
}
