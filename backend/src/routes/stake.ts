/**
 * Staking Routes
 * POST /api/stake/eth   — stake ETH
 * GET  /api/stake/apy   — current APY
 * GET  /api/stake/position/:address — staking position
 */

import { Router, Request, Response } from "express";
import { getStakingAPY, getStakePosition, executeStake } from "../services/staking";

const router = Router();

/** GET /api/stake/apy */
router.get("/apy", async (_req: Request, res: Response) => {
  try {
    const result = await getStakingAPY();
    res.json(result);
  } catch (err) {
    console.error("[stake/apy] Error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch APY", statusCode: 500 });
  }
});

/** GET /api/stake/position/:address */
router.get("/position/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    if (!address) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Address required", statusCode: 400 });
      return;
    }
    const position = await getStakePosition(address);
    res.json(position);
  } catch (err) {
    console.error("[stake/position] Error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch position", statusCode: 500 });
  }
});

/** POST /api/stake/eth */
router.post("/eth", async (req: Request, res: Response) => {
  try {
    const { amount, strategy } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Valid amount required", statusCode: 400 });
      return;
    }
    const result = await executeStake(amount, strategy);
    res.json(result);
  } catch (err: any) {
    console.error("[stake/eth] Error:", err);
    res.status(500).json({ error: "STAKE_FAILED", message: err.message || "Stake failed", statusCode: 500 });
  }
});

export default router;
