import type { Address } from "viem";

export type Route =
  | "guide"
  | "feed"
  | "execute"
  | "autopilot"
  | "leaderboard"
  | "architecture";

export const ROUTES: Route[] = [
  "guide",
  "feed",
  "execute",
  "autopilot",
  "leaderboard",
  "architecture",
];

export type Opportunity = {
  id: string;
  protocolName: string;
  protocolAddress: Address;
  strategyType: "lend" | "lp" | "stake" | "swap" | string;
  apy: number;
  tvl: number;
  riskScore: number;
  description: string;
};

export type PositionResponse = {
  position: {
    totalDeposited: number;
    currentValue: number;
    riskScore: number;
  } | null;
  strategies: Array<{
    id?: string;
    strategyType: string;
    allocatedAmount: number;
    currentValue: number;
  }>;
};

export type PortfolioResponse = {
  totalDeposited: number;
  currentValue: number;
  totalReturn: number;
  strategies?: Array<{ strategyType: string; allocatedAmount: number; currentValue: number }>;
  txHistory: Array<{
    hash: string;
    type: string;
    amount: string;
    timestamp: string;
  }>;
};

export type LeaderboardResponse = {
  entries: Array<{
    id: string;
    userAddress: string;
    initUsername?: string | null;
    strategyLabel: string;
    totalReturn: number;
    riskScore: number;
    rank: number;
  }>;
};

export type StrategyRow = {
  opportunityId: string;
  allocation: number;
};
