// ─── Shared Type Definitions for IAE Backend ────────────────────────────────

/** Raw balance entry from Initia REST */
export interface CoinBalance {
  denom: string;
  amount: string;
}

/** Parsed transaction record from Initia REST */
export interface TxRecord {
  hash: string;
  type: string;     // "deposit" | "withdraw" | "claim" | "rebalance"
  amount: number;
  denom: string;
  timestamp: string;
  blockHeight: number;
}

/** On-chain position returned by contractReader */
export interface Position {
  userAddress: string;
  totalDeposited: bigint;
  currentValue: bigint;
  riskScore: number;
  lastTxHash: string | null;
}

/** Individual strategy allocation from contract */
export interface StrategyAllocation {
  protocolAddress: string;
  strategyType: string;
  allocatedAmount: bigint;
  currentValue: bigint;
  isActive: boolean;
}

/** Portfolio response aggregated from DB + chain */
export interface PortfolioResponse {
  address: string;
  initUsername: string | null;
  totalDeposited: number;
  currentValue: number;
  totalReturn: number;
  strategies: PortfolioStrategy[];
  txHistory: TxRecord[];
}

export interface PortfolioStrategy {
  protocol: string;
  type: string;
  apy: number;
  allocation: number;
  value: number;
}

/** Portfolio asset (EVM balance) */
export interface PortfolioAsset {
  symbol: string;
  address: string;
  balance: string;
  balanceUSD: number;
  decimals: number;
  price: number;
  change24h: number;
}

/** Staking position */
export interface StakePosition {
  stakedAmount: string;
  stakedAmountUSD: number;
  pendingRewards: string;
  pendingRewardsUSD: number;
  apy: number;
  strategy: string;
  since: string;
}

/** Airdrop campaign */
export interface AirdropCampaign {
  id: string;
  name: string;
  tag: string;
  estimatedRange: string;
  difficulty: string;
  totalSteps: number;
  steps: string[];
  deadline: string | null;
  active: boolean;
}

/** Airdrop progress for a user */
export interface AirdropProgress {
  campaignId: string;
  campaignName: string;
  stepsCompleted: number;
  totalSteps: number;
  stepsDone: string[];
  progress: number;
  estimatedReward: string;
}

/** Bridge request */
export interface BridgeRequest {
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
}

/** Bridge status */
export interface BridgeStatus {
  txHash: string;
  status: "pending" | "confirming" | "completed" | "failed";
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  createdAt: string;
  completedAt: string | null;
}

/** Session key */
export interface SessionKey {
  sessionId: string;
  ownerAddress: string;
  delegateAddress: string;
  permissions: string[];
  expiresAt: string;
  maxTxValue: string;
}

/** AI Insight */
export interface AIInsight {
  type: "idle_funds" | "airdrop_eligible" | "market_opportunity" | "strategy";
  icon: string;
  text: string;
  link: string;
  color: string;
  priority: number;
}

/** Opportunity feed item */
export interface OpportunityFeedItem {
  id: string;
  type: "airdrop" | "yield" | "token" | "stake";
  badge: string;
  name: string;
  protocol: string;
  range: string;
  difficulty: string;
  apy: number | null;
  risk: string;
  progress: number | null;
  deadline: string | null;
  source: string;
}

/** Leaderboard query params */
export interface LeaderboardQuery {
  limit?: number;
  offset?: number;
}

/** Opportunities query params */
export interface OpportunityQuery {
  riskScore?: number;
  type?: string;
  sort?: string;
  limit?: number;
}

/** Health check response */
export interface HealthStatus {
  status: "ok" | "degraded" | "error";
  db: "connected" | "disconnected";
  chain: "reachable" | "unreachable";
  timestamp: string;
  uptime: number;
}

/** DEX pool from Initia REST API */
export interface InitiaDexPool {
  pool_id: string;
  pool_type: string;
  coin_a: { denom: string; amount: string };
  coin_b: { denom: string; amount: string };
  total_share: { denom: string; amount: string };
  swap_fee_rate: string;
}

/** Error response envelope */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/** WebSocket event */
export interface WsEvent {
  type: string;
  payload: unknown;
  timestamp: string;
}
