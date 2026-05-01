/**
 * Opportunities Routes
 * GET /api/opportunities        — list with filters
 * GET /api/opportunities/:id    — single opportunity detail
 */

import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/opportunities
 * Query params: ?riskScore=50&type=lend&sort=apy&limit=10
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      riskScore,
      type,
      sort = "apy",
      limit = "20",
    } = req.query as Record<string, string | undefined>;

    // Build filter conditions
    const where: Prisma.OpportunityWhereInput = {
      isActive: true,
    };

    // Risk score filter: match within ±20 range
    if (riskScore) {
      const score = parseInt(riskScore, 10);
      if (!isNaN(score)) {
        where.riskScore = {
          gte: Math.max(1, score - 20),
          lte: Math.min(100, score + 20),
        };
      }
    }

    // Strategy type filter
    if (type) {
      where.strategyType = type;
    }

    // Sort configuration
    const orderBy: Prisma.OpportunityOrderByWithRelationInput = {};
    switch (sort) {
      case "apy":
        orderBy.apy = "desc";
        break;
      case "tvl":
        orderBy.tvl = "desc";
        break;
      case "risk":
        orderBy.riskScore = "asc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      default:
        orderBy.apy = "desc";
    }

    const take = Math.min(parseInt(limit || "20", 10), 100);

    // Execute queries in parallel
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        orderBy,
        take,
      }),
      prisma.opportunity.count({ where }),
    ]);

    // Determine the most recent update timestamp
    const lastUpdated =
      opportunities.length > 0
        ? opportunities.reduce((latest, opp) =>
            opp.lastUpdated > latest ? opp.lastUpdated : latest,
            opportunities[0].lastUpdated
          ).toISOString()
        : new Date().toISOString();

    res.json({
      opportunities,
      total,
      lastUpdated,
    });
  } catch (err) {
    console.error("[opportunities] List error:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch opportunities",
      statusCode: 500,
    });
  }
});

/**
 * GET /api/opportunities/:id
 * Returns a single opportunity with full detail.
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: `Opportunity ${id} not found`,
        statusCode: 404,
      });
      return;
    }

    res.json(opportunity);
  } catch (err) {
    console.error("[opportunities] Detail error:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch opportunity",
      statusCode: 500,
    });
  }
});

export default router;
