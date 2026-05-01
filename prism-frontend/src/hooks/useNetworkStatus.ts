import { useQuery } from '@tanstack/react-query';

const REST_URL = import.meta.env.VITE_REST_URL ?? 'https://rest.testnet.initia.xyz';

export interface NetworkInfo {
  online: boolean;
  latestBlock: number;
  chainId: string;
  latency: number; // ms
}

/**
 * Pings the Initia REST API to check if the network is online
 * and returns the latest block height.
 */
export function useNetworkStatus() {
  return useQuery<NetworkInfo>({
    queryKey: ['network-status'],
    queryFn: async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${REST_URL}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        const latency = Math.round(performance.now() - t0);
        if (!res.ok) {
          return { online: false, latestBlock: 0, chainId: '', latency };
        }
        const data = await res.json();
        const height = Number(data?.block?.header?.height ?? 0);
        const chainId = data?.block?.header?.chain_id ?? '';
        return { online: true, latestBlock: height, chainId, latency };
      } catch {
        return { online: false, latestBlock: 0, chainId: '', latency: Math.round(performance.now() - t0) };
      }
    },
    staleTime: 6_000,
    refetchInterval: 6_000,
  });
}
