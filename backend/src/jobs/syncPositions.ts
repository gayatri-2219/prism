/**
 * Sync Positions Job
 * Cron: every 2 minutes
 *
 * Iterates all UserPositions in DB, re-fetches on-chain state,
 * and updates currentValue and riskScore.
 */

import { PrismaClient } from "@prisma/client";
import { getPosition, getStrategies } from "../services/contractReader";
import { resolveInitUsername } from "../services/initiaRPC";

const prisma = new PrismaClient();

/** Maximum positions to sync per run to avoid timeout */
const BATCH_SIZE = 50;

export async function syncPositions(): Promise<void> {
  const startTime = Date.now();
  console.log("[syncPositions] Starting sync...");

  try {
    // Fetch all active positions, ordered by stalest first
    const positions = await prisma.userPosition.findMany({
      orderBy: { lastUpdated: "asc" },
      take: BATCH_SIZE,
    });

    console.log(`[syncPositions] Syncing ${positions.length} positions`);

    let updated = 0;
    let deactivated = 0;
    let errors = 0;

    for (const pos of positions) {
      try {
        const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(pos.userAddress);
        if (!isHexAddress) {
          continue;
        }

        // Fetch on-chain position
        const onChain = await getPosition(pos.userAddress);

        // If position has no value on-chain, mark strategies as inactive
        if (onChain.currentValue === 0n && onChain.totalDeposited === 0n) {
          await prisma.userStrategy.updateMany({
            where: { userAddress: pos.userAddress },
            data: { isActive: false },
          });
          deactivated++;
          continue;
        }

        // Update position with on-chain data
        const updateData: Record<string, any> = {
          currentValue: Number(onChain.currentValue) / 1e18,
          riskScore: onChain.riskScore,
        };

        if (onChain.lastTxHash) {
          updateData.lastTxHash = onChain.lastTxHash;
        }

        // Resolve .init username if not already set
        if (!pos.initUsername) {
          const username = await resolveInitUsername(pos.userAddress);
          if (username) {
            updateData.initUsername = username;
          }
        }

        await prisma.userPosition.update({
          where: { userAddress: pos.userAddress },
          data: updateData,
        });

        // Sync strategies
        const onChainStrategies = await getStrategies(pos.userAddress);

        if (onChainStrategies.length > 0) {
          // Mark existing strategies as inactive
          await prisma.userStrategy.updateMany({
            where: { userAddress: pos.userAddress },
            data: { isActive: false },
          });

          // Upsert active strategies from chain
          for (const strat of onChainStrategies) {
            await prisma.userStrategy.create({
              data: {
                userAddress: pos.userAddress,
                protocolAddress: strat.protocolAddress,
                strategyType: strat.strategyType,
                allocatedAmount: Number(strat.allocatedAmount) / 1e18,
                currentValue: Number(strat.currentValue) / 1e18,
                isActive: strat.isActive,
              },
            });
          }
        }

        updated++;
      } catch (posErr) {
        console.warn(
          `[syncPositions] Failed to sync ${pos.userAddress}:`,
          posErr
        );
        errors++;
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `[syncPositions] Completed: ${updated} updated, ${deactivated} deactivated, ${errors} errors (${elapsed}ms)`
    );
  } catch (err) {
    console.error("[syncPositions] Fatal error:", err);
  }
}
