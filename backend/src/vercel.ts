/**
 * Vercel Serverless Entry Point
 * Exports the Express app for Vercel's @vercel/node runtime.
 * Background jobs and WebSocket are disabled in serverless mode.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger";

// Routes
import healthRouter from "./routes/health";
import opportunitiesRouter from "./routes/opportunities";
import positionsRouter from "./routes/positions";
import portfolioRouter from "./routes/portfolio";
import leaderboardRouter from "./routes/leaderboard";
import stakeRouter from "./routes/stake";
import airdropsRouter from "./routes/airdrops";
import bridgeRouter from "./routes/bridge";
import sessionRouter from "./routes/session";
import insightsRouter from "./routes/insights";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "PRISM DeFi API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

// Routes
app.use("/health", healthRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/stake", stakeRouter);
app.use("/api/airdrops", airdropsRouter);
app.use("/api/bridge", bridgeRouter);
app.use("/api/session", sessionRouter);
app.use("/api/insights", insightsRouter);

// Root
app.get("/", (_req, res) => {
  res.json({
    name: "PRISM DeFi Backend",
    version: "2.0.0",
    description: "AI-Powered DeFi Strategy Engine on Initia Chain",
    docs: "/api/docs",
    endpoints: {
      health: "GET /health",
      portfolio: "GET /api/portfolio/:address",
      stakeAPY: "GET /api/stake/apy",
      airdrops: "GET /api/airdrops",
      bridge: "POST /api/bridge",
      insights: "GET /api/insights/:address",
      insightsChat: "POST /api/insights/chat",
    },
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Endpoint not found. See /api/docs", statusCode: 404 });
});

export default app;
