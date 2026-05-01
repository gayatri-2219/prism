/**
 * AI Insights Routes
 * GET  /api/insights/:address — get personalized AI insights
 * POST /api/insights/chat     — chat with PRISM AI
 */

import { Router, Request, Response } from "express";
import { getInsights, chatWithAI } from "../services/aiInsights";

const router = Router();

/** GET /api/insights/:address */
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    if (!address) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Address required", statusCode: 400 });
      return;
    }

    const insights = await getInsights(address);
    res.json({ address, insights, count: insights.length });
  } catch (err) {
    console.error("[insights] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate insights";
    const isAiConfigError = message.toLowerCase().includes("ai provider is not configured");
    res.status(isAiConfigError ? 503 : 500).json({
      error: "INTERNAL_ERROR",
      message: isAiConfigError ? "AI key missing on backend" : message,
      statusCode: isAiConfigError ? 503 : 500,
    });
  }
});

/** POST /api/insights/chat */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { address, message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "BAD_REQUEST", message: "message is required", statusCode: 400 });
      return;
    }

    const reply = await chatWithAI(address || "", message, history || []);
    res.json({ reply });
  } catch (err) {
    console.error("[insights/chat] Error:", err);
    const message = err instanceof Error ? err.message : "AI chat failed";
    const isAiConfigError = message.toLowerCase().includes("ai provider is not configured");
    res.status(isAiConfigError ? 503 : 500).json({
      error: "INTERNAL_ERROR",
      message: isAiConfigError ? "AI key missing on backend" : message,
      statusCode: isAiConfigError ? 503 : 500,
    });
  }
});

export default router;
