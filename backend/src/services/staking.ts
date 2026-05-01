/**
 * Staking Service
 * Handles staking operations via EigenLayer-style StrategyManager on Initia EVM.
 * For demo: returns realistic mock data when contracts aren't deployed.
 */

import { ethers } from "ethers";
import { getProvider, getSigner, STRATEGY_MANAGER_ABI } from "./evmProvider";
import { config } from "../config";
import { StakePosition } from "../types";

const ZERO = ethers.ZeroAddress;

// ─── Staking APY ────────────────────────────────────────────────────────────

/** Current staking APY — reads on-chain if available, else returns demo value */
export async function getStakingAPY(): Promise<{ apy: number; source: string }> {
  if (config.strategyManager !== ZERO) {
    try {
      const contract = new ethers.Contract(
        config.strategyManager,
        STRATEGY_MANAGER_ABI,
        getProvider()
      );
      // Try reading APY from contract (custom function)
      const rawApy = await contract.calculateCurrentStakerAPY(ZERO);
      return { apy: Number(rawApy) / 100, source: "on-chain" };
    } catch {
      // Contract may not have this function
    }
  }

  // Demo APY — realistic for Initia staking
  return { apy: 6.2, source: "estimated" };
}

// ─── Stake Position ─────────────────────────────────────────────────────────

/** Get staking position for an address */
export async function getStakePosition(address: string): Promise<StakePosition> {
  if (config.strategyManager !== ZERO) {
    try {
      const contract = new ethers.Contract(
        config.strategyManager,
        STRATEGY_MANAGER_ABI,
        getProvider()
      );
      const [strategies, shares] = await contract.getDeposits(address);
      const totalShares = (shares as bigint[]).reduce(
        (sum: bigint, s: bigint) => sum + s,
        0n
      );
      const { apy } = await getStakingAPY();

      return {
        stakedAmount: ethers.formatEther(totalShares),
        stakedAmountUSD: Number(ethers.formatEther(totalShares)) * 3200, // ETH price estimate
        pendingRewards: ethers.formatEther(totalShares * BigInt(Math.floor(apy * 100)) / 10000n),
        pendingRewardsUSD: 0,
        apy,
        strategy: (strategies as string[])[0] || "default",
        since: new Date(Date.now() - 7 * 86400000).toISOString(),
      };
    } catch (err) {
      console.warn("[staking] On-chain read failed:", err);
    }
  }

  // Demo position
  return {
    stakedAmount: "0",
    stakedAmountUSD: 0,
    pendingRewards: "0",
    pendingRewardsUSD: 0,
    apy: 6.2,
    strategy: "initia-native-staking",
    since: new Date().toISOString(),
  };
}

// ─── Execute Stake ──────────────────────────────────────────────────────────

/**
 * Stake ETH via StrategyManager.
 * In demo mode, returns a simulated tx hash.
 */
export async function executeStake(
  amount: string,
  _strategy?: string
): Promise<{ txHash: string; status: string; amount: string }> {
  const signer = getSigner();

  if (signer && config.strategyManager !== ZERO) {
    try {
      const contract = new ethers.Contract(
        config.strategyManager,
        STRATEGY_MANAGER_ABI,
        signer
      );
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.depositIntoStrategy(
        config.strategyManager, // default strategy
        ZERO, // native ETH
        amountWei,
        { value: amountWei }
      );
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        status: "confirmed",
        amount,
      };
    } catch (err) {
      console.error("[staking] executeStake failed:", err);
      throw err;
    }
  }

  // Demo mode — simulate tx
  const demoHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  return {
    txHash: demoHash,
    status: "simulated",
    amount,
  };
}
