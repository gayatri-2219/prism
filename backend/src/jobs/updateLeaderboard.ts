/**
 * Update Leaderboard Job
 * Cron: every 10 minutes
 *
 * Ranks active UserPositions by total return percentage,
 * generates strategy labels, and upserts the top 100 into LeaderboardEntry.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Maximum leaderboard entries */
const TOP_N = 100;

/**
 * Build a human-readable strategy label from a user's active strategies.
 */
function buildStrategyLabel(
  strategies: { strategyType: string; allocatedAmount: number }[]
): string {
  if (strategies.length === 0) return "No active strategy";

  // Find the dominant strategy (highest allocation)
  const sorted = [...strategies].sort(
    (a, b) => b.allocatedAmount - a.allocatedAmount
  );

  const primary = sorted[0];
  const typeLabels: Record<string, string> = {
    lp: "Liquidity Provider",
    lend: "Lending",
    stake: "Staking",
    swap: "Swap Yield",
  };

  const primaryLabel = typeLabels[primary.strategyType] || primary.strategyType;

  if (sorted.length === 1) {
    return primaryLabel;
  }

  // Multi-strategy label
  const secondaryLabel =
    typeLabels[sorted[1].strategyType] || sorted[1].strategyType;
  const suffix = sorted.length > 2 ? ` +${sorted.length - 2} more` : "";

  return `${primaryLabel} + ${secondaryLabel}${suffix}`;
}

export async function updateLeaderboard(): Promise<void> {
  const startTime = Date.now();
  console.log("[updateLeaderboard] Starting update...");

  try {
    // Fetch all positions with currentValue > 0 and their strategies
    const positions = await prisma.userPosition.findMany({
      where: {
        currentValue: { gt: 0 },
        totalDeposited: { gt: 0 },
      },
      include: {
        strategies: {
          where: { isActive: true },
        },
      },
    });

    console.log(
      `[updateLeaderboard] Processing ${positions.length} active positions`
    );

    // Calculate returns and rank
    const ranked = positions
      .map((pos) => {
        const totalReturn =
          ((pos.currentValue - pos.totalDeposited) / pos.totalDeposited) * 100;

        return {
          userAddress: pos.userAddress,
          initUsername: pos.initUsername,
          totalReturn: Math.round(totalReturn * 100) / 100,
          strategyLabel: buildStrategyLabel(
            pos.strategies.map((s) => ({
              strategyType: s.strategyType,
              allocatedAmount: s.allocatedAmount,
            }))
          ),
          riskScore: pos.riskScore,
          totalValue: pos.currentValue,
        };
      })
      .sort((a, b) => b.totalReturn - a.totalReturn)
      .slice(0, TOP_N);

    // Clear the existing leaderboard and rebuild
    // Using a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Delete entries not in the new top list
      const rankedAddresses = ranked.map((r) => r.userAddress);

      await tx.leaderboardEntry.deleteMany({
        where: {
          userAddress: { notIn: rankedAddresses },
        },
      });

      // Upsert each ranked entry
      for (let i = 0; i < ranked.length; i++) {
        const entry = ranked[i];
        const rank = i + 1;

        await tx.leaderboardEntry.upsert({
          where: { userAddress: entry.userAddress },
          create: {
            userAddress: entry.userAddress,
            initUsername: entry.initUsername,
            totalReturn: entry.totalReturn,
            strategyLabel: entry.strategyLabel,
            riskScore: entry.riskScore,
            totalValue: entry.totalValue,
            rank,
          },
          update: {
            initUsername: entry.initUsername,
            totalReturn: entry.totalReturn,
            strategyLabel: entry.strategyLabel,
            riskScore: entry.riskScore,
            totalValue: entry.totalValue,
            rank,
          },
        });
      }
    });

    const elapsed = Date.now() - startTime;
    console.log(
      `[updateLeaderboard] Completed: ${ranked.length} entries ranked (${elapsed}ms)`
    );
  } catch (err) {
    console.error("[updateLeaderboard] Fatal error:", err);
  }
}
