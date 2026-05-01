import { useQuery } from '@tanstack/react-query';
import { REST_URL, NATIVE_DENOM, NATIVE_DECIMALS } from '../lib/config';
import { formatUnits } from 'viem';

export interface BalanceInfo {
  raw: bigint;
  formatted: number;
  denom: string;
}

/**
 * Fetches the real on-chain balance for a given Initia address
 * from the Initia REST endpoint (cosmos bank module).
 */
export function useInitiaBalance(initiaAddress?: string) {
  return useQuery<BalanceInfo>({
    queryKey: ['initia-balance', initiaAddress],
    enabled: Boolean(initiaAddress),
    queryFn: async () => {
      if (!initiaAddress) {
        return { raw: 0n, formatted: 0, denom: NATIVE_DENOM };
      }
      try {
        const res = await fetch(
          `${REST_URL}/cosmos/bank/v1beta1/balances/${initiaAddress}`
        );
        if (!res.ok) throw new Error(`REST error: ${res.status}`);
        const data = await res.json();
        const balances: Array<{ denom: string; amount: string }> = data?.balances ?? [];
        const denomCandidates = [NATIVE_DENOM, 'uinit', 'INIT', 'init'];
        const entry = balances.find((b) => denomCandidates.includes(b.denom));
        const rawAmount = BigInt(entry?.amount ?? '0');
        return {
          raw: rawAmount,
          formatted: Number(formatUnits(rawAmount, NATIVE_DECIMALS)),
          denom: NATIVE_DENOM,
        };
      } catch (err) {
        console.warn('[useInitiaBalance] Failed to fetch balance:', err);
        return { raw: 0n, formatted: 0, denom: NATIVE_DENOM };
      }
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}
