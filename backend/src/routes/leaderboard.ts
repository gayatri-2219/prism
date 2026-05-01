/**
 * Leaderboard Route
 * GET /api/leaderboard — paginated leaderboard of top strategies
 */

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      limit = "20",
      offset = "0",
    } = req.query as Record<string, string | undefined>;

    const take = Math.min(parseInt(limit || "20", 10), 100);
    const skip = Math.max(parseInt(offset || "0", 10), 0);

    const [entries, total] = await Promise.all([
      prisma.leaderboardEntry.findMany({
        orderBy: { rank: "asc" },
        take,
        skip,
      }),
      prisma.leaderboardEntry.count(),
    ]);

    res.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        userAddress: entry.userAddress,
        initUsername: entry.initUsername,
        totalReturn: entry.totalReturn,
        strategyLabel: entry.strategyLabel,
        riskScore: entry.riskScore,
        totalValue: entry.totalValue,
        rank: entry.rank,
        lastUpdated: entry.lastUpdated.toISOString(),
      })),
      total,
    });
  } catch (err) {
    console.error("[leaderboard] Error:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch leaderboard",
      statusCode: 500,
    });
  }
});

export default router;
