/**
 * Airdrop Routes
 * GET  /api/airdrops              — list active campaigns
 * GET  /api/airdrops/:address     — wallet eligibility + progress
 * POST /api/airdrops/step         — mark step completed
 */

import { Router, Request, Response } from "express";
import {
  getActiveCampaigns,
  getAirdropProgress,
  checkEligibility,
  completeAirdropStep,
} from "../services/airdrops";

const router = Router();

/** GET /api/airdrops — list active campaigns */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const campaigns = getActiveCampaigns();
    res.json({ campaigns, total: campaigns.length });
  } catch (err) {
    console.error("[airdrops] List error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to list airdrops", statusCode: 500 });
  }
});

/** GET /api/airdrops/:address — progress + eligibility */
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    if (!address) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Address required", statusCode: 400 });
      return;
    }

    const [progress, eligibility] = await Promise.all([
      getAirdropProgress(address),
      checkEligibility(address),
    ]);

    res.json({ address, progress, eligibility });
  } catch (err) {
    console.error("[airdrops] Progress error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch progress", statusCode: 500 });
  }
});

/** POST /api/airdrops/step — mark a step as done */
router.post("/step", async (req: Request, res: Response) => {
  try {
    const { address, campaignId, stepName } = req.body;
    if (!address || !campaignId || !stepName) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "address, campaignId, and stepName are required",
        statusCode: 400,
      });
      return;
    }

    const result = await completeAirdropStep(address, campaignId, stepName);
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND", message: "Campaign or step not found", statusCode: 404 });
      return;
    }

    res.json(result);
  } catch (err) {
    console.error("[airdrops] Step error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update step", statusCode: 500 });
  }
});

export default router;
