import { useState, useCallback } from 'react';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { encodeFunctionData, parseUnits } from 'viem';
import { CHAIN_ID, CONTRACT_ADDRESS, NATIVE_DECIMALS } from '../lib/config';

const routerAbi = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'riskScore', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'updateRiskScore',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newScore', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'enableAutopilot',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'enabled', type: 'bool' }],
    outputs: [],
  },
  {
    name: 'registerSessionKey',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'key', type: 'address' }],
    outputs: [],
  },
  {
    name: 'revokeSessionKey',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

type TxStatus = 'idle' | 'pending' | 'success' | 'error';

function buildMsgCall(sender: string, input: `0x${string}`, value = '0') {
  return {
    chainId: CHAIN_ID,
    messages: [
      {
        typeUrl: '/minievm.evm.v1.MsgCall',
        value: {
          sender: sender.toLowerCase(),
          contractAddr: CONTRACT_ADDRESS,
          input,
          value,
          accessList: [],
          authList: [],
        },
      },
    ],
  };
}

/**
 * All-in-one hook for executing real Initia transactions via InterwovenKit.
 * Uses requestTxBlock for auto-signing support.
 */
export function useInitiaTx() {
  const { initiaAddress, requestTxBlock } = useInterwovenKit() as any;
  const [status, setStatus] = useState<TxStatus>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (input: `0x${string}`, value?: string) => {
      if (!requestTxBlock || !initiaAddress) {
        setError('Wallet not connected');
        return null;
      }
      setStatus('pending');
      setError(null);
      setLastTxHash(null);
      try {
        const payload = buildMsgCall(initiaAddress, input, value ?? '0');
        const result = await requestTxBlock(payload);
        const hash = result?.txHash || result?.hash || null;
        setLastTxHash(hash);
        setStatus('success');
        return hash;
      } catch (err: any) {
        console.error('[useInitiaTx] Error:', err);
        setError(err?.message || 'Transaction failed');
        setStatus('error');
        return null;
      }
    },
    [requestTxBlock, initiaAddress]
  );

  const deposit = useCallback(
    async (amountStr: string, riskScore: number) => {
      const data = encodeFunctionData({
        abi: routerAbi,
        functionName: 'deposit',
        args: [riskScore],
      });
      const value = parseUnits(amountStr || '0', NATIVE_DECIMALS).toString();
      return execute(data, value);
    },
    [execute]
  );

  const withdraw = useCallback(
    async (amountStr: string) => {
      const parsed = parseUnits(amountStr || '0', NATIVE_DECIMALS);
      const data = encodeFunctionData({
        abi: routerAbi,
        functionName: 'withdraw',
        args: [parsed],
      });
      return execute(data);
    },
    [execute]
  );

  const updateRisk = useCallback(
    async (newScore: number) => {
      const data = encodeFunctionData({
        abi: routerAbi,
        functionName: 'updateRiskScore',
        args: [newScore],
      });
      return execute(data);
    },
    [execute]
  );

  const enableAutopilot = useCallback(
    async (enabled: boolean) => {
      const data = encodeFunctionData({
        abi: routerAbi,
        functionName: 'enableAutopilot',
        args: [enabled],
      });
      return execute(data);
    },
    [execute]
  );

  const registerSessionKey = useCallback(
    async (keyAddress: `0x${string}`) => {
      const data = encodeFunctionData({
        abi: routerAbi,
        functionName: 'registerSessionKey',
        args: [keyAddress],
      });
      return execute(data);
    },
    [execute]
  );

  const revokeSessionKey = useCallback(async () => {
    const data = encodeFunctionData({
      abi: routerAbi,
      functionName: 'revokeSessionKey',
      args: [],
    });
    return execute(data);
  }, [execute]);

  return {
    status,
    lastTxHash,
    error,
    deposit,
    withdraw,
    updateRisk,
    enableAutopilot,
    registerSessionKey,
    revokeSessionKey,
    execute,
    isConnected: Boolean(initiaAddress),
    address: initiaAddress,
  };
}
