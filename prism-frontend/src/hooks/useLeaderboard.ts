import { useQuery } from '@tanstack/react-query';
import type { LeaderboardResponse } from '../types';
import { API_URL as API_BASE } from '../lib/config';

export function useLeaderboard() {
  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/leaderboard?limit=20&offset=0`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      const entries = (data?.entries ?? []).map((entry: any) => ({
        rank: entry.rank,
        username: entry.initUsername ? `${entry.initUsername}.init` : entry.userAddress,
        totalReturn: entry.totalReturn,
        riskScore: entry.riskScore,
        totalValue: entry.totalValue ?? 0,
        strategy: entry.strategyLabel,
        wallet: entry.userAddress,
      }));
      return { entries };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
