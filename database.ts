import {
    Collection,
    Database,
    MongoClient,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Logger } from "https://deno.land/x/optic@1.3.5/mod.ts";
import { MetricSchema } from "./metric-schema.ts";

export default class DatabaseService {
    host = Deno.env.get("DATABASE_HOST") || null;
    username = Deno.env.get("DATABASE_USERNAME") || null;
    password = Deno.env.get("DATABASE_PASSWORD") || null;
    basebase = Deno.env.get("DATABASE_NAME") || null;
    client: MongoClient;
    logger: Logger;

    // Collections
    declare _metrics: Collection<MetricSchema>;
    declare db: Database;

    constructor() {
        this.client = new MongoClient();
        this.logger = new Logger();
    }

    async connect() {
        await this.client.connect(
            `mongodb+srv://${this.username}:${this.password}@${this.basebase}.${this.host}/?authMechanism=SCRAM-SHA-1`
        );

        this.logger.info("Connected to database");
    }

    async link_collections() {
        const db = this.client.database("test");

        this._metrics = await db.collection<MetricSchema>("metrics");

        this.logger.info("Collections linked");
    }

    get metrics() {
        return this._metrics;
    }
}
