import { Context } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { Logger } from "https://deno.land/x/optic@1.3.5/mod.ts";
import DatabaseService from "./database.ts";
import { SyncRequest } from "./types/sync-request.ts";

export default class MetricController {
    db: DatabaseService;
    logger: Logger;

    constructor() {
        this.logger = new Logger();
        this.db = new DatabaseService();

        this.logger.info("Metric controller initialized");
    }

    /**
     * Sync metrics
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async sync(context: Context) {
        this.logger.info("Syncing metrics");

        const json: SyncRequest =
            (await context.req.json()) as unknown as SyncRequest;

        if (!json?.data?.metrics) {
            this.logger.error("No metrics provided");

            return await context.json(
                { message: "WRONG datastructure, No metrics provided" },
                400
            );
        }

        let insertedCount = 0;
        let updatedCount = 0;

        await Promise.all(
            json.data.metrics.map(async (metric) => {
                await Promise.all(
                    metric.data.map(async (data) => {
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

                            updatedCount++;

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

                            insertedCount++;

                            this.logger.info(
                                `Inserted metric with id: ${insertId}`
                            );
                        }
                    })
                );
            })
        );

        return await context.json(
            {
                message: `Synced metrics`,
                inserted: insertedCount,
                updated: updatedCount,
            },
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
        this.logger.info("Returning all metrics");

        const all = await this.db.metrics.find().toArray();

        return await context.json(all, 200);
    }

    /**
     * Return all metrics for last 7 days
     *
     * @param context
     *
     * @returns {Promise<Context>}
     */
    async week(context: Context) {
        this.logger.info("Returning all metrics for last 7 days");

        const metrics = await this.db.metrics
            .find({
                created_at: {
                    $gte: new Date(
                        new Date().setDate(new Date().getDate() - 7)
                    ),
                },
            })
            .toArray();

        return await context.json(metrics, 200);
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
