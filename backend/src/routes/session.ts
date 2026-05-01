/**
 * Session Key Routes
 * POST /api/session/create   — create session key
 * POST /api/session/execute  — execute tx via session
 * GET  /api/session/list/:address — list active sessions
 * DELETE /api/session/:id    — revoke session
 */

import { Router, Request, Response } from "express";
import {
  createSessionKey,
  executeWithSession,
  listSessions,
  revokeSession,
} from "../services/sessionKeys";

const router = Router();

/** POST /api/session/create */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { ownerAddress, permissions, maxTxValue, ttlSeconds } = req.body;

    if (!ownerAddress) {
      res.status(400).json({ error: "BAD_REQUEST", message: "ownerAddress required", statusCode: 400 });
      return;
    }

    const session = await createSessionKey(
      ownerAddress,
      permissions || ["stake", "bridge", "swap"],
      maxTxValue || "1.0",
      ttlSeconds || 3600
    );

    res.json(session);
  } catch (err: any) {
    console.error("[session/create] Error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message, statusCode: 500 });
  }
});

/** POST /api/session/execute */
router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { sessionId, to, data, value, action } = req.body;

    if (!sessionId || !action) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "sessionId and action are required",
        statusCode: 400,
      });
      return;
    }

    const result = await executeWithSession(sessionId, { to, data, value, action });
    res.json(result);
  } catch (err: any) {
    console.error("[session/execute] Error:", err);
    const statusCode = err.message.includes("expired") || err.message.includes("not found") ? 401 : 
                       err.message.includes("not permitted") || err.message.includes("exceeds") ? 403 : 500;
    res.status(statusCode).json({ error: "SESSION_ERROR", message: err.message, statusCode });
  }
});

/** GET /api/session/list/:address */
router.get("/list/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    const sessions = await listSessions(address);
    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("[session/list] Error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to list sessions", statusCode: 500 });
  }
});

/** DELETE /api/session/:id */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const revoked = await revokeSession(sessionId);
    res.json({ revoked, sessionId });
  } catch (err) {
    console.error("[session/revoke] Error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to revoke session", statusCode: 500 });
  }
});

export default router;
