/**
 * PRISM Backend — Express Application Entry Point
 *
 * AI-powered DeFi strategy engine on Initia Chain.
 * REST API on port 3001, WebSocket on port 3002.
 * Swagger docs at /api/docs.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import swaggerUi from "swagger-ui-express";

// Config
import { config } from "./config";
import { swaggerSpec } from "./config/swagger";

// Routes (existing)
import healthRouter from "./routes/health";
import opportunitiesRouter from "./routes/opportunities";
import positionsRouter from "./routes/positions";
import portfolioRouter from "./routes/portfolio";
import leaderboardRouter from "./routes/leaderboard";

// Routes (new modules)
import stakeRouter from "./routes/stake";
import airdropsRouter from "./routes/airdrops";
import bridgeRouter from "./routes/bridge";
import sessionRouter from "./routes/session";
import insightsRouter from "./routes/insights";

// Background Jobs
import { syncOpportunities } from "./jobs/syncOpportunities";
import { syncPositions } from "./jobs/syncPositions";
import { updateLeaderboard } from "./jobs/updateLeaderboard";

// WebSocket
import { startWebSocketServer } from "./services/websocket";

// ─── Express App ────────────────────────────────────────────────────────────

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} → ${_res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ─── Swagger Docs ───────────────────────────────────────────────────────────

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "PRISM DeFi API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

// ─── API Routes ─────────────────────────────────────────────────────────────

app.use("/health", healthRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/leaderboard", leaderboardRouter);

// New modules
app.use("/api/stake", stakeRouter);
app.use("/api/airdrops", airdropsRouter);
app.use("/api/bridge", bridgeRouter);
app.use("/api/session", sessionRouter);
app.use("/api/insights", insightsRouter);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "PRISM DeFi Backend",
    version: "2.0.0",
    description: "AI-Powered DeFi Strategy Engine on Initia Chain",
    docs: "/api/docs",
    websocket: `ws://localhost:${config.wsPort}`,
    endpoints: {
      health: "GET /health",
      docs: "GET /api/docs",
      portfolio: "GET /api/portfolio/:address",
      opportunities: "GET /api/opportunities",
      positions: "GET /api/positions/:address",
      leaderboard: "GET /api/leaderboard",
      stakeAPY: "GET /api/stake/apy",
      stakePosition: "GET /api/stake/position/:address",
      stakeETH: "POST /api/stake/eth",
      airdrops: "GET /api/airdrops",
      airdropProgress: "GET /api/airdrops/:address",
      airdropStep: "POST /api/airdrops/step",
      bridge: "POST /api/bridge",
      bridgeStatus: "GET /api/bridge/:txHash",
      sessionCreate: "POST /api/session/create",
      sessionExecute: "POST /api/session/execute",
      sessionList: "GET /api/session/list/:address",
      insights: "GET /api/insights/:address",
      insightsChat: "POST /api/insights/chat",
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "The requested endpoint does not exist. See /api/docs for available endpoints.",
    statusCode: 404,
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ERROR]", err.message, err.stack);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  });
});

// ─── Background Jobs ────────────────────────────────────────────────────────

function startCronJobs() {
  console.log("[cron] Registering background jobs...");

  // Sync opportunities every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    console.log("[cron] Triggering syncOpportunities");
    syncOpportunities().catch((err) =>
      console.error("[cron] syncOpportunities failed:", err)
    );
  });

  // Sync positions every 2 minutes
  cron.schedule("*/2 * * * *", () => {
    console.log("[cron] Triggering syncPositions");
    syncPositions().catch((err) =>
      console.error("[cron] syncPositions failed:", err)
    );
  });

  // Update leaderboard every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    console.log("[cron] Triggering updateLeaderboard");
    updateLeaderboard().catch((err) =>
      console.error("[cron] updateLeaderboard failed:", err)
    );
  });

  console.log("[cron] Background jobs registered:");
  console.log("  • syncOpportunities — every 5 min");
  console.log("  • syncPositions     — every 2 min");
  console.log("  • updateLeaderboard — every 10 min");
}

// ─── Server Startup ─────────────────────────────────────────────────────────

async function main() {
  console.log("━".repeat(60));
  console.log("  PRISM Backend — AI-Powered DeFi on Initia Chain");
  console.log("━".repeat(60));

  // Start the HTTP server
  app.listen(config.port, () => {
    console.log(`\n✓ REST API listening on http://localhost:${config.port}`);
    console.log(`✓ Swagger docs at http://localhost:${config.port}/api/docs`);
    console.log(`✓ CORS origin: ${config.corsOrigin}`);
    console.log(`✓ Environment: ${config.nodeEnv}`);
  });

  // Start WebSocket server
  startWebSocketServer();
  console.log(`✓ WebSocket server on ws://localhost:${config.wsPort}`);

  // Register cron jobs
  startCronJobs();

  // Run initial sync on startup (non-blocking)
  console.log("\n[startup] Running initial data sync...");
  syncOpportunities().catch((err) =>
    console.error("[startup] Initial syncOpportunities failed:", err)
  );
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export default app;
