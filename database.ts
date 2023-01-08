import {
    Database,
    PostgresConnector,
} from "https://deno.land/x/denodb@v1.1.0/mod.ts";
import { MetricSchema } from "./metric-schema.ts";

export default class DatabaseService {
    database: Database;
    connector: PostgresConnector;

    host = Deno.env.get("DATABASE_HOST") || "";
    username = Deno.env.get("DATABASE_USERNAME") || "";
    password = Deno.env.get("DATABASE_PASSWORD") || "";

    constructor() {
        this.connector = new PostgresConnector({
            host: this.host,
            username: this.username,
            password: this.password,
            database: "postgres",
        });

        // init database
        this.database = new Database(this.connector, true);

        // link models to database

        this.database.link([MetricSchema]);

        // sync models to database
        this.database.sync();

        console.log("Database initialized");
    }
}
