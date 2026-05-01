/**
 * Positions Route
 * GET /api/positions/:address — fetch user position with staleness check
 */

import { Router, Request, Response } from "express";
import type { UserPosition, UserStrategy } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { getPosition, getStrategies } from "../services/contractReader";

const router = Router();
const prisma = new PrismaClient();

/** Cache staleness threshold in milliseconds (30 seconds) */
const STALE_THRESHOLD_MS = 30_000;

router.get("/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    const evmAddress = (req.query.evmAddress as string | undefined)?.trim();
    const isHexAddress = (value?: string) =>
      Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
    const addressForContract = isHexAddress(evmAddress)
      ? evmAddress
      : isHexAddress(address)
        ? address
        : undefined;

    if (!address) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "Address parameter is required",
        statusCode: 400,
      });
      return;
    }

    // Check DB cache first
    let position: (UserPosition & { strategies: UserStrategy[] }) | null =
      await prisma.userPosition.findUnique({
        where: { userAddress: address },
        include: { strategies: true },
      });

    const isStale =
      !position ||
      Date.now() - position.lastUpdated.getTime() > STALE_THRESHOLD_MS;

    if (isStale) {
      // Re-fetch from chain via contractReader
      try {
        const [onChainPosition, onChainStrategies] = await Promise.all([
          addressForContract ? getPosition(addressForContract) : Promise.resolve(null),
          addressForContract ? getStrategies(addressForContract) : Promise.resolve([]),
        ]);

        // Only update DB if the on-chain position has meaningful data
        if (
          onChainPosition &&
          (onChainPosition.currentValue > 0n || onChainPosition.totalDeposited > 0n)
        ) {
          // Upsert the position
          position = await prisma.userPosition.upsert({
            where: { userAddress: address },
            create: {
              userAddress: address,
              totalDeposited: Number(onChainPosition.totalDeposited) / 1e18,
              totalWithdrawn: 0,
              currentValue: Number(onChainPosition.currentValue) / 1e18,
              riskScore: onChainPosition.riskScore,
              autopilotEnabled: false,
              lastTxHash: onChainPosition.lastTxHash,
            },
            update: {
              currentValue: Number(onChainPosition.currentValue) / 1e18,
              riskScore: onChainPosition.riskScore,
              lastTxHash: onChainPosition.lastTxHash,
            },
            include: { strategies: true },
          });

          // Sync strategies: mark all inactive, then upsert active ones
          if (onChainStrategies.length > 0) {
            await prisma.userStrategy.updateMany({
              where: { userAddress: address },
              data: { isActive: false },
            });

            for (const strat of onChainStrategies) {
              await prisma.userStrategy.upsert({
                where: {
                  id: `${address}-${strat.protocolAddress}`, // composite key fallback
                },
                create: {
                  userAddress: address,
                  protocolAddress: strat.protocolAddress,
                  strategyType: strat.strategyType,
                  allocatedAmount: Number(strat.allocatedAmount) / 1e18,
                  currentValue: Number(strat.currentValue) / 1e18,
                  isActive: strat.isActive,
                },
                update: {
                  allocatedAmount: Number(strat.allocatedAmount) / 1e18,
                  currentValue: Number(strat.currentValue) / 1e18,
                  isActive: strat.isActive,
                },
              });
            }

            // Re-fetch with updated strategies
            position = await prisma.userPosition.findUnique({
              where: { userAddress: address },
              include: { strategies: true },
            });
          }
        }
      } catch (chainErr) {
        console.warn(
          `[positions] On-chain fetch failed for ${address}, serving cached data:`,
          chainErr
        );
        // Fall through — serve whatever we have in DB (or null)
      }
    }

    if (!position) {
      res.json({ position: null, strategies: [] });
      return;
    }

    res.json({
      position: {
        id: position.id,
        userAddress: position.userAddress,
        initUsername: position.initUsername,
        totalDeposited: position.totalDeposited,
        totalWithdrawn: position.totalWithdrawn,
        currentValue: position.currentValue,
        riskScore: position.riskScore,
        autopilotEnabled: position.autopilotEnabled,
        lastTxHash: position.lastTxHash,
        lastUpdated: position.lastUpdated.toISOString(),
        createdAt: position.createdAt.toISOString(),
      },
      strategies: position.strategies.map((s) => ({
        id: s.id,
        protocolAddress: s.protocolAddress,
        strategyType: s.strategyType,
        allocatedAmount: s.allocatedAmount,
        currentValue: s.currentValue,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[positions] Error:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch positions",
      statusCode: 500,
    });
  }
});

export default router;
