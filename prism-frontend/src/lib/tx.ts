import { CHAIN_ID, CONTRACT_ADDRESS } from "./config";

export const routerAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "riskScore", type: "uint8" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "updateRiskScore",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "newScore", type: "uint8" }],
  },
] as const;

export function toMsgCall(sender: string, input: `0x${string}`, value = "0") {
  const normalizedSender = sender.toLowerCase();
  return {
    chainId: CHAIN_ID,
    messages: [
      {
        typeUrl: "/minievm.evm.v1.MsgCall",
        value: {
          sender: normalizedSender,
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
