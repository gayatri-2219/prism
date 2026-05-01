import { useQuery } from '@tanstack/react-query';
import type { PositionResponse } from '../types';
import { API_URL as API_BASE } from '../lib/config';

export function usePosition(address?: string, evmAddress?: string) {
  return useQuery<PositionResponse>({
    queryKey: ['position', address, evmAddress],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) throw new Error('Wallet address is required');
      const params = new URLSearchParams();
      if (evmAddress) params.set('evmAddress', evmAddress);
      const endpoint = `${API_BASE}/api/positions/${address}${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch positions');
      const data = await res.json();
      return {
        position: data?.position
          ? {
              totalDeployed: data.position.totalDeposited ?? 0,
              currentValue: data.position.currentValue ?? 0,
              riskScore: data.position.riskScore ?? 0,
              updatedAt: data.position.lastUpdated ?? new Date().toISOString(),
            }
          : null,
        strategies: (data?.strategies ?? []).map((item: any, idx: number) => ({
          id: item.id ?? `s-${idx}`,
          protocolName: item.protocolAddress ?? item.strategyType ?? 'Strategy',
          strategyType: item.strategyType ?? 'lend',
          allocation: Number(item.allocatedAmount ?? 0),
          currentValue: Number(item.currentValue ?? 0),
        })),
      };
    },
    staleTime: 8_000,
    refetchInterval: 8_000,
  });
}
