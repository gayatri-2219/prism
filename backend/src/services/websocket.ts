/**
 * WebSocket Server
 * Emits real-time events for bridge status, portfolio updates, etc.
 */

import { WebSocketServer, WebSocket } from "ws";
import { config } from "../config";
import { getAllPendingBridges } from "../services/bridge";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function startWebSocketServer(): WebSocketServer {
  wss = new WebSocketServer({ port: config.wsPort });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`[ws] Client connected (total: ${clients.size})`);

    ws.send(JSON.stringify({
      type: "connected",
      payload: { message: "Connected to PRISM WebSocket" },
      timestamp: new Date().toISOString(),
    }));

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[ws] Client disconnected (total: ${clients.size})`);
    });

    ws.on("error", (err) => {
      console.error("[ws] Client error:", err);
      clients.delete(ws);
    });
  });

  // Poll bridge statuses every 2 seconds
  setInterval(() => {
    const pending = getAllPendingBridges();
    if (pending.length > 0) {
      broadcast("bridge:status", pending);
    }
  }, 2000);

  console.log(`[ws] WebSocket server listening on port ${config.wsPort}`);
  return wss;
}

export function broadcast(type: string, payload: unknown): void {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function getWss(): WebSocketServer | null {
  return wss;
}
