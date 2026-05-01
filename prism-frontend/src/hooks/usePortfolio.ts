import { useQuery } from '@tanstack/react-query';
import type { PortfolioResponse } from '../types';
import { API_URL as API_BASE } from '../lib/config';

export function usePortfolio(address?: string, evmAddress?: string) {
  return useQuery<PortfolioResponse>({
    queryKey: ['portfolio', address, evmAddress],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) throw new Error('Wallet address is required');
      const params = new URLSearchParams();
      if (evmAddress) params.set('evmAddress', evmAddress);
      const endpoint = `${API_BASE}/api/portfolio/${address}${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const data = await res.json();
      const txHistory = (data?.txHistory ?? []).map((tx: any) => ({
        hash: tx.hash,
        type: tx.type ?? 'Unknown',
        amount:
          typeof tx.amount === 'number'
            ? `${tx.amount} ${tx.denom ?? ''}`.trim()
            : String(tx.amount ?? '0'),
        timestamp: tx.timestamp ?? new Date().toISOString(),
      }));
      const totalDeployed = Number(data?.totalDeposited ?? 0);
      const currentValue = Number(data?.currentValue ?? 0);
      const pnl = Number(data?.totalReturn ?? 0);
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        totalDeployed,
        currentValue,
        pnl,
        points: [{ date: now, value: currentValue }],
        txHistory,
      };
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
  });
}
