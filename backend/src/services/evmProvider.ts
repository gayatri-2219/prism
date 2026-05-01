/**
 * EVM Provider Service
 * Ethers.js v6 provider for Initia EVM chain.
 */

import { ethers } from "ethers";
import { config } from "../config";

// ─── Provider ───────────────────────────────────────────────────────────────

let _provider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(config.initiaEvmRpc, {
      chainId: config.chainId,
      name: "initia-evm",
    });
  }
  return _provider;
}

// ─── Signer (for server-side txs) ───────────────────────────────────────────

let _signer: ethers.Wallet | null = null;

export function getSigner(): ethers.Wallet | null {
  if (!config.privateKey) return null;
  if (!_signer) {
    _signer = new ethers.Wallet(config.privateKey, getProvider());
  }
  return _signer;
}

// ─── Common ABIs ────────────────────────────────────────────────────────────

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[])",
];

export const STRATEGY_MANAGER_ABI = [
  "function depositIntoStrategy(address strategy, address token, uint256 amount) returns (uint256)",
  "function stakerStrategyShares(address staker, address strategy) view returns (uint256)",
  "function getDeposits(address depositor) view returns (address[] strategies, uint256[] shares)",
  "function calculateCurrentStakerAPY(address staker) view returns (uint256)",
  "function withdraw(address strategy, uint256 shares) returns (bool)",
];

// ─── Multicall Helper ───────────────────────────────────────────────────────

export interface MulticallRequest {
  target: string;
  callData: string;
  allowFailure?: boolean;
}

/**
 * Execute batched calls via Multicall3.
 * Falls back to individual eth_call if Multicall3 is not deployed.
 */
export async function multicall(calls: MulticallRequest[]): Promise<string[]> {
  const provider = getProvider();

  // Try Multicall3 first
  if (config.multicall3 && config.multicall3 !== ethers.ZeroAddress) {
    try {
      const mc = new ethers.Contract(config.multicall3, MULTICALL3_ABI, provider);
      const results = await mc.aggregate3(
        calls.map((c) => ({
          target: c.target,
          allowFailure: c.allowFailure ?? true,
          callData: c.callData,
        }))
      );
      return results.map((r: { success: boolean; returnData: string }) =>
        r.success ? r.returnData : "0x"
      );
    } catch (err) {
      console.warn("[evm] Multicall3 failed, falling back to individual calls:", err);
    }
  }

  // Fallback: individual calls
  const results: string[] = [];
  for (const call of calls) {
    try {
      const result = await provider.call({ to: call.target, data: call.callData });
      results.push(result);
    } catch {
      results.push("0x");
    }
  }
  return results;
}

/**
 * Get native ETH/INIT balance for an address.
 */
export async function getNativeBalance(address: string): Promise<bigint> {
  try {
    return await getProvider().getBalance(address);
  } catch {
    return 0n;
  }
}
