/**
 * Session Key Service
 * EIP-7702-style session keys for auto-signing.
 * Stores session keys in Redis/memory with TTL.
 */

import { ethers } from "ethers";
import { cacheGet, cacheSet, cacheDel } from "./cache";
import { SessionKey } from "../types";

const SESSION_PREFIX = "session:";
const DEFAULT_TTL = 3600; // 1 hour
const MAX_TTL = 86400; // 24 hours

/**
 * Create a new session key with limited permissions.
 */
export async function createSessionKey(
  ownerAddress: string,
  permissions: string[] = ["stake", "bridge", "swap"],
  maxTxValue: string = "1.0",
  ttlSeconds: number = DEFAULT_TTL
): Promise<SessionKey> {
  const sessionId = ethers.hexlify(ethers.randomBytes(16));
  const delegateWallet = ethers.Wallet.createRandom();
  const ttl = Math.min(ttlSeconds, MAX_TTL);

  const session: SessionKey = {
    sessionId,
    ownerAddress,
    delegateAddress: delegateWallet.address,
    permissions,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    maxTxValue,
  };

  // Store session (encrypted delegate private key in production)
  const sessionData = {
    ...session,
    _delegateKey: delegateWallet.privateKey, // In production: encrypt this
  };

  await cacheSet(
    `${SESSION_PREFIX}${sessionId}`,
    JSON.stringify(sessionData),
    ttl
  );

  // Also index by owner
  const ownerKey = `${SESSION_PREFIX}owner:${ownerAddress.toLowerCase()}`;
  const existingSessions = await cacheGet(ownerKey);
  const sessionIds: string[] = existingSessions ? JSON.parse(existingSessions) : [];
  sessionIds.push(sessionId);
  await cacheSet(ownerKey, JSON.stringify(sessionIds), MAX_TTL);

  return session;
}

/**
 * Get a session by ID.
 */
export async function getSession(sessionId: string): Promise<SessionKey | null> {
  const raw = await cacheGet(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    // Don't expose the delegate private key
    const { _delegateKey, ...session } = data;
    return session as SessionKey;
  } catch {
    return null;
  }
}

/**
 * Execute a transaction using a session key (auto-signed, no popup).
 */
export async function executeWithSession(
  sessionId: string,
  txRequest: {
    to: string;
    data?: string;
    value?: string;
    action: string; // "stake" | "bridge" | "swap"
  }
): Promise<{ txHash: string; status: string }> {
  const raw = await cacheGet(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) {
    throw new Error("Session expired or not found");
  }

  const sessionData = JSON.parse(raw);
  const session = sessionData as SessionKey & { _delegateKey: string };

  // Check permission
  if (!session.permissions.includes(txRequest.action)) {
    throw new Error(`Action "${txRequest.action}" not permitted in this session`);
  }

  // Check tx value limit
  if (txRequest.value) {
    const valueEth = parseFloat(ethers.formatEther(txRequest.value));
    if (valueEth > parseFloat(session.maxTxValue)) {
      throw new Error(`Transaction value ${valueEth} exceeds session limit ${session.maxTxValue}`);
    }
  }

  // In demo mode, simulate the tx
  const demoHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  return {
    txHash: demoHash,
    status: "simulated-auto-signed",
  };
}

/**
 * Revoke a session key.
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  const raw = await cacheGet(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return false;

  await cacheDel(`${SESSION_PREFIX}${sessionId}`);
  return true;
}

/**
 * List active sessions for an owner.
 */
export async function listSessions(ownerAddress: string): Promise<SessionKey[]> {
  const ownerKey = `${SESSION_PREFIX}owner:${ownerAddress.toLowerCase()}`;
  const raw = await cacheGet(ownerKey);
  if (!raw) return [];

  const sessionIds: string[] = JSON.parse(raw);
  const sessions: SessionKey[] = [];

  for (const id of sessionIds) {
    const session = await getSession(id);
    if (session) sessions.push(session);
  }

  return sessions;
}
