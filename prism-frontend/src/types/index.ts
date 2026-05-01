export type Route =
  | 'guide'
  | 'feed'
  | 'execute'
  | 'autopilot'
  | 'leaderboard'
  | 'architecture';

export type StrategyType = 'lend' | 'lp' | 'stake' | 'swap';

export type Opportunity = {
  id: string;
  protocolName: string;
  protocolAddress?: `0x${string}`;
  strategyType: StrategyType;
  apy: number;
  tvl: number;
  riskScore: number;
  tokenSymbol: string;
  minDeposit: number;
  description: string;
  gradient?: string;
};

export type Position = {
  totalDeployed: number;
  currentValue: number;
  riskScore: number;
  updatedAt: string;
};

export type PositionResponse = {
  position: Position | null;
  strategies: Array<{
    id: string;
    protocolName: string;
    strategyType: StrategyType;
    allocation: number;
    currentValue: number;
  }>;
};

export type PortfolioPoint = {
  date: string;
  value: number;
};

export type TxItem = {
  hash: string;
  type: string;
  amount: string;
  timestamp: string;
};

export type PortfolioResponse = {
  totalDeployed: number;
  currentValue: number;
  pnl: number;
  points: PortfolioPoint[];
  txHistory: TxItem[];
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  totalReturn: number;
  riskScore: number;
  totalValue: number;
  strategy: string;
  wallet?: string;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
};

export type StrategyAllocation = {
  id: string;
  opportunityId: string;
  allocation: number;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
  txHash?: string;
};
