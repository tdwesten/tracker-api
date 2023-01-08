import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { bearerAuth } from "https://deno.land/x/hono@v2.6.2/middleware.ts";
import MetricController from "./metrics-controller.ts";
import DatabaseService from "./database.ts";
import { Logger } from "https://deno.land/x/optic@1.3.5/mod.ts";
import { prettyJSON } from "https://deno.land/x/hono/middleware.ts";

const logger = new Logger();

// Get token from env
const token = Deno.env.get("TOKEN") ? Deno.env.get("TOKEN") : false;

// check if token is provided
if (!token) {
    logger.error("No token provided");
    Deno.exit(1);
}

// Init database
new DatabaseService();

// Init controllers
const metricController = new MetricController();

// Init app/server
const app = new Hono();

// Middleware
app.use("/api/*", bearerAuth({ token })); // Auth
app.use("*", prettyJSON()); // Pretty JSON

// Routes
app.get("/", (c) =>
    c.json({
        title: "Tracker API",
        description: "API for the tracker app, see twitter tread for more info",
        twitter_tread:
            "https://twitter.com/tdwesten/status/1611803663441313795",
        author: "Thomas van der Westen",
        twitter: "https://twitter.com/tdwesten",
        repo: "https://github.com/tdwesten/tracker-api",
    })
);
app.post("/api/sync", (c) => metricController.sync(c));
app.get("/api/metrics", (c) => metricController.all(c));

// Start server
serve(app.fetch);
