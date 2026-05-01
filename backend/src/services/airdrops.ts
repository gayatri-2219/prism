/**
 * Airdrop Service
 * Tracks airdrop campaigns and per-user completion progress.
 * Uses PostgreSQL via Prisma for persistence.
 */

import { PrismaClient } from "@prisma/client";
import { AirdropCampaign, AirdropProgress } from "../types";

const prisma = new PrismaClient();

// ─── Seed Campaigns ─────────────────────────────────────────────────────────

const CAMPAIGNS: AirdropCampaign[] = [
  {
    id: "initia-genesis",
    name: "Initia Genesis Campaign",
    tag: "🔥 Trending",
    estimatedRange: "$200–500",
    difficulty: "Easy",
    totalSteps: 5,
    steps: ["Connect Wallet", "Bridge to Initia", "Swap $50+ tokens", "Provide Liquidity", "Complete for 7 days"],
    deadline: "2026-06-30T00:00:00Z",
    active: true,
  },
  {
    id: "layerzero-snapshot",
    name: "LayerZero Snapshot",
    tag: "⚡ Popular",
    estimatedRange: "$100–300",
    difficulty: "Medium",
    totalSteps: 4,
    steps: ["Bridge using LayerZero", "Complete 3 transactions", "Hold for 30 days", "Participate in governance"],
    deadline: null,
    active: true,
  },
  {
    id: "eigenlayer-points",
    name: "EigenLayer Points",
    tag: "💎 Pro",
    estimatedRange: "TBA",
    difficulty: "Hard",
    totalSteps: 4,
    steps: ["Stake ETH on EigenLayer", "Opt-in to restaking", "Maintain position for 90 days", "Delegate to operator"],
    deadline: null,
    active: true,
  },
];

// ─── Campaign Listing ───────────────────────────────────────────────────────

export function getActiveCampaigns(): AirdropCampaign[] {
  return CAMPAIGNS.filter((c) => c.active);
}

export function getCampaignById(id: string): AirdropCampaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

// ─── Progress Tracking ──────────────────────────────────────────────────────

export async function getAirdropProgress(address: string): Promise<AirdropProgress[]> {
  const campaigns = getActiveCampaigns();
  const progressList: AirdropProgress[] = [];

  for (const campaign of campaigns) {
    // Try to fetch from DB
    let record: any;
    try {
      record = await prisma.airdropProgress.findUnique({
        where: {
          address_campaignId: { address, campaignId: campaign.id },
        },
      });
    } catch {
      record = null;
    }

    const stepsDone: string[] = record?.stepsDone || [];
    const stepsCompleted = stepsDone.length;

    progressList.push({
      campaignId: campaign.id,
      campaignName: campaign.name,
      stepsCompleted,
      totalSteps: campaign.totalSteps,
      stepsDone,
      progress: Math.round((stepsCompleted / campaign.totalSteps) * 100),
      estimatedReward: campaign.estimatedRange,
    });
  }

  return progressList;
}

/**
 * Mark an airdrop step as completed for a user.
 */
export async function completeAirdropStep(
  address: string,
  campaignId: string,
  stepName: string
): Promise<AirdropProgress | null> {
  const campaign = getCampaignById(campaignId);
  if (!campaign) return null;
  if (!campaign.steps.includes(stepName)) return null;

  try {
    // Upsert progress
    const existing = await prisma.airdropProgress.findUnique({
      where: { address_campaignId: { address, campaignId } },
    });

    const currentSteps: string[] = (existing?.stepsDone as string[]) || [];
    if (currentSteps.includes(stepName)) {
      // Already done
      return {
        campaignId,
        campaignName: campaign.name,
        stepsCompleted: currentSteps.length,
        totalSteps: campaign.totalSteps,
        stepsDone: currentSteps,
        progress: Math.round((currentSteps.length / campaign.totalSteps) * 100),
        estimatedReward: campaign.estimatedRange,
      };
    }

    const newSteps = [...currentSteps, stepName];
    const completedAt = newSteps.length >= campaign.totalSteps ? new Date() : null;

    await prisma.airdropProgress.upsert({
      where: { address_campaignId: { address, campaignId } },
      create: {
        address,
        campaignId,
        stepsDone: newSteps,
        completedAt,
      },
      update: {
        stepsDone: newSteps,
        completedAt,
      },
    });

    return {
      campaignId,
      campaignName: campaign.name,
      stepsCompleted: newSteps.length,
      totalSteps: campaign.totalSteps,
      stepsDone: newSteps,
      progress: Math.round((newSteps.length / campaign.totalSteps) * 100),
      estimatedReward: campaign.estimatedRange,
    };
  } catch (err) {
    console.error("[airdrops] completeStep error:", err);
    return null;
  }
}

/**
 * Check if wallet is eligible for each active campaign.
 * In production, this would check on-chain activity.
 */
export async function checkEligibility(
  address: string
): Promise<Array<{ campaignId: string; eligible: boolean; reason: string }>> {
  const campaigns = getActiveCampaigns();
  return campaigns.map((c) => ({
    campaignId: c.id,
    eligible: true, // On testnet, all wallets are eligible
    reason: "Wallet connected to Initia testnet — eligible for all campaigns",
  }));
}
