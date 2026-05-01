/**
 * Bridge Routes
 * POST /api/bridge         — initiate bridge tx
 * GET  /api/bridge/:txHash — check bridge status
 */

import { Router, Request, Response } from "express";
import {
  initiateBridge,
  getBridgeStatus,
  isSupportedToken,
  isSupportedChain,
} from "../services/bridge";
import { broadcast } from "../services/websocket";

const router = Router();

/** POST /api/bridge — initiate cross-chain bridge */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { fromChain, toChain, token, amount, senderAddress, recipientAddress } = req.body;

    // Validation
    if (!fromChain || !toChain || !token || !amount || !senderAddress) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "fromChain, toChain, token, amount, and senderAddress are required",
        statusCode: 400,
      });
      return;
    }

    if (!isSupportedChain(fromChain) || !isSupportedChain(toChain)) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: `Unsupported chain. Supported: ethereum, initia, initia-minichain`,
        statusCode: 400,
      });
      return;
    }

    if (!isSupportedToken(token)) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: `Unsupported token. Supported: ETH, INIT, USDC, WBTC`,
        statusCode: 400,
      });
      return;
    }

    const result = await initiateBridge(
      fromChain,
      toChain,
      token,
      amount,
      senderAddress,
      recipientAddress || senderAddress
    );

    // Emit WebSocket event
    broadcast("bridge:initiated", result);

    res.json(result);
  } catch (err: any) {
    console.error("[bridge] Error:", err);
    res.status(500).json({
      error: "BRIDGE_FAILED",
      message: err.message || "Bridge initiation failed",
      statusCode: 500,
    });
  }
});

/** GET /api/bridge/:txHash — check status */
router.get("/:txHash", async (req: Request, res: Response) => {
  try {
    const txHash = req.params.txHash as string;
    const status = getBridgeStatus(txHash);

    if (!status) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Bridge transaction not found",
        statusCode: 404,
      });
      return;
    }

    res.json(status);
  } catch (err) {
    console.error("[bridge] Status error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to check status", statusCode: 500 });
  }
});

export default router;
