/**
 * Portfolio Route
 * GET /api/portfolio/:address — aggregated portfolio view combining DB + chain data
 */

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { UserPosition, UserStrategy } from "@prisma/client";
import { getTxHistory, resolveInitUsername } from "../services/initiaRPC";
import { getPosition } from "../services/contractReader";
import { PortfolioResponse } from "../types";

const router = Router();
const prisma = new PrismaClient();

router.get("/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    const evmAddress = (req.query.evmAddress as string | undefined)?.trim();
    const isHexAddress = (value?: string) => Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
    const addressForContract = isHexAddress(evmAddress) ? evmAddress : isHexAddress(address) ? address : undefined;

    if (!address) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "Address parameter is required",
        statusCode: 400,
      });
      return;
    }

    // Fetch from DB and chain in parallel
    const [dbPosition, txHistory, initUsername, onChainPosition] = await Promise.all([
      prisma.userPosition.findUnique({
        where: { userAddress: address },
        include: { strategies: true },
      }) as Promise<(UserPosition & { strategies: UserStrategy[] }) | null>,
      getTxHistory(address, 50),
      resolveInitUsername(address),
      addressForContract ? getPosition(addressForContract) : Promise.resolve(null),
    ]);

    // If we resolved a username and it's not stored, update it
    if (initUsername && dbPosition && dbPosition.initUsername !== initUsername) {
      await prisma.userPosition.update({
        where: { userAddress: address },
        data: { initUsername },
      });
    }

    // Compute totals
    const chainDeposited = onChainPosition ? Number(onChainPosition.totalDeposited) / 1e18 : 0;
    const chainCurrent = onChainPosition ? Number(onChainPosition.currentValue) / 1e18 : 0;
    const totalDeposited = chainDeposited > 0 ? chainDeposited : dbPosition?.totalDeposited ?? 0;
    const currentValue = chainCurrent > 0 ? chainCurrent : dbPosition?.currentValue ?? 0;
    const totalReturn =
      totalDeposited > 0
        ? ((currentValue - totalDeposited) / totalDeposited) * 100
        : 0;

    // Map strategies with opportunity APY data
    const strategies = dbPosition?.strategies
      ? await Promise.all(
          dbPosition.strategies
            .filter((s: UserStrategy) => s.isActive)
            .map(async (s: UserStrategy) => {
              // Try to find the matching opportunity for APY data
              const opportunity = await prisma.opportunity.findFirst({
                where: {
                  protocolAddress: s.protocolAddress,
                  strategyType: s.strategyType,
                  isActive: true,
                },
              });

              return {
                protocol: opportunity?.protocolName || s.protocolAddress,
                type: s.strategyType,
                apy: opportunity?.apy ?? 0,
                allocation: s.allocatedAmount,
                value: s.currentValue,
              };
            })
        )
      : [];

    const portfolio: PortfolioResponse = {
      address,
      initUsername: initUsername || dbPosition?.initUsername || null,
      totalDeposited,
      currentValue,
      totalReturn: Math.round(totalReturn * 100) / 100,
      strategies,
      txHistory,
    };

    res.json(portfolio);
  } catch (err) {
    console.error("[portfolio] Error:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch portfolio",
      statusCode: 500,
    });
  }
});

export default router;
