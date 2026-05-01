import express from "express";
import cors from "cors";
import opportunitiesRouter from "./routes/opportunities.js";
import positionsRouter from "./routes/positions.js";
import leaderboardRouter from "./routes/leaderboard.js";
import portfolioRouter from "./routes/portfolio.js";
import healthRouter from "./routes/health.js";

export function createApp() {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.use(healthRouter);
  app.use(opportunitiesRouter);
  app.use(positionsRouter);
  app.use(portfolioRouter);
  app.use(leaderboardRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(500).json({
        error: "internal_server_error",
        message: err.message,
      });
    }
  );

  return app;
}
