import { encodeFunctionData, parseUnits } from 'viem';
import { routerAbi, toMsgCall } from '../lib/tx';
import { NATIVE_DECIMALS } from '../lib/config';

type RequestTxBlock = (payload: any) => Promise<{ txHash?: string }>;

export function useContract(requestTxBlock?: RequestTxBlock, initiaAddress?: string) {
  const submitDeposit = async (amount: string, riskScore: number) => {
    if (!requestTxBlock || !initiaAddress) return null;
    const data = encodeFunctionData({
      abi: routerAbi,
      functionName: 'deposit',
      args: [riskScore],
    });

    const value = parseUnits(amount || '0', NATIVE_DECIMALS).toString();
    return requestTxBlock(toMsgCall(initiaAddress, data, value));
  };

  const withdraw = async (amount: string) => {
    if (!requestTxBlock || !initiaAddress) return null;
    const parsed = parseUnits(amount || '0', NATIVE_DECIMALS);
    const data = encodeFunctionData({ abi: routerAbi, functionName: 'withdraw', args: [parsed] });
    return requestTxBlock(toMsgCall(initiaAddress, data));
  };

  const updateRisk = async (newScore: number) => {
    if (!requestTxBlock || !initiaAddress) return null;
    const data = encodeFunctionData({ abi: routerAbi, functionName: 'updateRiskScore', args: [newScore] });
    return requestTxBlock(toMsgCall(initiaAddress, data));
  };

  return { submitDeposit, withdraw, updateRisk };
}
