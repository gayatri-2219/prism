import { useQuery } from '@tanstack/react-query';

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL ?? 'https://indexer.testnet.initia.xyz';
const REST_URL = import.meta.env.VITE_REST_URL ?? 'https://rest.testnet.initia.xyz';

export interface TxHistoryItem {
  hash: string;
  type: string;
  height: number;
  timestamp: string;
  success: boolean;
}

/**
 * Fetches real transaction history for an address from the Initia REST API.
 */
export function useInitiaTxHistory(initiaAddress?: string) {
  return useQuery<TxHistoryItem[]>({
    queryKey: ['tx-history', initiaAddress],
    enabled: Boolean(initiaAddress),
    queryFn: async () => {
      if (!initiaAddress) return [];
      try {
        // Try REST API for tx search
        const senderUrl = `${REST_URL}/cosmos/tx/v1beta1/txs?events=message.sender='${initiaAddress}'&order_by=2&pagination.limit=10`;
        const res = await fetch(senderUrl);
        if (!res.ok) return [];
        const data = await res.json();
        const txs = (data?.tx_responses ?? []).map((tx: any) => {
          const msgs = tx.tx?.body?.messages ?? [];
          let type = 'Transaction';
          if (msgs.length > 0) {
            const typeUrl = msgs[0]?.['@type'] ?? msgs[0]?.typeUrl ?? '';
            if (typeUrl.includes('MsgCall')) type = 'Contract Call';
            else if (typeUrl.includes('MsgSend')) type = 'Transfer';
            else if (typeUrl.includes('MsgDelegate')) type = 'Delegate';
            else if (typeUrl.includes('MsgExecute')) type = 'Execute';
            else type = typeUrl.split('.').pop() || 'Transaction';
          }
          return {
            hash: tx.txhash,
            type,
            height: Number(tx.height ?? 0),
            timestamp: tx.timestamp ?? new Date().toISOString(),
            success: tx.code === 0,
          };
        });
        return txs;
      } catch (err) {
        console.warn('[useInitiaTxHistory] Failed:', err);
        return [];
      }
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}
