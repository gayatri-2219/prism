/**
 * Health Check Route
 * GET /health
 */

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isChainReachable } from "../services/initiaRPC";
import { HealthStatus } from "../types";

const router = Router();
const prisma = new PrismaClient();
const startTime = Date.now();

router.get("/", async (_req: Request, res: Response) => {
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let chainStatus: "reachable" | "unreachable" = "unreachable";

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  // Check chain reachability
  try {
    const reachable = await isChainReachable();
    chainStatus = reachable ? "reachable" : "unreachable";
  } catch {
    chainStatus = "unreachable";
  }

  const overallStatus: HealthStatus["status"] =
    dbStatus === "connected" && chainStatus === "reachable"
      ? "ok"
      : dbStatus === "connected" || chainStatus === "reachable"
        ? "degraded"
        : "error";

  const response: HealthStatus = {
    status: overallStatus,
    db: dbStatus,
    chain: chainStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  const statusCode = overallStatus === "ok" ? 200 : overallStatus === "degraded" ? 200 : 503;
  res.status(statusCode).json(response);
});

export default router;
