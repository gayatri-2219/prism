/**
 * Bridge Service
 * Handles cross-chain bridging via Initia's Interwoven Bridge.
 * For demo: simulates bridge tx with realistic timing.
 */

import { ethers } from "ethers";
import { getProvider, getSigner } from "./evmProvider";
import { config } from "../config";
import { BridgeStatus } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// In-memory bridge status tracking (for demo WebSocket events)
const bridgeStatusMap = new Map<string, BridgeStatus>();

const SUPPORTED_TOKENS = ["ETH", "INIT", "USDC", "WBTC"];
const SUPPORTED_CHAINS = ["ethereum", "initia", "initia-minichain"];

export function isSupportedToken(token: string): boolean {
  return SUPPORTED_TOKENS.includes(token.toUpperCase());
}

export function isSupportedChain(chain: string): boolean {
  return SUPPORTED_CHAINS.includes(chain.toLowerCase());
}

/**
 * Initiate a cross-chain bridge transaction.
 * On testnet with contracts deployed, this calls the bridge precompile.
 * Otherwise, simulates the bridge flow.
 */
export async function initiateBridge(
  fromChain: string,
  toChain: string,
  token: string,
  amount: string,
  senderAddress: string,
  recipientAddress: string
): Promise<BridgeStatus> {
  const signer = getSigner();

  if (signer && config.bridgePrecompile !== ethers.ZeroAddress) {
    try {
      // Call Initia bridge precompile
      const amountWei = ethers.parseEther(amount);
      const tx = await signer.sendTransaction({
        to: config.bridgePrecompile,
        value: amountWei,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "string", "address"],
          [toChain, token, recipientAddress]
        ),
      });
      const receipt = await tx.wait();

      const status: BridgeStatus = {
        txHash: receipt!.hash,
        status: "confirming",
        fromChain,
        toChain,
        token,
        amount,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      bridgeStatusMap.set(status.txHash, status);

      // Record in DB
      try {
        await prisma.transaction.create({
          data: {
            hash: status.txHash,
            address: senderAddress,
            type: "bridge",
            amount: parseFloat(amount),
            status: "confirming",
            chain: `${fromChain}->${toChain}`,
          },
        });
      } catch {
        // DB write is best-effort
      }

      return status;
    } catch (err) {
      console.error("[bridge] On-chain bridge failed:", err);
    }
  }

  // Demo mode — simulate bridge
  const demoHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const status: BridgeStatus = {
    txHash: demoHash,
    status: "pending",
    fromChain,
    toChain,
    token,
    amount,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  bridgeStatusMap.set(demoHash, status);

  // Record in DB
  try {
    await prisma.transaction.create({
      data: {
        hash: demoHash,
        address: senderAddress,
        type: "bridge",
        amount: parseFloat(amount),
        status: "pending",
        chain: `${fromChain}->${toChain}`,
      },
    });
  } catch {
    // DB write is best-effort
  }

  // Simulate bridge completion after delay
  setTimeout(async () => {
    const s = bridgeStatusMap.get(demoHash);
    if (s) {
      s.status = "confirming";
      bridgeStatusMap.set(demoHash, s);
    }
  }, 3000);

  setTimeout(async () => {
    const s = bridgeStatusMap.get(demoHash);
    if (s) {
      s.status = "completed";
      s.completedAt = new Date().toISOString();
      bridgeStatusMap.set(demoHash, s);

      try {
        await prisma.transaction.updateMany({
          where: { hash: demoHash },
          data: { status: "completed" },
        });
      } catch {
        // best-effort
      }
    }
  }, 8000);

  return status;
}

/**
 * Get bridge transaction status.
 */
export function getBridgeStatus(txHash: string): BridgeStatus | null {
  return bridgeStatusMap.get(txHash) || null;
}

/**
 * Get all bridge statuses (for WebSocket polling).
 */
export function getAllPendingBridges(): BridgeStatus[] {
  return Array.from(bridgeStatusMap.values()).filter(
    (s) => s.status !== "completed" && s.status !== "failed"
  );
}
