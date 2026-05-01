/**
 * AI Insights Engine
 * Calls Claude API with portfolio context to generate actionable insights.
 * Responses are cached in Redis for 5 minutes.
 */

import axios from "axios";
import { config } from "../config";
import { cacheGetJson, cacheSetJson } from "./cache";
import { AIInsight } from "../types";
import { getBalance } from "./initiaRPC";
import { PrismaClient } from "@prisma/client";

const CACHE_PREFIX = "ai:insights:";
const prisma = new PrismaClient();

/**
 * Generate AI insights for a given wallet address.
 */
export async function getInsights(address: string): Promise<AIInsight[]> {
  // Check cache first
  const cacheKey = `${CACHE_PREFIX}${address.toLowerCase()}`;
  const cached = await cacheGetJson<AIInsight[]>(cacheKey);
  if (cached) return cached;

  // Fetch on-chain context
  let balanceContext = "No balance data available";
  let balances: Array<{ denom: string; amount: string }> = [];
  try {
    balances = await getBalance(address);
    if (balances.length > 0) {
      balanceContext = balances
        .map((b) => `${b.denom}: ${b.amount}`)
        .join(", ");
    }
  } catch {
    // use default
  }

  // Free local mode: no paid AI key required.
  if (!config.anthropicApiKey) {
    const localInsights = await getLocalInsights(address, balances);
    await cacheSetJson(cacheKey, localInsights, config.insightsCacheTtl);
    return localInsights;
  }

  // Call Claude API
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `You are PRISM AI, a DeFi strategy engine on Initia Chain. Given the user's portfolio, return EXACTLY 3 insights as a JSON array. Each insight must have: type (one of: idle_funds, airdrop_eligible, market_opportunity, strategy), icon (emoji), text (1 sentence, specific with numbers), link (action text with →), color (hex background color), priority (1-3). Be specific and actionable. Respond ONLY with the JSON array, no other text.`,
        messages: [
          {
            role: "user",
            content: `Wallet: ${address}\nBalances: ${balanceContext}\nChain: Initia Testnet\nGenerate 3 personalized insights.`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        timeout: 15000,
      }
    );

    const content = response.data.content?.[0]?.text || "[]";
    try {
      const insights: AIInsight[] = JSON.parse(content);
      await cacheSetJson(cacheKey, insights, config.insightsCacheTtl);
      return insights;
    } catch {
      throw new Error("Invalid AI response format");
    }
  } catch (err) {
    console.error("[ai] Claude API call failed:", err);
    throw new Error("Live AI insights unavailable");
  }
}

/**
 * Chat with PRISM AI — free-form query with portfolio context.
 */
export async function chatWithAI(
  address: string,
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  let balanceContext = "";
  try {
    const balances = await getBalance(address);
    balanceContext = balances.map((b) => `${b.denom}: ${b.amount}`).join(", ");
  } catch {
    balanceContext = "Unable to fetch balances";
  }

  if (!config.anthropicApiKey) {
    return getLocalChatResponse(message, balanceContext);
  }

  try {
    const messages = [
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are PRISM, an expert AI-powered DeFi strategy engine built on Initia Chain. The user's wallet is ${address} with balances: ${balanceContext}. 
Your goal is to be extremely helpful, conversational, and precise.
CRITICAL RULES:
1. Provide concise, actionable DeFi insights including staking, airdrops, yield farming, and portfolio optimization.
2. Always be specific with numbers and strategies. Keep responses under 150 words.
3. If the user's balance is 0 (or they ask how much to add), strongly recommend they bridge or deposit at least 10 INIT (approx $15) to comfortably cover gas fees, start earning 6.2% APY in staking, and qualify for the Initia Genesis Airdrop.
4. Explain technical concepts (like Session Keys or Auto-Signing) simply if asked.`,
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        timeout: 15000,
      }
    );

    return response.data.content?.[0]?.text || "Unable to generate response.";
  } catch (err) {
    console.error("[ai] Chat failed:", err);
    return getLocalChatResponse(message, balanceContext);
  }
}

async function getLocalInsights(
  address: string,
  balances: Array<{ denom: string; amount: string }>
): Promise<AIInsight[]> {
  const parsed = balances.map((b) => {
    const raw = Number(b.amount || 0);
    const normalized = b.denom.startsWith("u") ? raw / 1e6 : raw / 1e18;
    return { ...b, normalized: Number.isFinite(normalized) ? normalized : 0 };
  });
  const total = parsed.reduce((sum, b) => sum + b.normalized, 0);

  let topOpportunities: Array<{ protocolName: string; apy: number; strategyType: string }> = [];
  try {
    topOpportunities = await prisma.opportunity.findMany({
      where: { isActive: true },
      orderBy: { apy: "desc" },
      take: 2,
      select: { protocolName: true, apy: true, strategyType: true },
    });
  } catch {
    topOpportunities = [];
  }

  const best = topOpportunities[0];
  const second = topOpportunities[1];
  const totalLabel = total > 0 ? `${total.toFixed(2)} tokens` : "no visible balance";

  return [
    {
      type: "idle_funds",
      icon: "💼",
      text:
        total > 0
          ? `Detected ${totalLabel} in wallet. Start with 20-40% allocation to reduce idle capital risk.`
          : "No funded balance detected yet. Bridge a starter amount to begin earning yield.",
      link: "Open Dashboard →",
      color: "#eef2ff",
      priority: 1,
    },
    {
      type: "market_opportunity",
      icon: "📈",
      text: best
        ? `${best.protocolName} (${best.strategyType}) currently leads at ${best.apy.toFixed(2)}% APY from live opportunity feed.`
        : "No live opportunities available from backend feed right now.",
      link: "View Opportunities →",
      color: "#e0f2fe",
      priority: 2,
    },
    {
      type: "strategy",
      icon: "🧭",
      text: second
        ? `Compare top two yields before execution: ${best?.apy.toFixed(2)}% vs ${second.apy.toFixed(2)}%.`
        : "Track active airdrop steps and use low-risk first execution while liquidity builds.",
      link: "Plan Allocation →",
      color: "#f0fdf4",
      priority: 3,
    },
  ];
}

function getLocalChatResponse(message: string, balanceContext: string): string {
  const lower = message.toLowerCase();
  const hasNoBalanceHint =
    balanceContext.toLowerCase().includes("unable") ||
    balanceContext.toLowerCase().includes("no balance") ||
    balanceContext.trim().length === 0;

  if (lower.includes("airdrop")) {
    return "Airdrop mode: connect wallet, then complete campaign steps in Discover. Prioritize bridge + first swap steps because they unlock most campaign eligibility.";
  }
  if (lower.includes("yield") || lower.includes("apy") || lower.includes("invest")) {
    return "For idle crypto, start conservatively: allocate 30% first, monitor 24h, then scale to 60-70% if execution and slippage stay healthy. Use highest APY opportunities only if risk score matches your tolerance.";
  }
  if (lower.includes("how much") || lower.includes("start")) {
    return hasNoBalanceHint
      ? "Start with a small test amount first so you can validate fees, bridge flow, and confirmation speed before larger deposits."
      : `Current balance snapshot: ${balanceContext}. A practical start is 20-40% allocation, then increase after first successful cycle.`;
  }

  return hasNoBalanceHint
    ? "Local AI mode is active (free). Connect and fund wallet, then I can guide allocation, airdrop steps, and execution flow."
    : `Local AI mode is active (free). Balance snapshot: ${balanceContext}. Ask me for allocation split, risk tuning, or airdrop action priority.`;
}
