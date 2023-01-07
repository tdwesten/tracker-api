import {
    Database,
    SQLite3Connector,
} from "https://deno.land/x/denodb@v1.1.0/mod.ts";
import { MetricSchema } from "./metric-schema.ts";

export default class DatabaseService {
    database: Database;
    connector: SQLite3Connector;

    constructor() {
        this.connector = new SQLite3Connector({
            filepath: "./database.sqlite",
        });

        this.database = new Database(this.connector, true);

        // link models to database

        this.database.link([MetricSchema]);

        // sync models to database
        this.database.sync();
    }
}
