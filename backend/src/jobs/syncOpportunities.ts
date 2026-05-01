/**
 * Sync Opportunities Job
 * Cron: every 5 minutes
 *
 * Fetches yield data from Initia DEX pools and lending protocols,
 * calculates APY, TVL, and risk scores, then upserts into the DB.
 */

import { PrismaClient } from "@prisma/client";
import { getDexPools } from "../services/initiaRPC";
import {
  calculateAPYFromPeriodRate,
  riskScoreFromDexPool,
} from "../services/yieldCalculator";

const prisma = new PrismaClient();

/** Known token symbol mappings for common Initia denoms */
const DENOM_SYMBOLS: Record<string, string> = {
  uinit: "INIT",
  "uusdc": "USDC",
  "uusdt": "USDT",
  "ueth": "ETH",
  "umove": "MOVE",
};

function denomToSymbol(denom: string): string {
  return DENOM_SYMBOLS[denom] || denom.replace(/^u/, "").toUpperCase();
}

export async function syncOpportunities(): Promise<void> {
  const startTime = Date.now();
  console.log("[syncOpportunities] Starting sync...");

  try {
    // ── 1. Fetch DEX Pools ──────────────────────────────────────────────
    const pools = await getDexPools();
    console.log(`[syncOpportunities] Fetched ${pools.length} DEX pools`);

    let upsertCount = 0;

    for (const pool of pools) {
      try {
        // Extract pool metadata
        const coinA = pool.coin_a || pool.coins?.[0];
        const coinB = pool.coin_b || pool.coins?.[1];

        if (!coinA || !coinB) continue;

        const denomA = coinA.denom || "";
        const denomB = coinB.denom || "";
        const symbolA = denomToSymbol(denomA);
        const symbolB = denomToSymbol(denomB);

        // Calculate TVL from pool reserves (in token units)
        const amountA = parseInt(coinA.amount || "0", 10) / 1e6;
        const amountB = parseInt(coinB.amount || "0", 10) / 1e6;
        const tvl = amountA + amountB; // simplified — in production, multiply by prices

        // Estimate APY from swap fees
        // Assumption: daily volume ~= 5% of TVL, fees compound daily
        const swapFeeRate = parseFloat(pool.swap_fee_rate || "0.003");
        const estimatedDailyVolume = tvl * 0.05;
        const dailyFeeRevenue = estimatedDailyVolume * swapFeeRate;
        const dailyRate = tvl > 0 ? dailyFeeRevenue / tvl : 0;
        const apy = calculateAPYFromPeriodRate(dailyRate, 365);

        // Calculate risk score
        const riskScore = riskScoreFromDexPool(apy, tvl, swapFeeRate);

        // Build a unique identifier for the pool
        const poolId = pool.pool_id || `${denomA}-${denomB}`;
        const protocolAddress = `initia-dex-${poolId}`;

        await prisma.opportunity.upsert({
          where: {
            id: protocolAddress,
          },
          create: {
            id: protocolAddress,
            protocolName: `Initia DEX`,
            protocolAddress,
            strategyType: "lp",
            apy: Math.round(apy * 100) / 100,
            tvl: Math.round(tvl * 100) / 100,
            riskScore,
            tokenSymbol: `${symbolA}/${symbolB}`,
            tokenAddress: denomA,
            minDeposit: 0.01,
            description: `Provide liquidity to the ${symbolA}/${symbolB} pool on Initia DEX. Earn swap fees with ${swapFeeRate * 100}% fee rate.`,
            isActive: true,
          },
          update: {
            apy: Math.round(apy * 100) / 100,
            tvl: Math.round(tvl * 100) / 100,
            riskScore,
            isActive: true,
            description: `Provide liquidity to the ${symbolA}/${symbolB} pool on Initia DEX. Earn swap fees with ${swapFeeRate * 100}% fee rate.`,
          },
        });

        upsertCount++;
      } catch (poolErr) {
        console.warn(`[syncOpportunities] Failed to process pool:`, poolErr);
      }
    }

    // ── 2. Add staking opportunity (always available on Initia) ────────
    try {
      await prisma.opportunity.upsert({
        where: { id: "initia-stake-init" },
        create: {
          id: "initia-stake-init",
          protocolName: "Initia Staking",
          protocolAddress: "initia-staking",
          strategyType: "stake",
          apy: 8.5, // Typical PoS staking rate
          tvl: 0,
          riskScore: 15,
          tokenSymbol: "INIT",
          tokenAddress: "uinit",
          minDeposit: 1,
          description:
            "Stake INIT tokens to earn staking rewards. Low risk, steady returns through proof-of-stake consensus.",
          isActive: true,
        },
        update: {
          apy: 8.5,
          riskScore: 15,
          isActive: true,
        },
      });
      upsertCount++;
    } catch (stakeErr) {
      console.warn("[syncOpportunities] Failed to upsert staking opportunity:", stakeErr);
    }

    // ── 3. Deactivate stale opportunities ───────────────────────────────
    const staleThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    const { count: deactivatedCount } = await prisma.opportunity.updateMany({
      where: {
        isActive: true,
        lastUpdated: { lt: staleThreshold },
      },
      data: { isActive: false },
    });

    if (deactivatedCount > 0) {
      console.log(`[syncOpportunities] Deactivated ${deactivatedCount} stale opportunities`);
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `[syncOpportunities] Completed: ${upsertCount} upserted, ${deactivatedCount} deactivated (${elapsed}ms)`
    );
  } catch (err) {
    console.error("[syncOpportunities] Fatal error:", err);
  }
}
