import { useQuery } from '@tanstack/react-query';
import { CONTRACT_ADDRESS, NATIVE_DECIMALS } from '../lib/config';
import { formatUnits } from 'viem';

const JSON_RPC_URLS = [
  import.meta.env.VITE_JSON_RPC_URL ?? '',
  'https://json-rpc.testnet.initia.xyz',
  'https://evm-rpc.testnet.initia.xyz',
].filter(Boolean);

// ABI: positionOf(address) => (uint256 totalDeposited, uint256 totalWithdrawn, uint8 riskScore, uint64 lastUpdated, uint8 strategyCount, bool autopilotEnabled)
// Function selector: positionOf(address) = keccak256("positionOf(address)")[0:4]
const POSITION_OF_SELECTOR = '0xfd2d39c5'; // positionOf(address)
const TVL_SELECTOR = '0xec18154e'; // totalValueLocked()

function padAddress(addr: string): string {
  return '0x' + addr.replace('0x', '').toLowerCase().padStart(64, '0');
}

export interface OnChainPosition {
  totalDeposited: number;
  totalWithdrawn: number;
  riskScore: number;
  lastUpdated: number;
  strategyCount: number;
  autopilotEnabled: boolean;
  currentBalance: number;
}

async function ethCall(to: string, data: string): Promise<string> {
  let lastError: any;
  for (const url of JSON_RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to, data }, 'latest'],
          id: 1,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.result ?? '0x';
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('All RPC endpoints failed');
}

function decodeUint256(hex: string, offset: number): bigint {
  const chunk = hex.slice(2 + offset * 64, 2 + (offset + 1) * 64);
  if (!chunk || chunk.length === 0) return 0n;
  return BigInt('0x' + chunk);
}

/**
 * Fetch the user's on-chain position directly from the IAERouter contract.
 */
export function useContractPosition(evmAddress?: string) {
  return useQuery<OnChainPosition | null>({
    queryKey: ['contract-position', evmAddress],
    enabled: Boolean(evmAddress),
    queryFn: async () => {
      if (!evmAddress) return null;
      try {
        const calldata = POSITION_OF_SELECTOR + padAddress(evmAddress).slice(2);
        const result = await ethCall(CONTRACT_ADDRESS, calldata);

        if (!result || result === '0x' || result.length < 66) return null;

        const totalDeposited = decodeUint256(result, 0);
        const totalWithdrawn = decodeUint256(result, 1);
        const riskScore = Number(decodeUint256(result, 2));
        const lastUpdated = Number(decodeUint256(result, 3));
        const strategyCount = Number(decodeUint256(result, 4));
        const autopilotEnabled = decodeUint256(result, 5) !== 0n;

        const depositedNum = Number(formatUnits(totalDeposited, NATIVE_DECIMALS));
        const withdrawnNum = Number(formatUnits(totalWithdrawn, NATIVE_DECIMALS));

        return {
          totalDeposited: depositedNum,
          totalWithdrawn: withdrawnNum,
          riskScore,
          lastUpdated,
          strategyCount,
          autopilotEnabled,
          currentBalance: depositedNum - withdrawnNum,
        };
      } catch (err) {
        console.warn('[useContractPosition] Failed:', err);
        return null;
      }
    },
    staleTime: 8_000,
    refetchInterval: 8_000,
  });
}

/**
 * Fetch the total value locked in the contract.
 */
export function useTVL() {
  return useQuery<number>({
    queryKey: ['tvl'],
    queryFn: async () => {
      try {
        const result = await ethCall(CONTRACT_ADDRESS, TVL_SELECTOR);
        if (!result || result === '0x') return 0;
        const raw = BigInt(result);
        return Number(formatUnits(raw, NATIVE_DECIMALS));
      } catch {
        return 0;
      }
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}
