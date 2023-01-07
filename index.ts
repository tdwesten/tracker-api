import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.6.2/mod.ts";
// import { bearerAuth } from "https://deno.land/x/hono@v2.6.2/middleware.ts";
import MetricController from "./metrics-controller.ts";
import DatabaseService from "./database.ts";
import Logger from "https://deno.land/x/logger@v1.0.2/logger.ts";

const logger = new Logger();

logger.info("Starting server");

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

// Routes
// app.use("*", bearerAuth({ token }));
app.post("/sync", (c) => metricController.sync(c));
app.get("/metrics", (c) => metricController.all(c));

// Start server
serve(app.fetch);
