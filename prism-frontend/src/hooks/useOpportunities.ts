import { useQuery } from '@tanstack/react-query';
import type { Opportunity } from '../types';
import { API_URL as API_BASE } from '../lib/config';

export function useOpportunities() {
  return useQuery<{ opportunities: Opportunity[] }>({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/opportunities?limit=20`);
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      const data = await res.json();
      const opportunities = (data?.opportunities ?? []).map((item: any) => ({
        id: item.id,
        protocolName: item.protocolName ?? 'Protocol',
        protocolAddress: item.protocolAddress,
        strategyType: item.strategyType ?? 'lend',
        apy: Number(item.apy ?? 0),
        tvl: Number(item.tvl ?? 0),
        riskScore: Number(item.riskScore ?? 0),
        tokenSymbol: item.tokenSymbol ?? 'INIT',
        minDeposit: Number(item.minDeposit ?? 0),
        description: item.description ?? 'No description',
      }));
      return { opportunities };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
