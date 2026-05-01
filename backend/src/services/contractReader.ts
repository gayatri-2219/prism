/**
 * Contract Reader Service
 * Uses viem for ABI encoding/decoding and initiaRPC for eth_call execution.
 */

import {
  encodeFunctionData,
  decodeFunctionResult,
  type Abi,
  isAddress,
  getAddress,
} from "viem";
import { ethCall } from "./initiaRPC";
import { Position, StrategyAllocation } from "../types";

// ─── Configuration ──────────────────────────────────────────────────────────

const IAE_CONTRACT = process.env.IAE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ─── PrismTreasury ABI (subset used for reads) ──────────────────────────────

const IAE_ROUTER_ABI: Abi = [
  {
    type: "function",
    name: "positionOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "balance", type: "uint256" },
      { name: "riskScore", type: "uint8" },
      { name: "lastUpdated", type: "uint64" },
    ],
  },
];

// ─── Contract Read Helpers ──────────────────────────────────────────────────

/**
 * Get a user's position from the PrismTreasury contract.
 * Falls back to positionOf(address) call.
 */
export async function getPosition(userAddress: string): Promise<Position> {
  const normalizedUser = isAddress(userAddress) ? getAddress(userAddress).toLowerCase() : null;

  if (!normalizedUser) {
    return {
      userAddress,
      totalDeposited: 0n,
      currentValue: 0n,
      riskScore: 0,
      lastTxHash: null,
    };
  }

  if (!IAE_CONTRACT || IAE_CONTRACT.toLowerCase() === ZERO_ADDRESS) {
    return {
      userAddress: normalizedUser,
      totalDeposited: 0n,
      currentValue: 0n,
      riskScore: 0,
      lastTxHash: null,
    };
  }

  try {
    const calldata = encodeFunctionData({
      abi: IAE_ROUTER_ABI,
      functionName: "positionOf",
      args: [normalizedUser as `0x${string}`],
    });

    const rawResult = await ethCall(IAE_CONTRACT, calldata, normalizedUser);

    const decoded = decodeFunctionResult({
      abi: IAE_ROUTER_ABI,
      functionName: "positionOf",
      data: rawResult as `0x${string}`,
    }) as readonly [bigint, number, bigint];

    return {
      userAddress: normalizedUser,
      totalDeposited: decoded[0],
      currentValue: decoded[0],
      riskScore: decoded[1],
      lastTxHash: null,
    };
  } catch (err) {
    console.error(`[contractReader] getPosition failed for ${userAddress}:`, err);

    // Return a default empty position when on-chain read fails
    return {
      userAddress: normalizedUser,
      totalDeposited: 0n,
      currentValue: 0n,
      riskScore: 0,
      lastTxHash: null,
    };
  }
}

/**
 * Get all strategy allocations for a user.
 */
export async function getStrategies(
  _userAddress: string
): Promise<StrategyAllocation[]> {
  // PrismTreasury does not expose per-strategy allocations.
  return [];
}

/**
 * Get total value locked in the PrismTreasury contract.
 */
export async function getTotalValueLocked(): Promise<bigint> {
  // PrismTreasury does not expose TVL, so we keep this as a no-op placeholder.
  return 0n;
}
